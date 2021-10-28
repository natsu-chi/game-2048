// 新增方塊相關

// createATile() 使用功能
// --- 隨機取一個數字
// [used by animate.js - async function `createATile`]
function getRandTileClassNum(tileCanCreateOptList) {
    let idx = Math.floor( Math.random() * tileCanCreateOptList.length );
    let tileCreateClassNum = tileCanCreateOptList[idx];
    // console.log('idx:', idx);
    // console.log(`create new tile on: ${tileCreateClassNum}`);
    return tileCreateClassNum;
}
// --- 隨機取方塊值的數字：如果 classNum 是奇數，就取2，偶數就取4
// [used by animate.js - async function `createATile`]
function getRandNewTileValue() {
    let valueOpt = [2,2,4];
    let rand = Math.floor( Math.random() * 3);
    let tileValue = valueOpt[rand];
    return tileValue;
}
// --- 打開方塊位置
// [used by animate.js - async function `createATile`]
function openTile(tileCreateClassNum, newTileValue) {
    $(`.position${tileCreateClassNum}`).text(newTileValue).addClass(`active-${newTileValue}`).fadeIn();
}

// (主功能) 新增方塊(隨機取位置 + 隨機給定數字) (目前僅新增一個)
// [used by app.js]
// [used by function.js - function newGame]
async function createATile() {
    // 抓新的 顯示中方塊 tileList
    let newTilesDOMList = getActiveTiles();
    let newTilesExistClassNumList = getClassNum(newTilesDOMList);
    // console.log('newTilesExistList:', newTilesExistClassNumList);

    // 過濾 tileOptList，留下沒有 newTilesExistClassNumList 元素的元素，再存入新的陣列
    let tileOptList = [11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33, 34, 41, 42, 43, 44];
    let tileCanCreateOptList = [... new Set(tileOptList)]
        .filter(elem => !(newTilesExistClassNumList.includes(elem)));
    // console.log('tileCanCreateOptList:', tileCanCreateOptList);
    // 在可以新增方塊的位置 陣列，隨機取 1 個位置

    // 從 newTileOptList 隨機取一個數字，並用這個數字當新方塊的位置
    let tileCreateClassNum = getRandTileClassNum(tileCanCreateOptList);
    // 給新方塊 隨機數字 (2 or 4)
    let newTileValue = getRandNewTileValue();

    // 在這個位置打開 方塊顯示
    openTile(tileCreateClassNum, newTileValue);

}


// 移動方塊相關

// 如果 遊戲結束判斷 step 2 = false：1. 結束計算步數，計算到達的位置 (物件的 .desinationClassNum) 2. 套用移動方塊動畫 3. 新增方塊
// 　　 　　　　　　           true：1. 結束遊戲提醒 2. 停止偵測鍵盤
// [used by functions.js - function `tileMovesRoutine`]
function moveAndCreateNewTile(direction, scoreObj) {

    // console.group('最後結果');
    // console.log(TileList);
    // console.log(scoreObj);
    // console.groupEnd();

    // 按下按鈕之後，移動動畫 & 新增方塊
    async function createTiles() {
        // console.group('createTiles()');
        await moveAnimations(direction);
        await createATile();
        // console.groupEnd();
    }

    createTiles();
}

// 移動動畫
// [used by animate.js - function `moveAndCreateNewTile`]
async function moveAnimations(direction) {
    // console.group('moveAnimations()');
    try {
        // 抓全部存在的方塊
        let tilesExistList = getExistTiles();
        // console.groupCollapsed('Got all exist Tiles');
        // console.log(tilesExistList);
        // console.groupEnd();

        // 移動動畫
        await applyAnimateCSS(tilesExistList, 300, direction);
        // console.log('applyAnimateCSS success');

        // 改 .reunionState == 1 的方塊 (被合體的方塊) 的數字
        await changeValue(tilesExistList);

        // 隱藏 .reunionState == 2 的方塊 (來合體的方塊)
        await applyHideCSS(tilesExistList);
        // console.log('applyHideCSS success');

        // 更新DOM元素順序
        updateDOM(tilesExistList);

        return 'moveAnimations() DONE!!';

    } catch (error) {
        console.log('ERROR!!!!', error);
    }
    // console.groupEnd();
}

