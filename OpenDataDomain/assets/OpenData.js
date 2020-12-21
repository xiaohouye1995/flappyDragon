
cc.Class({
    extends: cc.Component,

    properties: {
        itemPrefab: cc.Prefab,      // item预制
        content: cc.Node,           // content节点
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if (typeof wx === 'undefined') {
            return;
        }

        wx.onMessage( data => {
            if (data.message) {
                if (data.message != 'clear') {
                    this.score = data.message;                  // 将主域传过来的分数保存在this.score中
                    this.compareOldNewScore();                  // 将当前玩家的新分数和之前玩的分数进行比较
    
                    this.allInfoList = [];                      // 所有玩家的数据保存在这个数组中，用于排序
                    // this.getFriendInfo();                    // 获取同城好友信息(当前玩家的信息也会返回)
                    this.getPlayerInfo();                       // 用于读者Demo测试，实际项目中调用getFriendInfo()
                }
                else {
                    this.content.removeAllChildren();           // 关闭排行榜时清空节点
                }

            }
        });
    },

    // 更新：请读者在主域中比较分数，并调用wx.setUserCloudStorage这个API来更新云托管分数(该API可以在主域中使用)，否则玩家只有在点击了排行榜按钮后才会将分数存入云托管。
    // 逻辑：将每局分数与存储在本地的最高分进行比较，如果超过历史最高分数则同时更新本地和云托管数据。不需要再将分数传到子域。
    compareOldNewScore() {
        // 将传过来的新分数和之前玩的分数进行比较
        wx.getUserCloudStorage({
            keyList: ['score'],
            success: (res) => {
                if (res.KVDataList.length) {
                    let KVData = res.KVDataList[0];
                    let storedScore = Number(KVData['value']);
                    if (this.score > storedScore) {
                        // 如果新分数大于存储分数，则将新分数存入云托管
                        let newKVData = {key: 'score', value: String(this.score)}
                        this.setNewCloudScore(newKVData);
                    }
                }
                else {
                    // 如果第一次玩，那么直接将传过来的分数设置到云托管
                    let newKVData = {key:'score', value:String(this.score)}
                    this.setNewCloudScore(newKVData);     
                }
            },

            fail: (res) => {
                console.log(res);
            }
        });
    },

    setNewCloudScore (newKVData) {
        // 设置新云托管分数(第一次游戏时，也调用该方法设置云托管分数)
        wx.setUserCloudStorage({
            KVDataList: [newKVData],
            success: (res) => {
                console.log('更新玩家分数成功！');
            },
            fail: (res) => {
                console.log(res);
            }
        });
    },

    getPlayerInfo(){
        // 获取当前玩家信息
        // 用于读者Demo测试，实际项目中获取排行榜只需要调用getFriendInfo方法
        wx.getUserInfo({
            openIdList: ['selfOpenId'],
            lang: 'zh_CN',
            success: (res) => {
                let userInfo = res.data[0];

                // 获取玩家微信名和头像url
                let nickName = userInfo.nickName;
                let avatarUrl = userInfo.avatarUrl;

                // 生成多个当前玩家的信息(分数不同)
                for (let i=0; i<40; i++) {
                    // 加入到数组中
                    this.allInfoList.push({
                        nickName: nickName,
                        avatarUrl: avatarUrl,
                        score: Math.round(Math.random()*100)
                    });
                }
                
                // 开始排名
                this.makeRanks();
            },

            fail: (res) => {
                console.log(res);
            }
        });
    },

    getFriendInfo () {
        // 获取同城好友信息(包括自身)
        wx.getFriendCloudStorage({
            keyList: ['score'],
            success: (res) => {
                for (let i = 0; i < res.data.length; i++) {
                    // 获取玩家微信名，头像url和分数
                    let nickName = res.data[i].nickname;
                    let avatarUrl = res.data[i].avatarUrl;
                    let score = 0;
                    if (res.data[i].KVDataList.length)
                        score = res.data[i].KVDataList[0]['value'];

                    // 加入到数组中
                    this.allInfoList.push({
                        nickName: nickName,
                        avatarUrl: avatarUrl,
                        score: score
                    });
                }

                // 开始排名
                this.makeRanks();
            },

            fail: (res) => {
                console.log(res);
            }
        });
    },

    makeRanks () {
        // 首先将allInfoList内部元素进行排序，根据分数来降序排列
        this.allInfoList.sort((a, b) => {
            return b['score'] - a['score'];
        });
        
        // 根据各个玩家的分数制作排名
        for (let i=0; i<this.allInfoList.length; i++) {
            let nickName = this.allInfoList[i]['nickName'];
            let avatarUrl = this.allInfoList[i]['avatarUrl'];
            let score = this.allInfoList[i]['score'];
            this.createItem(i+1, nickName, avatarUrl, score);
        }
    },

    createItem (rank, nickName, avatarUrl, score) {
        // 生成item
        let item = cc.instantiate(this.itemPrefab);
        
        // 排名
        item.children[0].getComponent(cc.Label).string = String(rank);
        // 微信名
        item.children[4].getComponent(cc.Label).string = nickName;
        // 分数
        item.children[5].getComponent(cc.Label).string = score;
        // 头像
        cc.loader.load({url: avatarUrl, type: 'png'}, (err, texture) => {
            if (err) console.error(err);
            item.children[1].getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        });

        // 添加到content中
        this.content.addChild(item);
    }
});
