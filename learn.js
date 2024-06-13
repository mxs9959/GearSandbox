//learn.js displays the learning guide. It also contains code for the credits screen.

//LEARNING GUIDE
function learn_update(){
    ctx.clearRect(0,0,c.width,c.height);
    //Drawing title
    ctx.drawImage(learn, CANVAS_WIDTH/2-learn.width/2, nY(10), 200, 80)
    //Drawing articles
    let x = CANVAS_WIDTH/2-715/2;
    ctx.drawImage(learn_1, x, nY(100));
    ctx.drawImage(learn_2, x, nY(learn_1.height+15+100));
    ctx.drawImage(learn_3, x, nY(learn_1.height+learn_2.height+30+100));
    ctx.drawImage(learn_4, x, nY(learn_1.height+learn_2.height+learn_3.height+45+100));
    //Drawing button
    learn_backButton.rescale();
    learn_backButton.draw();
}
function learn_mousedownEvent(e){
    if(learn_backButton.containsPoint(mouse(e).x, mouse(e).y)) learn_backButton.action();
}
function learn_mousemoveEvent(e){
    c.style.cursor = "auto";
    if(learn_backButton.containsPoint(mouse(e).x, mouse(e).y)){
        c.style.cursor = "pointer";
        learn_backButton.targetScale = HOVER_SCALE;
    } else learn_backButton.targetScale = 1;
}
function learn_scrollEvent(e){
    if(e.deltaY>0) view_displacement.y-=SCROLL_SPEED;
    else view_displacement.y+=SCROLL_SPEED;
    if(view_displacement.y>0) view_displacement.y = 0;
    else if(view_displacement.y<-(learn_1.height+learn_2.height+learn_3.height+45+100+10)) view_displacement.y = -(learn_1.height+learn_2.height+learn_3.height+45+100+10);
}

//CREDITS
function credits_update(){
    ctx.clearRect(0,0,c.width,c.height);
    //Drawing title
    ctx.drawImage(credits, CANVAS_WIDTH/2-learn.width/2, nY(10), 200, 80)
    //Drawing articles
    let x = CANVAS_WIDTH/2-715/2;
    ctx.drawImage(credits_, x, nY(100));
    //Drawing button
    learn_backButton.rescale();
    learn_backButton.draw();
}
let credits_mousedownEvent = learn_mousedownEvent;
let credits_mousemoveEvent = learn_mousemoveEvent;
