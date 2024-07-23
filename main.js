//Program head for the game.

let home_view = new View(home_update, home_mousedownEvent, home_mousemoveEvent, ()=>{});
let home_buttons = [
   new Button(play, CANVAS_WIDTH/2, CANVAS_HEIGHT/2+100, BUTTON_SIZE*1.7, BUTTON_SIZE*1.7, ()=>{view_displacement={x:0,y:0};currentView = game_view;}),
   new Button(credits, CANVAS_WIDTH-50, CANVAS_HEIGHT-30, 0.75*92, 24, ()=>{currentView = credits_view;})
];

let game_view = new View(game_update, game_mouseDownEvent, game_defaultMousemoveEvent, ()=>{game_view.mousemove=game_defaultMousemoveEvent;}, game_scrollEvent);
let game_buttons = [
    new Button(play, 890, 650, BUTTON_SIZE, BUTTON_SIZE, commit),
    new Button(back, 50, 50, BUTTON_SIZE, BUTTON_SIZE, function(){
        popups.push(new Popup("Exit Game", "Are you sure you want to exit?", undefined, ()=>{home_bg_direction=2*Math.PI*Math.random();tutorial_progress=-1;popups=[];currentView=home_view;}, true));
    }),
    new Button(help, 50, 650, BUTTON_SIZE, BUTTON_SIZE, ()=>{showDemo=stage==1?1:2;(stage==1?demo:demo2).play();})
];

let credits_view = new View(credits_update, credits_mousedownEvent, credits_mousemoveEvent, ()=>{});
let credits_backButton = new Button(back, 50, 50, BUTTON_SIZE, BUTTON_SIZE, ()=>{home_bg_direction=2*Math.PI*Math.random();currentView=home_view;});

var currentView = home_view;

window.addEventListener("load", function(){
    c.width = CANVAS_WIDTH;
    c.height = CANVAS_HEIGHT;
    c.style = "border: 1px solid black";
    document.getElementById("canvasDiv").appendChild(c);
    game_view.mousemove = game_defaultMousemoveEvent;
    gears.push(new Gear(ZOOM_CENTER.x, ZOOM_CENTER.y, 1));
    playerPulley = new Pulley(gears[0], 1);
    loadPulley = new Pulley(gears[0], -1);
    generateStage();
    popups.push(new Popup("Tutorial", "Please watch the following demo.", undefined, ()=>{showDemo=1;demo.play();}));
    popups.push(new Popup("Gears", "To balance the weights, use gears.", "Experiment with different combinations to create balance!"));
    popups.push(new Popup("Goal", "Your goal in each level is to balance the weights.", "Weights are trapezoids labeled with their masses."));
    window.requestAnimationFrame(update);
});

function update(){
    if(showDemo!=0){
        document.onmousedown = (e)=>{};
        document.onmousemove = (e)=>{};
        document.onmouseup = (e)=>{};
        document.onwheel = (e)=>{};
        let showing = showDemo==1?demo:demo2;
        ctx.drawImage(showing, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        if(showing.ended) showDemo = 0;
    } else {
        document.onmousedown = (e)=>{currentView.mousedown(e);};
        document.onmousemove = (e)=>{currentView.mousemove(e);};
        document.onmouseup = currentView.mouseup;
        document.onwheel = (e)=>{currentView.scroll(e);};
        currentView.update();
    }
    window.requestAnimationFrame(update);
}

//HOME
function home_update(){
    ctx.clearRect(0,0,c.width,c.height);
    //Drawing background
    view_displacement.x -= BG_GLIDE*Math.cos(home_bg_direction);
    view_displacement.y -= BG_GLIDE*Math.sin(home_bg_direction);
    drawBg();
    //Drawing title
    ctx.drawImage(tension, CANVAS_WIDTH/2-TITLE_W/2, CANVAS_HEIGHT/2-TITLE_H/2-100, TITLE_W, TITLE_H);
    //Drawing buttons
    home_buttons.forEach(function(b){
        b.rescale();
        b.draw();
    });
}
function home_mousedownEvent(e){
    home_buttons.forEach(function(b){
        if(b.containsPoint(mouse(e).x, mouse(e).y)){
            b.action();
        }
    });
}
function home_mousemoveEvent(e){
    c.style.cursor = "auto";
    home_buttons.forEach(function(b){
        if(b.containsPoint(mouse(e).x, mouse(e).y)){
            c.style.cursor = "pointer";
            b.targetScale = HOVER_SCALE;
        } else b.targetScale = 1;
    });
};

//CREDITS
function credits_update(){
    ctx.clearRect(0,0,c.width,c.height);
    //Drawing title
    ctx.drawImage(credits, CANVAS_WIDTH/2-credits.width/2, 10, 200, 80)
    //Drawing articles
    let x = CANVAS_WIDTH/2-715/2;
    ctx.drawImage(credits_, x, 100);
    //Drawing button
    learn_backButton.rescale();
    learn_backButton.draw();
}
function credits_mousedownEvent(e){
    if(credits_backButton.containsPoint(mouse(e).x, mouse(e).y)) credits_backButton.action();
}
function credits_mousemoveEvent(e){
    c.style.cursor = "auto";
    if(credits_backButton.containsPoint(mouse(e).x, mouse(e).y)){
        c.style.cursor = "pointer";
        credits_backButton.targetScale = HOVER_SCALE;
    } else credits_backButton.targetScale = 1;
}
