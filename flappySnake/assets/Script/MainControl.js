// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
export const GameStatus = {
	Game_Ready: 0,
	Game_playing: 1,
	Game_over: 2
}
import AudioSourceControl from "./AudioSourceControl"
import { SoundType } from "./AudioSourceControl"
import { GameConfig } from "./GameConfig"
cc.Class({
	extends: cc.Component,

	properties: {
		labelScore: {
			default: null,
			type: cc.Label
		},
		topScore: {
			default: null,
			type: cc.Label
		},
		SpBg: {
			default: [],
			type: [cc.Sprite]
		},
		bricksPrefab: {
			default: null,
			type: cc.Prefab
		},
		bricks: {
			default: [],
			type: [cc.Node]
		},
		bodyPrefab: {
			default: null,
			type: cc.Prefab
		},
		body: {
			default: [],
			type: [cc.Node]
		},
		lifePrefab: {
			default: null,
			type: cc.Prefab
		},
		life: {
			default: null,
			type: cc.Sprite
		},
		gemPrefab: {
			default: null,
			type: cc.Prefab
		},
		gem: {
			default: null,
			type: cc.Sprite
		},
		spGameOver: {
			default: null,
			type: cc.Sprite
		},
		btnStart: {
			default: null,
			type: cc.Button
		},
		gameStatus: 0,
		gameScore: 0,
		audioControl: {
			default: null,
			type: AudioSourceControl
		},
		moveSpeed: 0
	},

	onLoad() {
		let collisionManager = cc.director.getCollisionManager();
		collisionManager.enabled = true;
		this.spGameOver = this.node.getChildByName("GameOver").getComponent(cc.Sprite);
		this.spGameOver.node.active = false;
		this.oldTopScore = +cc.sys.localStorage.getItem('topScore') || 0
		this.topScore.string = '最高纪录: ' + this.oldTopScore.toString();
		this.btnStart = this.node.getChildByName("BtnStart").getComponent(cc.Button);
		this.btnStart.node.on(cc.Node.EventType.TOUCH_END, this.touchStartBtn, this);
		this.audioControl = this.node.getChildByName("AudioSource").getComponent("AudioSourceControl");
	},

	start() {
		const C = GameConfig;
		this.minX = C.BRICK_BASE_X;
		this.minY = C.BRICK_Y_MIN;
		this.maxY = C.BRICK_Y_MAX;
		this.lifeMinY = C.LIFE_Y_MIN;
		this.lifeMaxY = C.LIFE_Y_MAX;
		this.gemMinY = C.GEM_Y_MIN;
		this.gemMaxY = C.GEM_Y_MAX;

		for (let i = 0; i < C.BRICK_COUNT; i++) {
			this.bricks[i] = cc.instantiate(this.bricksPrefab);
			this.node.getChildByName("Bricks").addChild(this.bricks[i]);
			this.bricks[i].x = this.minX * i + Math.random() * C.BRICK_RANDOM_X;
			this.bricks[i].y = this.minY + Math.random() * (this.maxY - this.minY);
		}

		this.life = cc.instantiate(this.lifePrefab);
		this.node.getChildByName("Life").addChild(this.life);
		this.life.x = C.LIFE_X_START;
		this.life.y = this.lifeMinY + Math.random() * (this.lifeMaxY - this.lifeMinY);

		this.gem = cc.instantiate(this.gemPrefab);
		this.node.getChildByName("Gem").addChild(this.gem);
		this.gem.x = C.GEM_X_START;
		this.gem.y = this.gemMinY + Math.random() * (this.gemMaxY - this.gemMinY);
	},

	update(dt) {
		if (this.gameStatus !== GameStatus.Game_playing) {
			return
		}
		const C = GameConfig;
		let moveWidth = C.MOVE_WIDTH
		let newMoveSpeed = this.moveSpeed + this.gameScore / C.SCORE_SPEED_DIV;
		if (newMoveSpeed > C.MOVE_SPEED_CAP) {
			newMoveSpeed = C.MOVE_SPEED_CAP
		}

		for (let i = 0; i < this.bricks.length; i++) {
			this.bricks[i].x -= newMoveSpeed;
			if (this.bricks[i].x <= C.BRICK_RESPAWN_X) {
				this.bricks[i].x = moveWidth;
				this.bricks[i].y = this.minY + Math.random() * (this.maxY - this.minY);
				this.gameScore += 1;
				this.labelScore.string = this.gameScore.toString();
			}
		}

		this.life.x -= newMoveSpeed;
		if (this.life.x <= C.ITEM_RECYCLE_X) {
			this.life.x = moveWidth;
			this.life.y = this.lifeMinY + Math.random() * (this.lifeMaxY - this.lifeMinY);
		}

		this.gem.x -= newMoveSpeed;
		if (this.gem.x <= C.ITEM_RECYCLE_X) {
			this.gem.x = moveWidth;
			this.gem.y = this.gemMinY + Math.random() * (this.gemMaxY - this.gemMinY);
		}
	},

	getBodys() {
		const C = GameConfig;
		let long = C.BODY_GAP
		for (let i = 0; i < C.BODY_INITIAL; i++) {
			this.body[i] = cc.instantiate(this.bodyPrefab);
			this.node.getChildByName("Body").addChild(this.body[i]);
			long -= C.BODY_GAP
			this.body[i].x = long
		}
	},

	touchStartBtn() {
		this.btnStart.node.active = false;
		this.topScore.node.active = false;
		this.gameStatus = GameStatus.Game_playing;
		this.spGameOver.node.active = false;
		for (let i = 0; i < this.bricks.length; i++) {
			this.bricks[i].x = this.minX * i;
			this.bricks[i].y = this.minY + Math.random() * (this.maxY - this.minY);
		}
		let bird = this.node.getChildByName("Bird");
		bird.y = GameConfig.BIRD_START_Y;
		this.gameScore = 0;
		this.moveSpeed = GameConfig.MOVE_SPEED_START;
		this.labelScore.string = this.gameScore.toString();
		this.getBodys();
	},

	gameOver() {
		let bird = this.node.getChildByName("Bird");
		if (bird) {
			let bc = bird.getComponent("BirdControl");
			if (bc && bc.clearGemTimer) {
				bc.clearGemTimer();
			}
		}
		this.spGameOver.node.active = true;
		this.btnStart.node.active = true;
		this.topScore.node.active = true;
		this.gameStatus = GameStatus.Game_over;
		this.audioControl.playSound(SoundType.E_Sound_Die);
		this.node.getChildByName("Body").removeAllChildren();
		this.body = [];
		if (this.gameScore > this.oldTopScore) {
			cc.sys.localStorage.setItem('topScore', this.gameScore);
			this.oldTopScore = this.gameScore
		}
		this.topScore.string = '最高纪录: ' + this.oldTopScore.toString();
	}
});
