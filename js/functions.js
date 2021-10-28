// 這裡是 app.js、animate.js 共同使用 function 區域

// 抓所有顯示中的格子 (return ARRAY)
// [used by functions.js - function `tileMovesRoutine`]
// [used by animate.js - async function `createATile`]
function getActiveTiles() {
    var activeCell = [];
    $('div[class*="active-"]')
    .each(function (idx, elem) {
        activeCell.push(elem);
    })
    return activeCell;
}

// 抓格子的 class
// [used by animate.js - async function `createATile`]
function getClassNum(activeTiles) {
    let activeTilesclass = [];
    for (let activeTile of activeTiles) {
        activeTilesclass.push(parseInt(activeTile.classList[1].slice(8, 10)));
    }
    return activeTilesclass;
}

// ===============================================================

// app.js 使用功能

// 使用者按下方向鍵後流程
// [used by functions.js - function `detectKeydown`]
function tileMovesRoutine(direction, isGameover, scoreObj) {
    // Tile 物件 陣列 歸零
    TileList = [];

    // 抓所有顯示中的方塊的class position number，放進 classNumList 陣列中
    let activeTiles = getActiveTiles();
    let classNumList = getClassNum(activeTiles);

    // console.group('getClassNum()範圍');
    // console.log(`classNumList: ${classNumList}`);
    // console.groupEnd();


    // 判斷遊戲是否結束 step 1 -- 看已存在方塊有沒有到 16 個
    let stepOneResult = checkGameoverStepOne(classNumList);
    // console.log(`stepOneResult: ${stepOneResult}`);
    let stepTwoResult = false; // 預設 false
    checkMovesWhenPressBtn(direction, classNumList);


    // console.group('暫時結果 (step)');
    for (let tile of TileList) {
        // console.log(tile.classNum, ':', tile.step);
    }
    // console.groupEnd();

    // 判斷遊戲是否結束 step 2 -- 看是否所有方塊都不能移動 (.step == 0) (true: 所有方塊都不能移動)
    stepTwoResult = checkGameoverStepTwo(TileList);

    // 遊戲結束判斷：如果 stepOneResult、stepTwoResult 都是 true，則判斷遊戲結束(isGameover = true)
    if (stepOneResult == true && stepTwoResult == true) {
        isGameover = true;
    }

    // 如果 遊戲結束(isGameover = true)，跳出結束提醒，否則(isGameover = false)繼續遊戲
    if (!isGameover) { // false: 遊戲繼續
        if (!stepTwoResult) { // 有方塊移動就 正常移動+創造方塊
            // 計算到達的位置 (.desinationClassNum)
            calcDesinationClassNum(direction);
             // 更新分數狀態 -- 分數增加：加上 tile 合體的值 (e.g. tile-2 跟 tile-2 合體，分數 +4)
            let scoreAddThisRound = updateScore(TileList, scoreObj);

            moveAndCreateNewTile(direction, scoreObj);

            // 更新前端分數顯示
            updateScoreDisplay(scoreAddThisRound, scoreObj);

        } else {}   // 沒有方塊移動就不做任何事情 (只打開偵測)

    } else { // true: 遊戲結束
        $('#gameover').css('visibility', 'visible');
    }

}

// 判斷遊戲是否結束 step 1 -- 看已存在方塊有沒有 16 個
// [used by app.js - function `tileMovesRoutine`]
function checkGameoverStepOne(classNumList) {
    return classNumList.length == 16;
}

// 判斷遊戲是否結束 step 2 -- 看是否所有方塊都不能移動 (.step == 0)
// [used by app.js - function `tileMovesRoutine`]
function checkGameoverStepTwo(TileList) {
    const isZeroStep = (elem) => elem.step == 0;
    return TileList.every(isZeroStep);
}


// 重新開始遊戲 相關
// --- 重新開始遊戲 (按前端 NEW GAME 按鈕就會執行)
// [used by app.js]
function newGame(bestRecord) {

    // 清掉所有方塊的值
    $('div[class*=tile-inner]').remove();
    // 先把tile回復預設值 (加上.tile-inner position??)
    $(`.grid-cell`).each(function (idx, elem) {
        let col = parseInt(idx / 4) + 1;
        let row = idx % 4 + 1;
        let tile = $(elem).append(`<div class="tile-inner position${col}${row}"></div>`);
        tile.children().hide();
    })

    // 除了 bestRecord 資料全部清掉
    bestRecord = 0;
    $('#score').text(0);

    // 隱藏所有方塊
    $('.tile-inner').hide();

    // 遊戲開始新增兩個方塊
    createATile();
    createATile();

    isGameover = false;
    
    // 關掉 gameover 視窗
    $('#gameover').css({
        'visibility': 'hidden',
        'transition': '0.1s'
    });
    
    startDetectKeydown();
}

