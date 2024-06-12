//Program head for the game.

let home_view = new View(home_update, home_mousedownEvent, home_mousemoveEvent, ()=>{});
let home_buttons = [
   new Button(play_text, CANVAS_WIDTH/4, CANVAS_HEIGHT/2+100, 150, 60, ()=>{view_displacement={x:0,y:0};currentView = game_view;}),
   new Button(credits, CANVAS_WIDTH/2, CANVAS_HEIGHT/2+100, 0.75*230, 60, ()=>{}),
   new Button(learn, 3*CANVAS_WIDTH/4, CANVAS_HEIGHT/2+100, 150, 60, ()=>{})
];

let game_view = new View(game_update, game_mouseDownEvent, game_defaultMousemoveEvent, ()=>{game_view.mousemove=game_defaultMousemoveEvent;}, game_scrollEvent);
let concentricB = new Button(concentric, 890, 220, BUTTON_SIZE, BUTTON_SIZE, ()=>{concentricB.boxed = !concentricB.boxed;});
let coupledB = new Button(coupled, 890, 300, BUTTON_SIZE, BUTTON_SIZE, ()=>{coupledB.boxed = !coupledB.boxed;});
let game_buttons = [
    new Button(plus, 890, 140, BUTTON_SIZE, BUTTON_SIZE, newGear),
    concentricB, coupledB,
    new Button(trash, 890, 380, BUTTON_SIZE, BUTTON_SIZE, removeGear),
    new Button(play, 890, 650, BUTTON_SIZE, BUTTON_SIZE, commit),
    new Button(back, 50, 50, BUTTON_SIZE, BUTTON_SIZE, function(){
        popups.push(new Popup("Exit Game", "Are you sure you want to exit?", undefined, ()=>{home_bg_direction=2*Math.PI*Math.random();currentView=home_view;}, true));
    })
];

var currentView = home_view;

window.addEventListener("load", function(){
    c.width = CANVAS_WIDTH;
    c.height = CANVAS_HEIGHT;
    c.style = "border: 1px solid black";
    document.body.appendChild(c);
    game_view.mousemove = game_defaultMousemoveEvent;
    gears.push(new Gear(ZOOM_CENTER.x, ZOOM_CENTER.y, 1));
    playerPulley = new Pulley(gears[0], 1);
    loadPulley = new Pulley(gears[0], -1);
    generateWeights();
    setInterval(update, 1/FPS);
});

function update(){
    document.onmousedown = (e)=>{currentView.mousedown(e);};
    document.onmousemove = (e)=>{currentView.mousemove(e);};
    document.onmouseup = currentView.mouseup;
    document.onwheel = (e)=>{currentView.scroll(e);};
    currentView.update();
}
