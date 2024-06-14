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
        popups.push(new Popup("Exit Game", "Are you sure you want to exit?", undefined, ()=>{home_bg_direction=2*Math.PI*Math.random();currentView=home_view;}, true));
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
    popups.push(new Popup("Tour", "Would you like a tour of the buttons?", undefined, ()=>{
        popups = [
            new Popup("The End", "That's all for now!", "Have fun playing."),
            new Popup("Required Gears", "(Bottom)", "You must use gears of those radii to complete each challenge."),
            new Popup("Progress Bar", "(Top center)", "When full, the number of required gears increases."),
            new Popup("Play", "Starts the simulation.", "Make sure your weights are balanced."),
            new Popup("Trash", "Deletes a gear and its chain.", "Be careful!"),
            new Popup("Coupled Gear", "Makes gears roll along each other.", "Works like Concentric Gear."),
            new Popup("Concentric Gear", "Makes gears rotate together with same center.", "Click a gear, then the button, then the other gear."),
            new Popup("New Gear", "The plus button creates a new gear.", "Place one anywhere and drag its edge to resize."),
            new Popup("Buttons", "(Right)", "First, let's go over the buttons from top to bottom.")
        ];
    }, true));
    popups.push(new Popup("Welcome! (2/2)", "Weights hang from \"gears\" by strings.", "Combine the gears so that the imbalance is eliminated!"));
    popups.push(new Popup("Welcome! (1/2)", "In Tension, your goal is to balance the weights.", "The weights are trapezoids labeled with their masses."));
    setInterval(update, 1/FPS);
});

function update(){
    document.onmousedown = (e)=>{currentView.mousedown(e);};
    document.onmousemove = (e)=>{currentView.mousemove(e);};
    document.onmouseup = currentView.mouseup;
    document.onwheel = (e)=>{currentView.scroll(e);};
    currentView.update();
}
