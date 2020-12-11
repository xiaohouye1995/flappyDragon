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
		SpBg: {
			default: [],
			type: [cc.Sprite]
		},
		pipePrefab: {
			default: null,
			type: cc.Prefab
		},
		pipe: {
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
			default: [],
			type: [cc.Node]
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
		}
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
			this.pipe[i] = cc.instantiate(this.pipePrefab);
			this.node.getChildByName("Pipe").addChild(this.pipe[i]);
			this.minX = 750;
			this.minY = -800;
			this.maxY = -550;
			this.pipe[i].x = this.minX * i;
			this.pipe[i].y = this.minY + Math.random() * (this.maxY - this.minY);
		}
		
		// 生成奖励心心
		this.life[0] = cc.instantiate(this.lifePrefab);
		this.node.getChildByName("Life").addChild(this.life[0]);
		this.life[0].x = 570;
		this.life[0].y = 0;
	},

	update(dt) {
		// 游戏状态不等于Game_playing时直接返回
		if (this.gameStatus !== GameStatus.Game_playing) {
			return
		}
		
		// 移动距离
		let moveWidth = 750
		let moveSpeed = 12
		
		// 移动背景图
		for (let i = 0; i < this.SpBg.length; i++) {
			this.SpBg[i].node.x -= moveSpeed;
			if (this.SpBg[i].node.x <= -moveWidth) {
				this.SpBg[i].node.x = moveWidth;
			}
		}

		// 移动障碍物
		for (let i = 0; i < this.pipe.length; i++) {
			this.pipe[i].x -= moveSpeed;
			if (this.pipe[i].x <= -1400) {
				this.pipe[i].x = moveWidth;			
				this.pipe[i].y = this.minY + Math.random() * (this.maxY - this.minY);
				// 播放加分音效
				this.audioControl.playSound(SoundType.E_Sound_Score);
				// 分数
				this.gameScore += 1;
				this.labelScore.string = this.gameScore.toString();
			}
		}
		
		// 移动奖励心心
		this.life[0].x -= moveSpeed;
		if (this.life[0].x <= -2750) {
			this.life[0].x = moveWidth;
			this.life[0].y = 0;
		}
		
	},
	
	// 获取跟随者数组
	getBodys () {
		let long = 102
		for (let i = 0; i < 2; i++) {
			this.body[i] = cc.instantiate(this.bodyPrefab);
			this.node.getChildByName("Body").addChild(this.body[i]);
			long -= 102
			this.body[i].x = long
		}
	},
	
	touchStartBtn() {
		// 隐藏开始按钮
		this.btnStart.node.active = false;
		// 游戏状态标记为Game_playing
		this.gameStatus = GameStatus.Game_playing;
		// 再来一局时，隐藏gameover图片
		this.spGameOver.node.active = false;
		// 再来一局时，障碍物重置位置
		for (let i = 0; i < this.pipe.length; i++) {
			this.pipe[i].x = this.minX * i;
			this.pipe[i].y = this.minY + Math.random() * (this.maxY - this.minY);
		}
		// 再来一局时，还原主角位置和角度
		let bird = this.node.getChildByName("Bird");
		bird.y = 100;
		// bird.rotation = 0;
		// 分数清零
		this.gameScore = 0;
		this.labelScore.string = this.gameScore.toString();
		this.getBodys();
	},
	
	gameOver() {
		// 游戏结束时，显示gameover
		this.spGameOver.node.active = true;
		// 游戏结束时，显示开始按钮
		this.btnStart.node.active = true;
		// 游戏状态标记为Game_over
		this.gameStatus = GameStatus.Game_over;
		// 播放结束音效
		this.audioControl.playSound(SoundType.E_Sound_Die);
		this.node.getChildByName("Body").removeAllChildren();
		this.body = [];
	}
});