// ===============================================================

// function.js 使用功能

// 根據按下的方向鍵，執行計算方塊步數
// [used by functions.js - function `tileMovesRoutine`]
function checkMovesWhenPressBtn(direction, classNumList) {
    // 如果移動方向是 下 or 右，則反轉陣列 (讓陣列從後面元素開始比較)
    if (direction == 'down' || direction == 'right') { classNumList.reverse(); }

    // classNumList 抓到的所有方塊都跑一次
    for (let selectTileClassNum of classNumList) {
       // 判斷是否為最底排 -- up:    .position11~14
       // 　　　　　　　　 -- down:  .position41~44
       // 　　　　　　　　 -- left:  .position11.21.31.41
       // 　　　　　　　　 -- right: .position14.24.34.44
       let isTileNeedToMove = checkTilePosition(direction, selectTileClassNum);
    //    console.log(`isTileNeedToMove: ${isTileNeedToMove}`);
       
       // 是最底排 ---> 不用移動
       if (isTileNeedToMove) {
        //    console.groupCollapsed(`現在輪到: ${selectTileClassNum}`);
        //    console.log(selectTileClassNum, '最底排 - 不用移動');
           updateTileInfo(selectTileClassNum, 0); // 到外面 function 進行物件新增/更改
        //    console.groupEnd();
       } else { // 不是最底排 --> 計算移動步數
        //    console.groupCollapsed(`現在輪到: ${selectTileClassNum}`);
           calcMoves(direction, classNumList, selectTileClassNum);
        //    console.groupEnd();
       }
   }
}

// 計算到達的位置 (.desinationClassNum)
// [used by functions.js - function `tileMovesRoutine`]
function calcDesinationClassNum(direction, tileList = TileList) {
    // console.group('計算到達的位置中..');
    for(let tile of tileList) {
        tile.calcDesination(direction);
        // console.log(`tile(${tile.classNum}): ${tile.desinationClassNum}`);
    }
    // console.groupEnd();
}

// --- 以 tile classNum，判斷 tile 是否需要移動
// [used by functions.js - function `checkMovesWhenPressBtn`]
function checkTilePosition(direction, selectTileClassNum) {
    switch (direction) {
        case 'up':
            return (Math.floor(selectTileClassNum / 10) == 1);
            break;
        case 'down':
            return (Math.floor(selectTileClassNum / 10) == 4);
            break;
        case 'left':
            return (Math.floor(selectTileClassNum % 10) == 1);
            break;
        case 'right':
            return (Math.floor(selectTileClassNum % 10) == 4);
            break;
        default:
    }
}

// --- 計算 tile 移動步數
// [used by functions.js - function `checkMovesWhenPressBtn`]
// [used by functions.js - self]
function calcMoves(direction, classNumList, selectTileClassNum, round=1) {
    let thisRound = round; // 比到第幾輪(最多3輪)
    let maxRound = getMaxRound(direction, selectTileClassNum);
    // console.log(`thisRound: ${thisRound}`);
    // console.log(`maxRound: ${maxRound}`);
    
    // 前面有沒有方塊？
    // 根據 thisRound 變數，算出 目標格子的classNum
    let targetTileClassNum = getCheckingTileClassNum(direction, selectTileClassNum, thisRound);
    // 判斷 目標格子的classNum 有無 方塊
    let isTileExist = checkTileExist(targetTileClassNum, classNumList);
    // console.log(`targetTileClassNum: ${targetTileClassNum}`);
    // console.log(`isTileExist: ${isTileExist}`);

    // --> 有方塊 (比較方塊數字)
    if (isTileExist) {
        // console.groupCollapsed('compare hell');

        let result = compareValue(selectTileClassNum, targetTileClassNum);
        if (result) {
            // 數值一樣，合體！
            // console.log('數值一樣，合體！');
            // 合體 function
            reunion(selectTileClassNum, targetTileClassNum);

            // 確認selectTile有沒有需要向上移動的情況 (要讓selectTile跟targetTile重疊)
            let isSelectTileNeedToFollow = needToFollow(direction, targetTileClassNum);
            // console.log(`isSelectTileNeedToFollow: ${isSelectTileNeedToFollow}`);
            // 把結果丟進去，符合就執行
            SelectTileFollow(selectTileClassNum, targetTileClassNum, isSelectTileNeedToFollow);

            // 下面如果有方塊，要跟著一起移動
            stickWhenReunion(direction, selectTileClassNum);

        } else {
            // 數值不同，方塊停止移動
            // console.log('數值不同，方塊停止移動');

            // 確認selectTile有沒有需要向上移動的情況 (要讓selectTile跟targetTile重疊)
            let isSelectTileNeedToFollow = needToFollow(direction, targetTileClassNum);
            // console.log(`isSelectTileNeedToFollow: ${isSelectTileNeedToFollow}`);

            // 判斷 ↑ □□42 還是 □222 的情形 -- 用前面存在格子的 .reunionState 判斷
            let isTargetTileReunioned = checkTargetTileReunionState(targetTileClassNum);
            // console.log(`isTargetTileReunioned: ${isTargetTileReunioned}`);
            // 如果 .reunionState == false (沒合體情形)，就加上 selectTile 加上 targetTile 的步數
            if (!isTargetTileReunioned) {
                SelectTileFollow(selectTileClassNum, targetTileClassNum, isSelectTileNeedToFollow);
            }

            updateTileInfo(selectTileClassNum, 0);
        }
        // console.groupEnd();
    } // --> 沒方塊 (可以前進一步 & 再比較一次)
     else {
        thisRound++;
        if(thisRound < maxRound+1) {
            // console.log('可以前進一步 & 再比較一次');

            // 前進一步 -- (新增物件)更改物件屬性
            updateTileInfo(selectTileClassNum, 1);

            // 再比較一次
            calcMoves(direction, classNumList, selectTileClassNum, thisRound);
        } else {
            // console.log('可以前進一步 & 到 maxRound，停止比較');
            // 前進一步 -- (新增物件)更改物件屬性
            updateTileInfo(selectTileClassNum, 1);
        }
    }
}

