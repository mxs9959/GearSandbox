//Program head for the game.

let home_view = new View(home_update, home_mousedownEvent, home_mousemoveEvent, ()=>{});
let home_buttons = [
   new Button(play_text, CANVAS_WIDTH/3+70, CANVAS_HEIGHT/2+100, 150, 60, ()=>{view_displacement={x:0,y:0};currentView = game_view;}),
   new Button(credits, CANVAS_WIDTH-50, CANVAS_HEIGHT-30, 0.75*92, 24, ()=>{view_displacement={x:0,y:0};zoom=1;currentView = credits_view;}),
   new Button(learn, 2*CANVAS_WIDTH/3-70, CANVAS_HEIGHT/2+100, 150, 60, ()=>{view_displacement={x:0,y:0};zoom=1;currentView = learn_view;})
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
    popups.push(new Popup("Welcome!", "Would you like a tutorial?", "(Exit at any time by clicking back button.)", ()=>{tutorial_progress=0;}, true));
    setInterval(update, 1/FPS);
});

function tutorial_check(){
    if(tutorial_progress==0){
        popups.push(new Popup("Gears", "To balance the weights, we can use gears.", "Click the plus button to create a gear, and click anywhere to place it."));
        popups.push(new Popup("Goal", "Your goal in each level is to balance the weights.", "Weights are trapezoids labeled with their masses."));
        tutorial_progress+=2;
    }
    if(tutorial_progress==2 && gears.length==2 && currentView.mousemove == game_defaultMousemoveEvent){
        popups.push(new Popup("Resizing Gears", "Hover over the edge of a gear, then drag to scale its radius up to 15.", "Don't forget that you can zoom out by scrolling!"));
        tutorial_progress++;
    }
    if(tutorial_progress==3 && gears.length>1 && (gears[0].r/DEFAULT_R>1 || gears[1].r/DEFAULT_R>1) && currentView.mousemove == game_defaultMousemoveEvent){
        popups.push(new Popup("Gear Trains", "Select a gear, then click the Stacked or Coupled button (right).", "Lastly, click another gear to create a train."));
        tutorial_progress++;
    }
    if(tutorial_progress==4 && gears.length>0 && gears[0].child.g!=null){
        popups.push(new Popup("Solve the Level", "Now, create two gears with radii " + requiredGears[0] + " and " + requiredGears[1] + ".", "Make the smaller gear stacked on top of the bigger one.", ()=>{
            gears = [new Gear(ZOOM_CENTER.x, ZOOM_CENTER.y, 1)];
            playerPulley.gear = gears[0];
            playerPulley.side = 1;
            loadPulley.gear = gears[0];
            loadPulley.side = -1;
            playerPulley.snap();
            loadPulley.snap();
        }));
        tutorial_progress++;
    }
    if(tutorial_progress==5 && gears.length>0 && gears[0].r/DEFAULT_R==requiredGears[1] && gears[0].child.g != null && gears[0].child.g.r/DEFAULT_R==requiredGears[0]){
        popups.push(new Popup("Finish (2/2)", "Drop the lighter weight on the right edge of the bigger gear.", "Finally, click the play button to simulate!"));
        popups.push(new Popup("Finish (1/2)", "Excellent! Now, drag each weight by its string.", "Drop the heavier weight on the left edge of the smaller gear."));
        tutorial_progress++;
    }
}

function update(){
    tutorial_check();
    document.onmousedown = (e)=>{currentView.mousedown(e);};
    document.onmousemove = (e)=>{currentView.mousemove(e);};
    document.onmouseup = currentView.mouseup;
    document.onwheel = (e)=>{currentView.scroll(e);};
    currentView.update();
}
