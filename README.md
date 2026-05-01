# flappyDragon（飞翔的贪吃龙）

基于 **Cocos Creator 2.4.3** 的竖屏小游戏工程，玩法结合了类 Flappy 操作与可成长的「蛇身」跟随。发布目标主要为 **微信小游戏**（工程在子目录 `flappySnake/`）。

## 工程结构

| 路径 | 说明 |
|------|------|
| `flappySnake/` | Creator 工程根目录（历史目录名未改，与仓库名不同） |
| `flappySnake/assets/Script/` | 游戏逻辑脚本 |
| `flappySnake/assets/Script/GameConfig.js` | 关卡与手感相关数值集中配置 |
| `flappySnake/settings/wechatgame.json` | 微信小游戏构建参数；**`appid` 勿提交到公开仓库时可改为占位或改用本地私有配置** |

## 本地打开

使用与 `project.json` 中 `version` 一致的 **Cocos Creator 2.4.x** 打开 `flappySnake` 文件夹即可编辑与构建。