// moveAnimations() 使用功能
// --- 抓 顯示的方塊物件
// [used by animate.js - async function `moveAnimations`]
function getExistTiles() {
    let tilesCanMove = TileList.filter(elem => elem.step >= 0);
    return tilesCanMove;
}

// --- 讓 要移動的方塊物件 根據自己的 .step 屬性，套用對應的 移動動畫class(css)
// [used by animate.js - async function `moveAnimations`]
async function applyAnimateCSS(tilesList, delay, direction) {
    return new Promise((resolve, reject) => {
        for (let tile of tilesList) {
            let steps = tile.step;
            if (steps > 0) {
                // $(`.position${tile.classNum}`).css({
                //     'backgroundColor': 'lightpink',
                //     'opacity': '0.3'
                // })
                $(`.position${tile.classNum}`).toggleClass(`move-${direction}-${steps}-step`);
            }
        }
        // console.log('wait...');
        setTimeout(() => {
            resolve();
            reject('REQUEST ERROR -- applyAnimateCSS');
        }, delay)
    })
}

// --- 如果是 .reunionState == 1 的方塊 (別人移過來被合體的方塊)，更改數字 + 加上一瞬間放大特效
// [used by animate.js - async function `moveAnimations`]
async function changeValue(tilesList) {
    return new Promise((resolve, reject) => {
        let tileWhichReunionStateIsOneList = []
        for (let tile of tilesList) {
            if (tile.reunionState == 1) {
                tileWhichReunionStateIsOneList.push(tile);
                let originalValue = $(`.position${tile.classNum}`).text();
                $(`.position${tile.classNum}`).text(originalValue*2);
            }
        }
        resolve(tileWhichReunionStateIsOneList);
        reject('REQUEST ERROR -- changeValue');
    })
}

// --- 如果是 .reunionState == 2 的方塊 (移動過去跟別人合體的方塊)，移過來之後就消失
// [used by animate.js - async function `moveAnimations`]
async function applyHideCSS(tilesList) {
    let tileWhichReunionStateIsTwoList = []; // 結合後要關掉顯示的方塊
    return new Promise((resolve, reject) => {
        for (let tile of tilesList) {
            if (tile.reunionState == 2) {
                $(`.position${tile.classNum}`).fadeOut();
                tileWhichReunionStateIsTwoList.push(tile);
            }
        }
        resolve(tileWhichReunionStateIsTwoList);
        reject('REQUEST ERROR -- applyHideCSS');
    })
}

// --- 更新DOM元素順序，.reunionState == 0 & 1 方塊原封不動的新增回來
//                     .reunionState == 2 方塊不新增
// [used by animate.js - async function `moveAnimations`]
async function updateDOM(tilesList) {
    $('div[class*=tile-inner]').remove();

    // 先把tile回復預設值 (加上.tile-inner position??)
    $(`.grid-cell`).each(function (idx, elem) {
        let col = parseInt(idx / 4) + 1;
        let row = idx % 4 + 1;
        let tile = $(elem).append(`<div class="tile-inner position${col}${row}"></div>`);
        tile.children().hide();
    })

    // .reunionState == 0 & 1 方塊 (被合體的) 原封不動的新增回來
    for(let tile of tilesList) {
        if (tile.reunionState < 2) { // 0 or 1
            // 抓到達格子的 col、row
            let newCol = parseInt(tile.desinationClassNum / 10);
            let newRow = tile.desinationClassNum % 10;

            // 原封不動的新增回來 -- 加上 active
            $(`.position${tile.desinationClassNum}`).addClass(`active-${tile.value}`).text(tile.value).show();
        } else if (tile.reunionState == 2) {
            // 不做任何事情
        } else {
            console.error('ERROR!!!(.reunionState)');
        }
    }
}