// 根據選定的tileclassNum，算 最多可以比幾次 (到最底排有幾格)
// [used by functions.js - function `calcMoves`]
function getMaxRound(direction, tileClassNum) {
    switch (direction) {
        case 'up':
                return Math.floor(tileClassNum / 10) - 1;
                break;
            case 'down':
                return 4 - Math.floor(tileClassNum / 10);
                break;
            case 'left':
                return (tileClassNum % 10) - 1;
                break;
            case 'right':
                return 4 - (tileClassNum % 10);
                break;
            default:
    }
}

// 根據移動方向，計算目標方塊的 class number
// [used by functions.js - function `calcMoves`]
// [used by functions.js - function `stickWhenReunion`]
function getCheckingTileClassNum(direction, targetTileClassNum, times) {
    switch (direction) {
        case 'up':
            return targetTileClassNum - times * 10;
            break;
        case 'down':
            return targetTileClassNum + times * 10;
            break;
        case 'left':
            return targetTileClassNum - times;
            break;
        case 'right':
            return targetTileClassNum + times;
            break;
        default:
    }
}

// 判斷有無方塊存在(阻擋) true: 有方塊存在(阻擋)
// [used by functions.js - function `calcMoves`]
function checkTileExist(tileClassNum, classNumList) {
    return (classNumList.indexOf(tileClassNum) > -1);
}

// 比較方塊數值
// [used by functions.js - function `calcMoves`]
function compareValue(selectTileClassNum, targetTileClassNum) {
    let selectTileFound = useClassNumGetTileObj(selectTileClassNum);
    let targetTileFound = useClassNumGetTileObj(targetTileClassNum);

    // console.log('selectTileFound:', selectTileFound);
    // console.log('targetTileFound:', targetTileFound);
    (selectTileFound) ? selectTileValue = selectTileFound.value : selectTileValue = parseInt($(`.position${selectTileClassNum}`).text());
    (targetTileFound) ? targetTileValue = targetTileFound.value : targetTileValue = parseInt($(`.position${targetTileClassNum}`).text());

    return (selectTileValue == targetTileValue);
}

// 方塊合體
// [used by functions.js - function `calcMoves`]
function reunion(selectTileClassNum, targetTileClassNum) {
    // console.group(`selectTile(${selectTileClassNum}) 移動一步`)
    // selectTile 移動一步
    updateTileInfo(selectTileClassNum, 1);
    // 更改物件的 .ReunionState 屬性
    let selectTileObj = useClassNumGetTileObj(selectTileClassNum);
    selectTileObj.changeReunionState(2);
    // 更改物件的值 (tile數字)
    selectTileObj.changeValue(0);
    // console.groupEnd(); 

    // console.group(`targetTile(${targetTileClassNum}) 不移動`)
    // targetTile 不移動
    updateTileInfo(targetTileClassNum, 0);
    // 更改物件的 .ReunionState 屬性
    let targetTileObj = useClassNumGetTileObj(targetTileClassNum);
    targetTileObj.changeReunionState(1);
    // 更改物件的值 (tile數字)
    targetTileObj.changeValue(2);
    // console.groupEnd();
}

