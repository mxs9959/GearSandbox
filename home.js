//home.js handles all events that occur on the home screen.

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