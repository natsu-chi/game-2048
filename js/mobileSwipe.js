// 計算滑動角度
function getAngle(linex, liney) {
    return Math.atan2(liney, linex) * 180 / Math.PI;
}

// 根據終點起點計算返回方向 1向上 2向下 3向左 4向右 0點選
function getDirection(startx, starty, endx, endy) {
    var linex = endx - startx;
    var liney = endy - starty;
    var result = 0;

    // 如果滑動距離太短，則判斷 點選
    if (Math.abs(linex) < 2 && Math.abs(liney) < 2) {
        return result;
    }

    var angle = getAngle(linex, liney);
    if (angle >= -135 && angle <= -45) {
        result = 1;
    } else if (angle > 45 && angle < 135) {
        result = 2;
    } else if (angle >= 135 && angle <= 180 || angle >= -180 && angle < -135) {
        result = 3;
    } else if (angle >= -45 && angle <= 45) {
        result = 4;
    }
    return result;
}