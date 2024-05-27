//Canvas
let c = document.createElement("canvas");
let ctx = c.getContext("2d");
let CANVAS_WIDTH = 960;
let CANVAS_HEIGHT = 720;
let FPS = 30;
let ZOOM_SPEED = 1.04;
let BG_DOT_RAD = 2.2;

//Gears
let COLOR = "#F5D3C0";
let BORDER_COLOR = "#6B5152"
let BORDER_WIDTH = 15;
let DOT_RAD = 9;
let DOT_POS_RATIO = 0.75;
let DEFAULT_V = 0.01;
let DEFAULT_R = 50;
let FONT_RATIO = 0.5;
let LINEWIDTH = 2;

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
let play = new Image();
play.src = "images/play.png";
let reset = new Image();
reset.src = "images/reset.png";

//Buttons
let BOX_RADIUS = 10;
let BUTTON_SIZE = 55;
let HOVER_SCALE = 1.7;
let SCALE_SPEED = 0.02;

//Pulleys
let ROPE_THICKNESS = 3;
let DEFAULT_L = 125;
let LIMIT_L = 75;
let LOAD_LT = 50;
let LOAD_H = 35;
let LOAD_LB = 75;

//Dependency problems that mess with my organization:
let ZOOM_CENTER = {x: CANVAS_WIDTH/2, y:CANVAS_HEIGHT/2};
let BG_DOT_SPACING = DEFAULT_R*2;

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
//Yes, you can count on me to incorporate differential calculus into my code.
//Only returns correct value when point is is in QI or QIV relative to circle. (Add pi to the end to fix that.)
//Also, I decided that I don't need this after all. :/
function getTangentPoint(px, py, cx, cy, r, invert){
    let s = (invert?-1:1)*(Math.PI/2 - Math.asin(r/vectorMagnitude(px-cx,py-cy))) + Math.atan((py-cy)/(px-cx));
    return {x: r*Math.cos(s)+cx, y: r*Math.sin(s)+cy};
}
function drawTrapezoid(x, y, lt, lb, h){
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x+lt, y);
    ctx.lineTo(x+lt+(lb-lt)/2, y+h);
    ctx.lineTo(x-(lb-lt)/2, y+h);
    ctx.closePath();
    ctx.fill();
}

//Zoom transformation functions
function nX(x){
    return ZOOM_CENTER.x + (x-ZOOM_CENTER.x)*zoom + view_displacement.x;
}
function anX(x){ //Inverse
    return ((x-view_displacement.x)-ZOOM_CENTER.x)/zoom + ZOOM_CENTER.x;
}
function nY(y){
    return ZOOM_CENTER.y + (y-ZOOM_CENTER.y)*zoom + view_displacement.y;
}
function anY(y){
    return ((y-view_displacement.y)-ZOOM_CENTER.y)/zoom + ZOOM_CENTER.y;
}
function nS(s){
    return s*zoom;
}