// 確認selectTile是否需要向 上/下/左/右 移動的情況 (如果targetTile有往 上/下/左/右 移，selectTile就要跟著移動 (移selectTile就好，target步數正常))
// -- 條件A：targetTile有往 上/下/左/右 移
// -- 條件B：targetTile 上面/下面/左邊/右邊(移動方向) 沒有2個方塊
// [used by functions.js - function `calcMoves`]
// [used by functions.js - function `SelectTileFollow`]
function needToFollow(direction, targetTileClassNum) {
    // console.groupCollapsed('needToFollow()');
    let targetTileObj = useClassNumGetTileObj(targetTileClassNum);
    // console.log(`targetTileClassNum: ${targetTileClassNum}`);
    // console.log(`targetTileObj.step: ${targetTileObj.step}`);
    // console.log(`targetTileObj.reunionState: ${targetTileObj.reunionState}`);
    
    // 條件B判斷：targetTile移動方向沒有2個方塊-->is2TilesAbove:false // 考慮進去 ←2□42、4□22 的情形
    let boxQty = getMaxRound(direction, targetTileClassNum); // 移動方向來看，targetTile距離移動到最底有幾格
    let is2TilesAbove = false;
    let existTilesQty = 0;
    // console.log(`targetTile 距移動方向(${direction})到最底有${boxQty}格`);
    for (let i=1; i <= boxQty; i++) {
        let checkingTileClassNum = getCheckingTileClassNum(direction, targetTileClassNum, i);
        if ($(`.position${checkingTileClassNum}[class*="active"]`).length) {
            // console.log(`checkTile: ${checkingTileClassNum}`);
            existTilesQty++;
            // console.log(existTilesQty);
            if ( existTilesQty == 2 ) {
                is2TilesAbove = true;
                i = boxQty+1;    // 湊齊2個existTile就結束迴圈
            } 
        };
    }
    // console.log(`is2TilesAbove: ${is2TilesAbove}`);

    // console.groupEnd();
    return ( targetTileObj.step && !(is2TilesAbove) )?true:false;
}

// 把 needToFollow 結果丟進去，符合(true)就執行
// [used by functions.js - function `calcMoves`]
function SelectTileFollow(selectTileClassNum, targetTileClassNum, isNeedToFollow) {
    // console.groupCollapsed('SelectTileFollow()');
    if (isNeedToFollow) {
        // 先轉成物件
        let targetTileObj = useClassNumGetTileObj(targetTileClassNum);

        // 算 selectTile 的 .step 屬性，讓 selectTile 移到 finalPosition
        let addSteps = targetTileObj.step;

        // 改 selectTile 的 .step 屬性
        updateTileInfo(selectTileClassNum, addSteps);
    }
    // console.groupEnd();
}

// 當方塊結合時，selectTile後面的方塊增加移動步數
// [used by functions.js - function `calcMoves`]
function stickWhenReunion(direction, selectTileClassNum) {
    // console.groupCollapsed('stickWhenReunion()');
    // 轉成物件
    let selectTileObj = useClassNumGetTileObj(selectTileClassNum);

    // 抓 下面/上面/右邊/左邊(移動相反方向) 有幾格(包含空格)
    let reverseDirection = reverseTheDirection(direction);
    let box = getMaxRound(reverseDirection, selectTileClassNum);
    // console.log(`距離移動反方向有幾格(box): ${box}`);
    // 更改移動步數：
    // -- 如果下面沒方塊 ---> 往前兩格
    // -- 如果下面有方塊 ---> 往前一格
    
    for (let i = 1; i <= box; i++) { // 根據找到幾個空格(box)跑幾次
        // 抓跟著移動的方塊
        let followTileClassNum = getCheckingTileClassNum(reverseDirection, selectTileClassNum, i);
        let followTile = $(`.position${followTileClassNum}[class*="active"]`);

        if (followTile.length) {
            // 有抓到 --> 創造 / 更新物件の .step 屬性
            // console.log(`followTileClassNum: ${followTileClassNum}`);
            // 創造 / 更新 Tile物件 (跟著移動一步)
            updateTileInfo(followTileClassNum, selectTileObj.step);
        }
    }
    // console.groupEnd();
}

// 判斷目標方塊的合體情形 (有跟其他方塊合體：true)
// [used by functions.js - function `calcMoves`]
function checkTargetTileReunionState(tileClassNum) {
    let currentState = false;
    // 轉個物件
    let targetTileObj = useClassNumGetTileObj(tileClassNum);
    if (targetTileObj.reunionState > 0) { // 1:被合體(沒移動方塊); 2:合體的(移動方塊)
        currentState = true;
    }
    return currentState;
}

// 反轉移動方向
// [used by functions.js - function `stickWhenReunion`]
function reverseTheDirection(direction) {
    switch (direction) {
        case 'up':
            return 'down';
            break;
        case 'down':
            return 'up';
            break;
        case 'left':
            return 'right';
            break;
        case 'right':
            return 'left';
            break;
        default:
    }
}
