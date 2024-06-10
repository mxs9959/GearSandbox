var gears = [];

var availableGears = [1, 2, 3, 5];
var difficulty = 1;
var popups = [];
var go = false;
var $ = 100; //Haha, the dollar sign can be a variable name!
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

var show_speed_display = false;

function generateWeights(){
    //Mechanical advantage will be some product of availableGears over some other product of availableGears
    //Weights will correspond to each of those products
    //More difficult levels will have new availableGears factors and more composite products
    var temp = [];
    availableGears.forEach((r)=>{temp.push(r);});
    temp.splice(0, 1);
    var playerFactors = [];
    var loadFactors = [];
    var current = playerFactors;
    while(temp.length>0){
        let i = Math.floor(temp.length*Math.random())
        current.push(temp[i]);
        temp.splice(i, 1);
        current = current==playerFactors? loadFactors : playerFactors;
    }
    while(playerFactors.length < difficulty) playerFactors.push(playerFactors[Math.floor(playerFactors.length*Math.random())]);
    while(loadFactors.length < difficulty) loadFactors.push(loadFactors[Math.floor(loadFactors.length*Math.random())]);
    playerPulley.weight = 1;
    loadPulley.weight = 1;
    for(let i=0; i<difficulty; i++){
        playerPulley.weight *= playerFactors[i];
        loadPulley.weight *= loadFactors[i];
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
    if(Math.round(spend$)>$){
        popups.push(new Popup("You're in the hole!", "You cannot simulate the weights until your balance is positive.", "If you can't fix your balance, then it's game over!"));
        return;
    }
    go = true;
    window.setTimeout(function(){
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
            assessGameProgress();
            generateWeights();
        }));
        else popups.push(new Popup("Oh no!", "Your weights are unbalanced.", "Try again!", ()=>{
            resetGears();
            go=false;
            updateSpend$();
            $ -= Math.round(spend$*getBonusMultiplier());
        }));
    }, GO_PAUSE);
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
function getBonusMultiplier(){ //This controls game rate, essentially.
    return bonus*difficulty;
}

function assessGameProgress(){
    /*
    The game's progress is measured by the player's current money balance.
    For any given task in the game, the player will have a certain set of gears available and a certain maximum quantity of gears required.
    There is a maximum price, then, to be able to complete a task.
    If the player's balance exceeds the maximum price for an upgraded game, then the game's difficulty will increase.
    New-radius gears will be added randomly when the player's balance is high enough.
    As the difficulty increases, the player's bonus percentage increases linearly. (This is the main control over the speed of game progress.)
    Difficulty only increases, and the gear set will not become smaller, so players should not let their balance fall too low.
    */
    let max = getGearCost(primeNumberAfter(availableGears[availableGears.length-1])*DEFAULT_R)*(difficulty+1)*2; //Of course, this scenario could never actually take place.
    if($ > max){
        if(Math.random()<NEW_R_PROB){
            availableGears.push(primeNumberAfter(availableGears[availableGears.length-1]));
            popups.push(new Popup("New Gear!", "You can now use a " + availableGears[availableGears.length-1] + "-gear!", "Each costs $" + Math.round(getGearCost(availableGears[availableGears.length-1]*DEFAULT_R)) +"."));
        }
        difficulty++;
    }
}

class Popup {
    constructor(title, message0, message1="", action=()=>{}, optional=false){
        this.title = title;
        this.message0 = message0;
        this.message1 = message1;
        this.button0 = new Button(check, CANVAS_WIDTH/2 + (optional? 0.6*BUTTON_SIZE : 0), CANVAS_HEIGHT/2+0.3*POPUP_HEIGHT, BUTTON_SIZE, BUTTON_SIZE, ()=>{
            action();
            removeFromArray(this, popups);
        });
        this.button1 = optional? (new Button(x_button, CANVAS_WIDTH/2 - 0.6*BUTTON_SIZE, CANVAS_HEIGHT/2+0.3*POPUP_HEIGHT, BUTTON_SIZE, BUTTON_SIZE, ()=>{removeFromArray(this, popups);})) : null;
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

        this.button0.rescale();
        this.button0.draw();
        if(this.button1 != null){
            this.button1.rescale();
            this.button1.draw();
        }
    }
}