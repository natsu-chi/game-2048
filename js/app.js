$(function () {
    // 禁止用戶縮放
    document.addEventListener('touchstart',function (event) { 
        if(event.touches.length>=2){ 
          event.preventDefault(); 
        } 
    }) 
    
    document.addEventListener('touchmove',function (event) { 
        if(event.touches.length>=2){ 
          event.preventDefault(); 
        } 
    }) 
    
    document.addEventListener('touchend',function (event) { 
        if(event.touches.length>=2){ 
          event.preventDefault(); 
        } 
    }) 

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


    // 偵測滑動動作

    // --- 開始偵測滑動動作
    function detectSwipeDirec(swipeDirection) {
        if (!isGameover) {
            console.clear();
            tileMovesRoutine(swipeDirection, isGameover, myScore);
            // setTimeout(startDetectSwipeDirec, 310);
        }
    }

    function startDetectSwipeDirec() {
        var startx, starty;
        var endx, endy;
        var swipeDirection = '';
        let gameFrame = document.querySelector('.game-frame');
        
        gameFrame.addEventListener('touchstart', function(e) {
            startx = e.touches[0].pageX;
            starty = e.touches[0].pageY;
            // 暫時停止偵測滑動動作
            gameFrame.removeEventListener('touchstart', startDetectSwipeDirec);
        });

        gameFrame.addEventListener('touchend', function(e) {
            // 暫時停止偵測滑動動作
            gameFrame.removeEventListener('touchend', startDetectSwipeDirec);

            endx = e.changedTouches[0].pageX;
            endy = e.changedTouches[0].pageY;
            var direction = getDirection(startx, starty, endx, endy);
            switch (direction) {
                case 0:
                    swipeDirection = '';
                    break;
                case 1:
                    swipeDirection = 'up';
                    break;
                case 2:
                    swipeDirection = 'down';
                    break;
                case 3:
                    swipeDirection = 'left';
                    break;
                case 4:
                    swipeDirection = 'right';
                    break;
                default:
                    swipeDirection = '';
            }

            if (swipeDirection) {
                detectSwipeDirec(swipeDirection);
            } else {
                // startDetectSwipeDirec();
            }
        });


    }

    // --- 開啟鍵盤偵測功能
    startDetectKeydown();

    // --- 開啟手機滑動偵測功能
    startDetectSwipeDirec();


    // 重新開始遊戲
    // --- 按下 newgame 按鈕執行 重新遊戲設定
    $('.newGame').click(function() {
        newGame(myScore.bestRecord);
    });

})