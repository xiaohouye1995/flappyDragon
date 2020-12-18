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
		// 开启碰撞检测
		let collisionManager = cc.director.getCollisionManager();
		collisionManager.enabled = true;
		// 开启碰撞形状绘制
		// collisionManager.enabledDebugDraw = true;
		// 获得游戏结束的精灵
		this.spGameOver = this.node.getChildByName("GameOver").getComponent(cc.Sprite);
		// 游戏开始阶段隐藏起来
		this.spGameOver.node.active = false;
		// 获得最高纪录
		this.oldTopScore = +cc.sys.localStorage.getItem('topScore') || 0
		this.topScore.string = '最高纪录: ' + this.oldTopScore.toString();
		// 获取开始按钮
		this.btnStart = this.node.getChildByName("BtnStart").getComponent(cc.Button);
		// 给开始按钮添加响应
		this.btnStart.node.on(cc.Node.EventType.TOUCH_END, this.touchStartBtn, this);
		// 获取音频模块
		this.audioControl = this.node.getChildByName("AudioSource").getComponent("AudioSourceControl");		
	},

	start() {
		// 生成障碍物
		for (let i = 0; i < 3; i++) {
			this.bricks[i] = cc.instantiate(this.bricksPrefab);
			this.node.getChildByName("Bricks").addChild(this.bricks[i]);
			this.minX = 700;
			this.minY = -500;
			this.maxY = -100;
			this.bricks[i].x = this.minX * i + Math.random() * 200;
			this.bricks[i].y = this.minY + Math.random() * (this.maxY - this.minY);
		}
		
		// 生成奖励心心
		this.life = cc.instantiate(this.lifePrefab);
		this.node.getChildByName("Life").addChild(this.life);
		this.life.x = 570;
		this.lifeMinY = -500;
		this.lifeMaxY = 500;
		this.life.y = this.lifeMinY + Math.random() * (this.lifeMaxY - this.lifeMinY);
		
		// 生成保护盾钻石
		this.gem = cc.instantiate(this.gemPrefab);
		this.node.getChildByName("Gem").addChild(this.gem);
		this.gem.x = 770;
		this.gemMinY = -500;
		this.gemMaxY = 500;
		this.gem.y = this.gemMinY + Math.random() * (this.gemMaxY - this.gemMinY);
	},

	update(dt) {
		// 游戏状态不等于Game_playing时直接返回
		if (this.gameStatus !== GameStatus.Game_playing) {
			return
		}
		
		// 移动距离
		let moveWidth = 750
		// 移动速度
		let newMoveSpeed = this.moveSpeed + this.gameScore / 50;
		if (newMoveSpeed > 30) {
			newMoveSpeed = 30
		}

		// 移动背景图
		// for (let i = 0; i < this.SpBg.length; i++) {
		// 	this.SpBg[i].node.x -= newMoveSpeed;		
		// 	if (this.SpBg[i].node.x <= -700) {
		// 		this.SpBg[i].node.x = moveWidth;
		// 	}
		// }

		// 移动障碍物
		for (let i = 0; i < this.bricks.length; i++) {
			this.bricks[i].x -= newMoveSpeed;
			if (this.bricks[i].x <= -1300) {
				this.bricks[i].x = moveWidth;			
				this.bricks[i].y = this.minY + Math.random() * (this.maxY - this.minY);
				// 播放加分音效
				// this.audioControl.playSound(SoundType.E_Sound_Score);
				// 分数
				this.gameScore += 1;
				this.labelScore.string = this.gameScore.toString();
			}
		}
		
		// 移动奖励心心
		this.life.x -= newMoveSpeed;
		if (this.life.x <= -2750) {
			this.life.x = moveWidth;
			this.life.y = this.lifeMinY + Math.random() * (this.lifeMaxY - this.lifeMinY);
		}
		
		// 移动钻石
		this.gem.x -= newMoveSpeed;
		if (this.gem.x <= -2750) {
			this.gem.x = moveWidth;
			this.gem.y = this.lifeMinY + Math.random() * (this.lifeMaxY - this.lifeMinY);
		}
		
	},
	
	// 获取跟随者数组
	getBodys() {
		let long = 70
		for (let i = 0; i < 2; i++) {
			this.body[i] = cc.instantiate(this.bodyPrefab);
			this.node.getChildByName("Body").addChild(this.body[i]);
			long -= 70
			this.body[i].x = long
		}
	},
	
	touchStartBtn() {
		// 隐藏开始按钮
		this.btnStart.node.active = false;
		// 隐藏最高纪录
		this.topScore.node.active = false;
		// 游戏状态标记为Game_playing
		this.gameStatus = GameStatus.Game_playing;
		// 再来一局时，隐藏gameover图片
		this.spGameOver.node.active = false;
		// 再来一局时，障碍物重置位置
		for (let i = 0; i < this.bricks.length; i++) {
			this.bricks[i].x = this.minX * i;
			this.bricks[i].y = this.minY + Math.random() * (this.maxY - this.minY);
		}
		// 再来一局时，还原主角位置和角度
		let bird = this.node.getChildByName("Bird");
		bird.y = 100;
		// bird.rotation = 0;
		// 分数清零
		this.gameScore = 0;
		// 速度清零
		this.moveSpeed = 8;
		this.labelScore.string = this.gameScore.toString();
		this.getBodys();
	},
	
	gameOver() {
		// 游戏结束时，显示gameover
		this.spGameOver.node.active = true;
		// 游戏结束时，显示开始按钮
		this.btnStart.node.active = true;
		// 游戏结束时，显示最高纪录
		this.topScore.node.active = true;
		// 游戏状态标记为Game_over
		this.gameStatus = GameStatus.Game_over;
		// 播放结束音效
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
