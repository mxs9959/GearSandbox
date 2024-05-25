//SIMPLE, ALTERNATE GAME. NOT PART OF FINAL PRODUCT.

var availableGears = [2, 3, 5];
var targetRatio = newGoal();

function newGoal(){
    return decimalToFraction(
        availableGears[Math.floor(Math.random()*availableGears.length)] / 
        availableGears[Math.floor(Math.random()*availableGears.length)]
    );
}
function checkGoal(){
    if(selected!=null){
        if(targetRatio.n == decimalToFraction(Math.abs(selected.v/DEFAULT_V)).n && targetRatio.d == decimalToFraction(Math.abs(selected.v/DEFAULT_V)).d){
            targetRatio = newGoal();
        }
    }
}
function drawGoal(){
    ctx.font = "45px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Target ratio: " + targetRatio.n + ":" + targetRatio.d, 25, 60);
}