//Canvas
let c = document.createElement("canvas");
let ctx = c.getContext("2d");
let CANVAS_WIDTH = 960;
let CANVAS_HEIGHT = 720;
let FPS = 30;
let ZOOM_SPEED = 1.05;

//Gears
let COLOR = "#F5D3C0";
let BORDER_COLOR = "#6B5152"
let BORDER_WIDTH = 15;
let DOT_RAD = 9;
let DOT_POS_RATIO = 0.75;
let DEFAULT_V = 0.01;
let DEFAULT_R = 50;
let FONT_RATIO = 0.5;

//Images
let throttle = new Image();
throttle.src = "images/throttle.png";
let plus = new Image();
plus.src = "images/plus.png";
let concentric = new Image();
concentric.src = "images/concentric.png";
let coupled = new Image();
coupled.src = "images/coupled.png";
let trash = new Image();
trash.src = "images/trash.png";


//Buttons
let BOX_RADIUS = 10;
let BUTTON_SIZE = 80;
let concentricB = new Button(concentric, 100, 660, BUTTON_SIZE, BUTTON_SIZE, ()=>{concentricB.boxed = !concentricB.boxed;});
let coupledB = new Button(coupled, 250, 660, BUTTON_SIZE, BUTTON_SIZE, ()=>{coupledB.boxed = !coupledB.boxed;});
let buttons = [
    new Button(plus, 860, 660, BUTTON_SIZE, BUTTON_SIZE, newGear),
    concentricB, coupledB,
    new Button(trash, 710, 660, BUTTON_SIZE, BUTTON_SIZE, ()=>{if(selected!=null)removeFromArray(selected, selected.gg.gears);})
];
let HOVER_SCALE = 1.4;
let SCALE_SPEED = 0.02;

//Helper functions
function vectorMagnitude(dx, dy){
    return Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
}
function removeFromArray(item, array){
    for(let i=array.length-1; i>=0; i--){
        if(array[i]==item) array.splice(i, 1);
    }
}
function decimalToFraction(q){ //Recursive! It works!!!!!!!!!
    let DEADBAND = Math.pow(10, -6);
    q = Math.abs(q);
    let whole = Math.floor(q);
    if(q%1<DEADBAND) return { n: Math.round(q), d: 1};
    let invPart = 1/(q%1);
    var fraction;
    if(invPart%1>DEADBAND){
        fraction = decimalToFraction(invPart);
        let temp = fraction.n;
        fraction.n = fraction.d;
        fraction.d = temp;
    } else fraction = {
        n: 1,
        d: invPart
    };
    return {
        n: Math.round(fraction.n + whole*fraction.d),
        d: Math.round(fraction.d)
    };
}

//Zoom transformation functions
function nX(x){
    return CANVAS_WIDTH/2 + (x-CANVAS_WIDTH/2)*zoom;
}
function anX(x){ //Inverse
    return (x-CANVAS_WIDTH/2)/zoom + CANVAS_WIDTH/2;
}
function nY(y){
    return CANVAS_HEIGHT/2 + (y-CANVAS_HEIGHT/2)*zoom;
}
function anY(y){
    return (y-CANVAS_HEIGHT/2)/zoom + CANVAS_HEIGHT/2;
}
function nS(s){
    return s*zoom;
}