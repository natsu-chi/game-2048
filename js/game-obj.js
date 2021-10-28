// 方塊相關
class Tile {
    constructor (classNum, steps, reunionState = 0, tileValue = 2) {
        this.classNum = classNum;
        this.step = steps;                  // 這局可以移動的步數
        this.reunionState = reunionState;   // 0:沒合體 ; 1:被合體(沒移動方塊); 2:合體的(移動方塊)
        this.desinationClassNum = 0;
        this.value = tileValue;
    }
    changeReunionState(relationshipCode) {  // 1:被合體(沒移動方塊); 2:合體的(移動方塊)
        this.reunionState = relationshipCode;
    }
    changeValue(times) {                    // 0:砍掉數字; 2:數字乘以兩倍
        this.value *= times;
    }
    calcDesination(direction) {             // 計算最後到達的位置       
        let desinationClassNum = 0;
        switch (direction) {
            case 'up':
                desinationClassNum = this.classNum - 10*this.step;
                break;
            case 'down':
                desinationClassNum = this.classNum + 10*this.step;
                break;
            case 'left':
                desinationClassNum = this.classNum - this.step;
                break;
            case 'right':
                desinationClassNum = this.classNum + this.step;
                break;
            default:
                console.error('INVALID INPUT!!');
        }
        this.desinationClassNum = desinationClassNum;
    }
}

// 新增 or 調整物件：如果 TileList 沒有物件就新增，已存在就調整 .step 屬性
// [used by functions.js - function `checkMovesWhenPressBtn`]
// [used by functions.js - function `calcMoves`]
// [used by functions.js - function `reunion`]
// [used by functions.js - function `SelectTileFollow`]
// [used by functions.js - function `stickWhenReunion`]
function updateTileInfo(selectTileClassNum, stepCanMove) {
    // 用抓.classNum 抓 TileList 物件
    let found = useClassNumGetTileObj(selectTileClassNum);

    // 如果抓的到物件，直接更新屬性(.moves)
    if(found) {
        // console.groupCollapsed(`(${selectTileClassNum})修改物件`);
        found.step += stepCanMove;
        // console.log(`目前step: ${TileList[TileList.indexOf(found)].step}`); // 印出剛剛修改的物件
        // console.groupEnd();
    } else {
        // 沒抓到(undefined)就創一個物件
        // console.groupCollapsed(`(${selectTileClassNum})新增物件`);
        selectTileCurrentValue = parseInt($(`.position${selectTileClassNum}`).text());
        TileList.push(new Tile(selectTileClassNum, stepCanMove, 0, selectTileCurrentValue));
        // console.log(`目前step: ${TileList[TileList.length-1].step}`); // 印出剛剛新增的物件
        // console.groupEnd();
    }
}

// 用.classNum 抓 TileList 物件
// [used by functions.js - function `compareValue`]
// [used by functions.js - function `reunion`]
// [used by functions.js - function `needToFollow`]
// [used by functions.js - function `SelectTileFollow`]
// [used by functions.js - function `stickWhenReunion`]
// [used by functions.js - function `checkTargetTileReunionState`]
function useClassNumGetTileObj(TileClassNum, objList = TileList) {
    return objList.find(elem => elem.classNum == TileClassNum);
}


// 分數計算相關
class Score {
    constructor (score, record) {
        this.currentScore = score;
        this.bestRecord = record;
    }
    addScore(tileClassNum) { // 當合體時，新增分數 (tile的值) (e.g. tile-2 跟 tile-2 合體，分數 +4)
        // 轉個物件
        let tileObj = useClassNumGetTileObj(tileClassNum);
        // console.log(tileObj);
        // 將分數的 .currentScore 加上 tile 合體的值
        ScoreObj.currentScore += tileObj.value;
    }
}

// 更新前端分數顯示
// [used by functions.js - function `tileMovesRoutine`]
function updateScoreDisplay(scoreAddThisRound, scoreObj) {
    // SCORE 部分
    let scoreBTag = $('#score');
    let currentScore = parseInt(scoreBTag.text());
    let scoreThisRound = currentScore + scoreAddThisRound;
    scoreBTag.text(scoreThisRound);

    // BEST 部分
    let bestRecord = scoreObj.bestRecord;
    // console.log(`bestRecord: ${bestRecord}`);
    $('#best').text(bestRecord);
}

// 更新分數狀態 --
// 1. 分數增加：加上 tile 合體的值 (e.g. tile-2 跟 tile-2 合體，分數 +4)
// 2. 判斷有無更新紀錄
function updateScore(TileList, scoreObj) {
    // 抓所有 .reunionState == 1 的 Tile物件
    // 符合條件的 Tile物件 的 .value 值 全部加總，存到 addValueThisRound 變數 (等等 return 出來給前端更新顯示用)
    let tilesReunionList = TileList.filter(elem => elem.reunionState == 1);

    if (tilesReunionList) {
        // 有抓到 Tile物件
        let valueAddThisRound = 0;
        let maxValueThisRound = 0;
        for (let tileObj of tilesReunionList) {
            valueAddThisRound += tileObj.value;
            (tileObj.value > maxValueThisRound) ? maxValueThisRound = tileObj.value : maxValueThisRound;
        }
        
        // 將 valueAddThisRound 加到 myScore.currentScore 中
        addScore(valueAddThisRound, scoreObj);

        // 判斷這輪的 max value (maxValueThisRound) 有沒有 大於 myScore.bestRecord，有就更新紀錄
        updateBestrecord(maxValueThisRound, scoreObj);

        // 回傳 valueAddThisRound，給 更新前端分數顯示 用
        return valueAddThisRound;
    }
}

// 將 本局得到分數 加進 score 裡面
// [used by game-objects.js - function `addScore`]
function addScore(valueAddThisRound, scoreObj) {
    scoreObj.currentScore += valueAddThisRound;
}

// 如果 本局最高紀錄 > 分數最高紀錄，則更新最高紀錄
// [used by game-objects.js - function `updateBestrecord`]
function updateBestrecord(maxValueThisRound, scoreObj) {
    (maxValueThisRound > scoreObj.bestRecord) ? scoreObj.bestRecord = maxValueThisRound : scoreObj.bestRecord;
}