//utils.js contains constants, global variables, and utility functions.

//CONSTANTS =======================================================================================
//Canvas
let c = document.createElement("canvas");
let ctx = c.getContext("2d");
let CANVAS_WIDTH = 960;
let CANVAS_HEIGHT = 720;
let FPS = 30;
let ZOOM_SPEED = 1.04;
let BG_DOT_RAD = 2.2;
let FONT = new FontFace("JB_Mono", 'url(JetBrains_Mono/static/JetBrainsMono-Regular.ttf)');
FONT.load().then(function(font){
    document.fonts.add(font);
});
let ZOOM_CENTER = {x: CANVAS_WIDTH/2, y:CANVAS_HEIGHT/2};
let DEADBAND = Math.pow(10, -6);

//Gears
let COLOR = "#F5D3C0";
let BORDER_COLOR = "#6B5152"
let BORDER_WIDTH = 15;
let DOT_RAD = 9;
let DOT_POS_RATIO = 0.75;
let DEFAULT_R = 50;
let BG_DOT_SPACING = DEFAULT_R*2;
let FONT_RATIO = 0.5;
let LINEWIDTH = 2;
let PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]; //No one will go higher, most likely.

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
let coins = new Image();
coins.src = "images/coins.png";
let check = new Image();
check.src = "images/check.png";
let x_button = new Image();
x_button.src = "images/x.png";

//Buttons
let BOX_RADIUS = 10;
let BUTTON_SIZE = 55;
let HOVER_SCALE = 1.5;
let SCALE_SPEED = 0.02;

//Popups
let POPUP_WIDTH = CANVAS_WIDTH*0.45;
let POPUP_HEIGHT = CANVAS_HEIGHT*0.35;
let GRAY = "#D5D5D5";
let CORNER_RADIUS = 15;

//Pulleys
let ROPE_THICKNESS = 3;
let DEFAULT_L = 125;
let LIMIT_L = 75;
let LOAD_LT = 50;
let LOAD_H = 35;
let LOAD_LB = 75;
let M = 0.000005;

//Game
let PENALTY = 0.2;
let PROG_BAR_W = 200;
let PROG_BAR_H = 15;
let GO_PAUSE = 3000;

//GLOBAL VARIABLES ================================================================================
var selected = null; //Selected gear
var zoom = 1;
var view_displacement = {x: 0, y: 0};
var playerPulley;
var loadPulley;
var gears = [];
var availableGears = [1, 2, 3, 5];
var difficulty = 1;
var popups = [];
var go = false;
var stage = 1;
var progress = 0;
var show_speed_display = false;

//UTILITY FUNCTIONS =======================================================================================
function mouse(e) {
    var rect = c.getBoundingClientRect();
    return {
      x:e.clientX - rect.left,
      y:e.clientY - rect.top
    };
}
function vectorMagnitude(dx, dy){
    return Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
}
function removeFromArray(item, array){
    for(let i=array.length-1; i>=0; i--){
        if(array[i]==item) array.splice(i, 1);
    }
}
function decimalToFraction(q){
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
function drawTrapezoid(x, y, lt, lb, h){
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x+lt, y);
    ctx.lineTo(x+lt+(lb-lt)/2, y+h);
    ctx.lineTo(x-(lb-lt)/2, y+h);
    ctx.closePath();
    ctx.fill();
}
function primeNumberAfter(n){
    var i;
    for(i=0; PRIMES[i]!=n && i<PRIMES.length; i++);
    if(i>=PRIMES.length-1) return PRIMES[PRIMES.length-1];
    return PRIMES[i+1];
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