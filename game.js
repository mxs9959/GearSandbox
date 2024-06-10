var gears = [];

var availableGears = [1, 2, 3, 5];
var difficulty = 2;
var popups = [];
var go = false;
var $ = C*availableGears[availableGears.length-1]; //Haha, the dollar sign can be a variable name!
/*
How money works:

As the game progresses, new-radius gears will become necessary, which will demand the player to spend more money, but for greater reward.

R-1 gears are free.
Since the same ratio can be attained with 1 R-9 gear as 2 R-3 gears, gear prices will increase logarithmically.
In fact, P(r) = C*log(r)/log(2), where C is the cost of an R-2 gear. Wow, that works out nicely!

Players can sell gears back to the game for half of their original price.
Upon successful completion of a level, players earn back whatever they spent on their gear train, plus a bonus that depends on the level's difficulty.

Players continue until they can no longer afford gears to balance the weights. Then, the game is over.
*/
var spend$ = 0;
var bonus = 0.25;

function generateWeights(){
    //Mechanical advantage will be some product of availableGears over some other product of availableGears
    //Weights will correspond to each of those products
    //More difficult levels will have new availableGears factors and more composite products
    playerPulley.weight = 1;
    loadPulley.weight = 1;
    for(let i=0; i<difficulty; i++){
        playerPulley.weight *= availableGears[Math.floor(Math.random()*availableGears.length)];
        loadPulley.weight *= availableGears[Math.floor(Math.random()*availableGears.length)];
    }
}

function snapR(r){
    var i;
    for(i=0; r>availableGears[i] && i<availableGears.length; i++);
    if(i==0) return availableGears[0];
    if(i==availableGears.length) return availableGears[availableGears.length-1];
    return r >= (availableGears[i-1]+availableGears[i])/2 ? availableGears[i] : availableGears[i-1];
}

function commit(){
    go = true;
    if(getNetTorque()==0) popups.push(new Popup("Success!", "You have balanced the weights!", "You profit $" + Math.round(spend$*getBonusMultiplier()) + ".", ()=>{
        go = false;
        updateSpend$();
        $ += Math.round(spend$*getBonusMultiplier());
        gears = [new Gear(ZOOM_CENTER.x, ZOOM_CENTER.y, 1)];
        updateSpend$();
        playerPulley.gear = gears[0];
        playerPulley.side = 1;
        loadPulley.gear = gears[0];
        loadPulley.side = -1;
        playerPulley.snap();
        loadPulley.snap();
        generateWeights();
    }));
    else popups.push(new Popup("Oh no!", "Your weights are unbalanced.", "Try again!", ()=>{
        resetGears();
        go=false;
    }));
}

function getGearCost(r){
    return C*Math.log(Math.round(r/DEFAULT_R))/Math.log(2);
}
function getTrainCost(g){
    var total = 0;
    for(; g.child.g != null; g=g.child.g) total += getGearCost(g.r);
    return total + getGearCost(g.r);
}
function updateSpend$(){
    spend$ = 0;
    gears.forEach(function(g){
        spend$ += getTrainCost(g);
    });
}
function getBonusMultiplier(){
    return bonus*Math.log(difficulty)/Math.log(2); //Bonus multiplier also increases logarithmically.
}

class Popup {
    constructor(title, message0, message1="", action){
        this.title = title;
        this.message0 = message0;
        this.message1 = message1;
        this.button = new Button(check, CANVAS_WIDTH/2, CANVAS_HEIGHT/2+0.3*POPUP_HEIGHT, BUTTON_SIZE, BUTTON_SIZE, ()=>{
            action();
            removeFromArray(this, popups);
        });
    }
    draw(){
        ctx.beginPath();
        ctx.fillStyle = GRAY;
        ctx.lineWidth = LINEWIDTH;
        ctx.roundRect(CANVAS_WIDTH/2-POPUP_WIDTH/2, CANVAS_HEIGHT/2-POPUP_HEIGHT/2, POPUP_WIDTH, POPUP_HEIGHT, CORNER_RADIUS);
        ctx.stroke();
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.lineWidth = 1;

        ctx.font = "45px JB_Mono";
        ctx.textAlign = "center";
        ctx.fillText(this.title, CANVAS_WIDTH/2, CANVAS_HEIGHT/2-0.25*POPUP_HEIGHT, 0.5*POPUP_WIDTH);
        ctx.font = "20px JB_Mono";
        ctx.fillText(this.message0, CANVAS_WIDTH/2, CANVAS_HEIGHT/2-0.05*POPUP_HEIGHT, 0.85*POPUP_WIDTH);
        ctx.fillText(this.message1, CANVAS_WIDTH/2, CANVAS_HEIGHT/2+0.1*POPUP_HEIGHT, 0.85*POPUP_WIDTH);

        this.button.rescale();
        this.button.draw();
    }
}