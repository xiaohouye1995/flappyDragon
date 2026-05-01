// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import MainControl from "./MainControl"
import { GameStatus } from "./MainControl"
import { SoundType } from "./AudioSourceControl"
import { GameConfig } from "./GameConfig"
cc.Class({
	extends: cc.Component,
	properties: {
		speed: 0,
		mainControl: {
			default: null,
			type: MainControl
		},
		spShield: {
			default: null,
			type: cc.Sprite
		},
		gemStatus: false,
		time: null
	},

	onLoad() {
		cc.Canvas.instance.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
		this.mainControl = cc.Canvas.instance.node.getComponent("MainControl");
		this.spShield = this.node.getChildByName("Shield");
		this.spShield.active = false;
	},

	start() {
	},

	_restoreMoveSpeedFromStorage() {
		const C = GameConfig;
		const raw = cc.sys.localStorage.getItem('moveSpeed');
		let v = raw === null || raw === '' ? C.MOVE_SPEED_START : parseFloat(raw);
		if (isNaN(v)) {
			v = C.MOVE_SPEED_START;
		}
		this.mainControl.moveSpeed = v;
	},

	clearGemTimer() {
		const hadGemEffect = !!(this.time || this.gemStatus);
		if (this.time) {
			clearTimeout(this.time);
			this.time = null;
		}
		this.gemStatus = false;
		if (this.spShield) {
			this.spShield.active = false;
		}
		if (hadGemEffect && this.mainControl) {
			this._restoreMoveSpeedFromStorage();
		}
	},

	update(dt) {
		if (this.mainControl.gameStatus !== GameStatus.Game_playing) {
			return
		}
		const C = GameConfig;
		if (this.gemStatus) {
			this.node.y = 0;
		} else {
			this.speed -= C.GRAVITY_STEP;
			this.node.y += this.speed;
		}

		if (this.node.y >= C.SCREEN_Y_HALF || this.node.y <= -C.SCREEN_Y_HALF) {
			this.mainControl.gameOver();
			this.speed = 0;
			this.spShield.active = false;
		}

		for (var i = 0; i < this.mainControl.body.length; i++) {
			if (i === 0) {
				this.mainControl.body[i].y = this.node.y - (this.node.y - this.mainControl.body[i].y) * .9;
			} else {
				this.mainControl.body[i].y = this.mainControl.body[i - 1].y - (this.mainControl.body[i - 1].y - this.mainControl.body[i].y) * .9;
			}
		}
	},

	onTouchStart() {
		if (this.mainControl.gameStatus !== GameStatus.Game_playing) {
			return
		}
		this.speed = GameConfig.FLAP_SPEED;
		this.mainControl.audioControl.playSound(SoundType.E_Sound_Fly)
	},

	onCollisionEnter(other, self) {
		switch (other.tag) {
			case 0:
				this.boxCollision()
				break;
			case 1:
				this.lifeCollision()
				break;
			case 2:
				this.gemCollision()
				break;
		}
	},

	boxCollision() {
		if (this.gemStatus) return;
		if (this.spShield.active) {
			this.spShield.active = false;
			return
		}
		if (this.mainControl.body.length !== 0) {
			this.mainControl.node.getChildByName("Body").removeChild(this.mainControl.body[this.mainControl.body.length - 1]);
			this.mainControl.body.pop();
			this.mainControl.audioControl.playSound(SoundType.E_Sound_Die);
			return
		}
		cc.log("gameover");
		this.mainControl.gameOver();
		this.speed = 0;
	},

	lifeCollision() {
		const C = GameConfig;
		if (this.mainControl.body.length < C.BODY_MAX) {
			this.mainControl.body.push(cc.instantiate(this.mainControl.bodyPrefab));
			let num = this.mainControl.body.length - 1;
			this.mainControl.node.getChildByName("Body").addChild(this.mainControl.body[num]);
			this.mainControl.body[num].x = num === 0 ? 0 : this.mainControl.body[num - 1].x - C.BODY_GAP;
			this.mainControl.life.x = C.ITEM_KNOCKBACK_X;
		}
		cc.log("add life");
		this.mainControl.audioControl.playSound(SoundType.E_Sound_Life);
	},

	gemCollision() {
		const C = GameConfig;
		cc.log("get gem");
		this.spShield.active = true;
		if (!this.gemStatus) {
			cc.sys.localStorage.setItem('moveSpeed', String(this.mainControl.moveSpeed));
		}
		this.mainControl.moveSpeed = C.MOVE_SPEED_CAP;
		this.mainControl.gem.x = C.ITEM_KNOCKBACK_X;
		this.gemStatus = true
		if (this.time) {
			this.clearTimer()
		}
		this.time = setTimeout(() => {
			this.time = null;
			this._restoreMoveSpeedFromStorage();
			this.gemStatus = false;
		}, C.GEM_EFFECT_MS)
		this.mainControl.audioControl.playSound(SoundType.E_Sound_Life);
		this.mainControl.audioControl.playSound(SoundType.E_Sound_seep);
	},

	clearTimer() {
		clearTimeout(this.time);
		this.time = null;
	},
});
