var gears = [];

var availableGears = [1, 2, 3, 5];
var difficulty = 1;
var popups = [];
var go = false;
var stage = 1;
var score = 0;

var show_speed_display = false;

function generateWeights(){
    //Mechanical advantage will be some product of availableGears over some other product of availableGears
    //Weights will correspond to each of those products
    //More difficult levels will have new availableGears factors and more composite products
    var temp = [];
    availableGears.forEach((r)=>{temp.push(r);});
    for(let i=temp.length-1; i>=0; i--) if(PRIMES.indexOf(temp[i])<0) temp.splice(i, 1);
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
function updateAvailableGears(){
    if(PRIMES.indexOf(stage)>=0){
        if(availableGears.indexOf(stage)<0){
            availableGears.push(stage);
            popups.push(new Popup("New Gear!", "The stage number is prime.", "You may now use " + stage + "-gears."));
        }
    }
}

function getStageValue(){
    return Math.round(SCORE_BASE*Math.pow(DIFF_BONUS, difficulty-1)*Math.pow(R_BONUS, availableGears.length-4));
}
function getThresPts(){
    return SCORE_BASE*Math.pow(THROTTLE, difficulty);
}

function snapR(r){ //Relies on availableGears being in order.
    var i;
    for(i=0; r>availableGears[i] && i<availableGears.length; i++);
    if(i==0) return availableGears[0];
    if(i==availableGears.length) return availableGears[availableGears.length-1];
    return r >= (availableGears[i-1]+availableGears[i])/2 ? availableGears[i] : availableGears[i-1];
}

function commit(){
    go = true;
    window.setTimeout(function(){
        if(getNetTorque()==0) popups.push(new Popup("Success!", "You have balanced the weights!", "Points earned: " + getStageValue(), action=nextStage));
        else popups.push(new Popup("Oh no!", "Your weights are unbalanced.", "Try again!", ()=>{
            resetGears();
            score -= PENALTY*getStageValue();
            go=false;
        }));
    }, GO_PAUSE);
}

function nextStage(){
    go = false;
    gears = [new Gear(ZOOM_CENTER.x, ZOOM_CENTER.y, 1)];
    playerPulley.gear = gears[0];
    playerPulley.side = 1;
    loadPulley.gear = gears[0];
    loadPulley.side = -1;
    playerPulley.snap();
    loadPulley.snap();
    score += getStageValue();
    stage ++;
    if(score >= getThresPts()) difficulty ++;
    updateAvailableGears();
    generateWeights();
}

function simulateGame(turns){
    var s = 0;
    var e = 0;
    var ag = 4;
    var d = 1;
    for(let i=1; i<=turns; i++){
        e = Math.round(SCORE_BASE*Math.pow(DIFF_BONUS, d-1)*Math.pow(R_BONUS, ag-4));
        console.log("Turn " + i + ": " + s + ", +" + e);
        s += e;
        if(PRIMES.indexOf(i)>=0){
            if(30%i > 0) ag ++;
        }
        if(s >= SCORE_BASE*Math.pow(THROTTLE, d)){
            d ++;
            console.log("Difficulty incremented to " + d);
        }
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