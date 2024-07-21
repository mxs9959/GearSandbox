//Program head for the game.

let home_view = new View(home_update, home_mousedownEvent, home_mousemoveEvent, ()=>{});
let home_buttons = [
   new Button(play_text, CANVAS_WIDTH/3+70, CANVAS_HEIGHT/2+100, 150, 60, ()=>{view_displacement={x:0,y:0};currentView = game_view;}),
   new Button(credits, CANVAS_WIDTH-50, CANVAS_HEIGHT-30, 0.75*92, 24, ()=>{view_displacement={x:0,y:0};zoom=1;currentView = credits_view;}),
   new Button(learn, 2*CANVAS_WIDTH/3-70, CANVAS_HEIGHT/2+100, 150, 60, ()=>{view_displacement={x:0,y:0};zoom=1;currentView = learn_view;})
];

let game_view = new View(game_update, game_mouseDownEvent, game_defaultMousemoveEvent, ()=>{game_view.mousemove=game_defaultMousemoveEvent;}, game_scrollEvent);
let game_buttons = [
    new Button(plus, 800, 50, BUTTON_SIZE, BUTTON_SIZE, newGear),
    new Button(trash, 890, 50, BUTTON_SIZE, BUTTON_SIZE, removeGear),
    new Button(play, 890, 650, BUTTON_SIZE, BUTTON_SIZE, commit),
    new Button(back, 50, 50, BUTTON_SIZE, BUTTON_SIZE, function(){
        popups.push(new Popup("Exit Game", "Are you sure you want to exit?", undefined, ()=>{home_bg_direction=2*Math.PI*Math.random();tutorial_progress=-1;popups=[];currentView=home_view;}, true));
    })
];

let learn_view = new View(learn_update, learn_mousedownEvent, learn_mousemoveEvent, ()=>{}, learn_scrollEvent);
let learn_backButton = new Button(back, 50, 50, BUTTON_SIZE, BUTTON_SIZE, ()=>{home_bg_direction=2*Math.PI*Math.random();currentView=home_view;});

let credits_view = new View(credits_update, credits_mousedownEvent, credits_mousemoveEvent, ()=>{});

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
    generateStage();
    popups.push(new Popup("Tutorial", "Please watch the following demo.", undefined, ()=>{showDemo = true;demo.play();}));
    popups.push(new Popup("Gears", "To balance the weights, we can use gears.", "Experiment with different radii to create balance!"));
    popups.push(new Popup("Goal", "Your goal in each level is to balance the weights.", "Weights are trapezoids labeled with their masses."));
    window.setInterval(update, 1/FPS);
});

function update(){
    if(showDemo){
        document.onmousedown = (e)=>{};
        document.onmousemove = (e)=>{};
        document.onmouseup = (e)=>{};
        document.onwheel = (e)=>{};
        ctx.drawImage(demo, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        if(demo.ended) showDemo = false;
    } else {
        document.onmousedown = (e)=>{currentView.mousedown(e);};
        document.onmousemove = (e)=>{currentView.mousemove(e);};
        document.onmouseup = currentView.mouseup;
        document.onwheel = (e)=>{currentView.scroll(e);};
        currentView.update();
    }
}
