// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import MainControl from "./MainControl"
import {
	GameStatus
} from "./MainControl"
import {
	SoundType
} from "./AudioSourceControl"
cc.Class({
	extends: cc.Component,

	properties: {
		// 角色速度
		speed: 0,
		// 最大移动速度
		maxMoveSpeed: 0,
		// 加速度
		accel: 0,
		mainControl: {
			default: null,
			type: MainControl
		},
	},

	onLoad() {
		cc.Canvas.instance.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
		// 初始化mainControl
		this.mainControl = cc.Canvas.instance.node.getComponent("MainControl");

		// 加速度方向开关
		this.accLeft = false;
		this.accRight = false;
		// 角色当前水平方向速度
		this.xSpeed = 0;
		
		// 获得游戏角色
		// this.bird = this.node.getChildByName("Bird").getComponent(cc.Sprite);
	},

	start() {

	},

	update(dt) {
		// 游戏状态不等于Game_playing时直接返回
		if (this.mainControl.gameStatus !== GameStatus.Game_playing) {
			return
		}
		this.speed -= 0.15;
		this.node.y += this.speed;

		// 小鸟飞行倾斜角度
		let angle = -(this.speed/2)*30;
		if (angle >= 30) {
			angle = 30;
		}
		this.node.rotation = angle;

		// 当小鸟超出屏幕，游戏结束
		if (this.node.y >= 654 || this.node.y <= -654) {
			this.mainControl.gameOver();
			this.speed = 0;
		}

		// 根据当前加速度方向每帧更新速度
		if (this.accLeft) {
			this.xSpeed -= this.accel * dt;
		} else if (this.accRight) {
			this.xSpeed += this.accel * dt;
		}
		// 限制主角的速度不能超过最大值
		if (Math.abs(this.xSpeed) > this.maxMoveSpeed) {
			// if speed reach limit, use max speed with current direction
			this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed);
		}
		// 根据当前速度更新主角的位置
		this.node.x += this.xSpeed * dt;
	},

	onTouchStart() {
		// 游戏状态不等于Game_playing时直接返回
		if (this.mainControl.gameStatus !== GameStatus.Game_playing) {
			return
		}
		this.speed = 5;
		// 播放飞翔音效
		this.mainControl.audioControl.playSound(SoundType.E_Sound_Fly)
	},

	onCollisionEnter() {
		// 游戏结束
		cc.log("gameover");
		this.mainControl.gameOver();
		this.speed = 0;
	}

});
