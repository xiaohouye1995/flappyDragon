// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
export const SoundType = {
  E_Sound_Fly: 0,
  // E_Sound_Score: 1,
  E_Sound_Die: 2,
  E_Sound_Life: 3,
  E_Sound_seep: 4
}
cc.Class({
    extends: cc.Component,

    properties: {
		type: 0,
		// backgroundMusic: {
		// 	default: null,
		// 	type: cc.AudioClip
		// },
		flySound: {
			default: null,
			type: cc.AudioClip
		},
		// scoreSound: {
		// 	default: null,
		// 	type: cc.AudioClip
		// },
		dieSound: {
			default: null,
			type: cc.AudioClip
		},
		lifeSound: {
			default: null,
			type: cc.AudioClip
		},
		seepSound: {
			default: null,
			type: cc.AudioClip
		}
    },

    start () {
		// 播放背景音乐
		// cc.audioEngine.playMusic(this.backgroundMusic, true);
    },
	
	playSound (type) {
		if (type == SoundType.E_Sound_Fly) {
			cc.audioEngine.playEffect(this.flySound, false);
		} else if (type == SoundType.E_Sound_Die) {
			cc.audioEngine.playEffect(this.dieSound, false);
		} else if (type == SoundType.E_Sound_Life) {
			cc.audioEngine.playEffect(this.lifeSound, false);
		} else if (type == SoundType.E_Sound_seep) {
			cc.audioEngine.playEffect(this.seepSound, false);
		} 
		// else if (type == SoundType.E_Sound_Score) {
		// 	cc.audioEngine.playEffect(this.scoreSound, false);
		// } 
		
			
	}

    // update (dt) {},
});
