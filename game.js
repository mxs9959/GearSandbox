var popups = [];

var availableGears = [2, 3, 5];
var difficulty = 2;

var $ = 0; //Haha, the dollar sign can be a variable name!
var go = false;

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

function commit(){
    go = true;
    if(getNetTorque()==0) popups.push(new Popup("Success!", "You have balanced the weights!", "On to the next level!", ()=>{
        generateWeights();
        resetGears();
        go=false;
    }));
    else popups.push(new Popup("Oh no!", "Your weights are unbalanced.", "Try again!", ()=>{
        resetGears();
        go=false;
    }));
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