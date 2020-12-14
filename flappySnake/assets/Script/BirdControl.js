// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import MainControl from "./MainControl"
import { GameStatus } from "./MainControl"
import { SoundType } from "./AudioSourceControl"
cc.Class({
	extends: cc.Component,
	properties: {
		// 角色速度
		speed: 0,
		mainControl: {
			default: null,
			type: MainControl
		}
	},

	onLoad() {
		cc.Canvas.instance.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
		// 初始化mainControl
		this.mainControl = cc.Canvas.instance.node.getComponent("MainControl");
	},

	start() {
	},

	update(dt) {
		// 游戏状态不等于Game_playing时直接返回
		if (this.mainControl.gameStatus !== GameStatus.Game_playing) {
			return
		}
		
		this.speed -= 0.8;
		this.node.y += this.speed;
		
		// 小鸟飞行倾斜角度
		// let angle = -(this.speed/4)*20;
		// if (angle >= 20) {
		// 	angle = 20;
		// }
		// this.node.rotation = angle;
		
		// 当小鸟超出屏幕，游戏结束
		if (this.node.y >= 654 || this.node.y <= -654) {
			this.mainControl.gameOver();
			this.speed = 0;
		}
		
		// 身体飞行轨迹
		for(var i = 0; i < this.mainControl.body.length; i++){
			if (i === 0) {
				this.mainControl.body[i].y = this.node.y - (this.node.y - this.mainControl.body[i].y) * .9;
			} else {
				this.mainControl.body[i].y = this.mainControl.body[i-1].y - (this.mainControl.body[i-1].y - this.mainControl.body[i].y) * .9;
			}
		}
	},

	onTouchStart() {
		// 游戏状态不等于Game_playing时直接返回
		if (this.mainControl.gameStatus !== GameStatus.Game_playing) {
			return
		}
		this.speed = 13;
		// 播放飞翔音效
		this.mainControl.audioControl.playSound(SoundType.E_Sound_Fly)
		// this.mainControl.moveSpeed = this.mainControl.moveSpeed + this.mainControl.gameScore / 10
		// console.log('速度', this.mainControl.moveSpeed)
	},

	onCollisionEnter(other, self) {
		if (other.tag === 1) {
			cc.log("add life");
			if (this.mainControl.body.length < 6) {
				this.mainControl.body.push(cc.instantiate(this.mainControl.bodyPrefab));
				let num = this.mainControl.body.length -1;
				this.mainControl.node.getChildByName("Body").addChild(this.mainControl.body[num]);
				this.mainControl.body[num].x = num === 0 ? 0 : this.mainControl.body[num -1].x - 70;
				this.mainControl.life[0].x = -750;
			}
			// 播放加命音效
			this.mainControl.audioControl.playSound(SoundType.E_Sound_Life);
		} else {
			if (this.mainControl.body.length !== 0) {
				this.mainControl.node.getChildByName("Body").removeChild(this.mainControl.body[this.mainControl.body.length - 1]);
				this.mainControl.body.pop();
				// 播放碰撞音效
				this.mainControl.audioControl.playSound(SoundType.E_Sound_Die);
				return
			}
			// 游戏结束
			cc.log("gameover");
			this.mainControl.gameOver();
			this.speed = 0;
		}
	}
});
