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
		// 初始化mainControl
		this.mainControl = cc.Canvas.instance.node.getComponent("MainControl");
		// 获得bird下保护盾
		this.spShield = this.node.getChildByName("Shield");
		// 隐藏保护盾
		this.spShield.active = false;
	},

	start() {
	},

	update(dt) {
		// 游戏状态不等于Game_playing时直接返回
		if (this.mainControl.gameStatus !== GameStatus.Game_playing) {
			return
		}

		// 判断保护盾状态
		if (this.gemStatus) {
			// 直线冲刺
			this.node.y = 0;
		} else {
			// 小鸟重力下坠
			this.speed -= 0.8;
			this.node.y += this.speed;
		}
		
			
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
			this.spShield.active = false;
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
	
	// 碰撞障碍物
	boxCollision() {
		if (this.gemStatus) return;
		if (this.spShield.active) {
			this.spShield.active = false;
			return
		}
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
	},
	
	// 碰撞心心
	lifeCollision() {
		if (this.mainControl.body.length < 6) {
			this.mainControl.body.push(cc.instantiate(this.mainControl.bodyPrefab));
			let num = this.mainControl.body.length -1;
			this.mainControl.node.getChildByName("Body").addChild(this.mainControl.body[num]);
			this.mainControl.body[num].x = num === 0 ? 0 : this.mainControl.body[num -1].x - 70;
			this.mainControl.life.x = -750;
		}
		cc.log("add life");
		// 播放加命音效
		this.mainControl.audioControl.playSound(SoundType.E_Sound_Life);
	},
	
	// 碰撞宝石
	gemCollision() {
		cc.log("get gem");
		this.spShield.active = true;
		cc.sys.localStorage.setItem('moveSpeed', this.mainControl.moveSpeed);
		this.mainControl.moveSpeed = 30;
		this.mainControl.gem.x = -750;
		this.gemStatus = true
		if (this.time) {
			this.clearTimer()
		}
		this.time = setTimeout(() => {
			this.mainControl.moveSpeed = +cc.sys.localStorage.getItem('moveSpeed')
			this.gemStatus = false
		}, 5000)
		// 播放加命音效
		this.mainControl.audioControl.playSound(SoundType.E_Sound_Life);
	},
	
	// 清除定时器
	clearTimer() {
		clearTimeout(this.time);
		this.time = null;
	},
});
