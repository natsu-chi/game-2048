$(function () {
    // 遊戲開始設定
    
    // 隱藏所有方塊
    $('.tile-inner').hide();

    // 遊戲參數設定
    var myScore = new Score(0, 0);
    let isGameover = false;
    var TileList = []; // 存放 Tile 物件

    // 遊戲初始
    // --- 新增兩個方塊
    createATile();
    createATile();

    // ---------------測試區域---------------
    // $('.position11').text(4).addClass('active-2').show();
    // $('.position21').text(4).addClass('active-2').show();
    // $('.position31').text(4).addClass('active-2').show();
    // $('.position41').text(4).addClass('active-2').show();
    // let direction = 'up';
    // console.log(`Now test: ${direction}`)

    // tileMovesRoutine(direction, isGameover, myScore);
    // ---------------測試區域---------------

    // 當使用者按下按鈕 → 執行 detectKeydown、tileMovesRoutine(direction)

    // 偵測相關
    // --- 偵測鍵盤動作
    // [used by functions.js - function `startDetectKeydown`]
    // [used by functions.js - self]
    function detectKeydown(event) {
        if (!isGameover) {
            console.clear();
            switch (event.keyCode) {
                case 37: // left
                    // 暫時停止偵測鍵盤動作
                    document.removeEventListener('keydown', detectKeydown);
                    direction = 'left';
                    console.log(direction);
                    tileMovesRoutine(direction, isGameover, myScore);
                    setTimeout(startDetectKeydown, 310);
                    break;
                case 38: // up
                    document.removeEventListener('keydown', detectKeydown);

                    direction = 'up';
                    console.log(direction);
                    tileMovesRoutine(direction, isGameover, myScore);
                    setTimeout(startDetectKeydown, 310);
                    break;
                case 39: // right
                    document.removeEventListener('keydown', detectKeydown);

                    direction = 'right';
                    console.log(direction);
                    tileMovesRoutine(direction, isGameover, myScore);
                    setTimeout(startDetectKeydown, 310);
                    break;
                case 40: // down
                    document.removeEventListener('keydown', detectKeydown);

                    direction = 'down';
                    console.log(direction);
                    tileMovesRoutine(direction, isGameover, myScore);
                    setTimeout(startDetectKeydown, 310);
                    break;
                default: // 沒反應
            }
        }
    }

    // 開始偵測鍵盤動作
    // [used by app.js]
    function startDetectKeydown() {
        document.addEventListener('keydown', detectKeydown);
        document.addEventListener('keydown', function(event) {
            if(event.keyCode == 38 || event.keyCode == 40) {
                event.preventDefault();
            }
        })
    }

    // --- 開啟鍵盤偵測功能
    startDetectKeydown();        


    // 重新開始遊戲
    // --- 按下 newgame 按鈕執行 重新遊戲設定
    $('.newGame').click(function() {
        newGame(myScore.bestRecord);
    });
    

})