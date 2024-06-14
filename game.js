//game.js handles all events that occur during the game.

//GAME VIEW FUNCTIONS =============================================================================
// *** UPDATE ***
function game_update(){
    //Clear screen and draw background
    ctx.clearRect(0,0,c.width,c.height);
    drawBg();
    //Rotate and draw gears
    gears.forEach(function(g){
        if(go) g.rotate();
        g.draw();
    });
    //Drawing speed ratio display
    if(show_speed_display){
        ctx.drawImage(throttle, 790, 25, 60, 60);
        ctx.font = "75px JB_Mono";
        ctx.textAlign = "center";
        let fraction = decimalToFraction(getSpeedRatio());
        ctx.fillText(fraction.n + ":" + fraction.d, 900, 80, 80);
    }
    //Drawing buttons
    game_buttons.forEach(function(b){
        b.rescale();
        b.draw();
    });
    //Drawing progress bar
    ctx.font = "20px JB_Mono";
    ctx.textAlign = "right";
    ctx.fillText(difficulty, CANVAS_WIDTH/2-PROG_BAR_W/2-10, 50);
    ctx.textAlign = "left";
    ctx.fillText(difficulty+1, CANVAS_WIDTH/2+PROG_BAR_W/2+10, 50);
    ctx.fillStyle = GRAY;
    ctx.fillRect(CANVAS_WIDTH/2-PROG_BAR_W/2, 35, PROG_BAR_W, PROG_BAR_H);
    ctx.fillStyle = "black";
    ctx.fillRect(CANVAS_WIDTH/2-PROG_BAR_W/2, 35, progress/3*PROG_BAR_W, PROG_BAR_H);
    //Drawing required gears bar
    var list = "";
    for(let i=0; i<requiredGears.length; i++) list += requiredGears[i] + (i==requiredGears.length-1? "" : ", ");
    ctx.textAlign = "center";
    ctx.fillText("Required gears: " + list, CANVAS_WIDTH/2, 700);
    ctx.textAlign = "left";
    //Drawing popups
    if(popups.length>0) popups[popups.length-1].draw();
}
function getSpeedRatio(){ //Between playerPulley gear and loadPulley gear. This is the reciprocal of the torque ratio.
    var ratio = 1;
    var g = playerPulley.gear;
    var flag = g == loadPulley.gear;
    while(g.child.g != null && g!=loadPulley.gear){
        if(g.child.t == 1) ratio*=g.r/g.child.g.r;
        if(g.child.g==loadPulley.gear) flag = true;
        g = g.child.g;
    }
    if(!flag) ratio = 1;
    while(g.parent.g != null && g!=loadPulley.gear){
        if(g.parent.t == 1) ratio*=g.r/g.parent.g.r;
        if(g.parent.g==loadPulley.gear) flag = true;
        g = g.parent.g;
    }
    return (flag?1:0)*ratio; //If the two gears are not linked, will return 0.
}
function drawBg(){
    for(let y=ZOOM_CENTER.y-BG_DOT_SPACING*Math.ceil((ZOOM_CENTER.y-anY(0))/BG_DOT_SPACING)-BG_DOT_SPACING/2; y<=anY(CANVAS_HEIGHT); y+=BG_DOT_SPACING){
        for(let x=ZOOM_CENTER.x-BG_DOT_SPACING*Math.ceil((ZOOM_CENTER.x-anX(0))/BG_DOT_SPACING); x<=anX(CANVAS_WIDTH); x+=BG_DOT_SPACING){
            ctx.beginPath();
            ctx.arc(nX(x), nY(y), nS(BG_DOT_RAD), 0, Math.PI*2);
            ctx.fillStyle = "black";
            ctx.fill();
        }
    }
}
// *** MOUSEMOVE EVENT ***
function game_defaultMousemoveEvent(e){
    for(i=popups.length-1; i>=0; i--){
        if(popups[i].button0.containsPoint(mouse(e).x, mouse(e).y)){
            c.style.cursor = "pointer";
            popups[i].button0.targetScale = HOVER_SCALE;
        } else popups[i].button0.targetScale = 1;
        if(popups[i].button1 != null){
            if(popups[i].button1.containsPoint(mouse(e).x, mouse(e).y)){
                c.style.cursor = "pointer";
                popups[i].button1.targetScale = HOVER_SCALE;
            } else popups[i].button1.targetScale = 1;
        }
    }
    if(i>=0){
        c.style.cursor = "pointer";
    } else {
        let last = gears.length -1;
        var i;
        for(i=last; i>=0&&gears[i].centerContainsPoint(mouse(e).x, mouse(e).y)==null; i--);
        if(i>=0){
            c.style.cursor = "move";
        } else {
            for(i=last; i>=0&&gears[i].edgeContainsPoint(mouse(e).x, mouse(e).y)==null; i--);
            if(i>=0){
                let g = gears[i];
                if((mouse(e).y-nY(g.y))/(mouse(e).x-nX(g.x))>0) c.style.cursor = "nwse-resize";
                else c.style.cursor = "nesw-resize";
            } else {
                var flag = false;
                game_buttons.forEach(function(b){
                    if(b.containsPoint(mouse(e).x, mouse(e).y)){
                        flag = true;
                        c.style.cursor = "pointer";
                        b.targetScale = HOVER_SCALE;
                    } else b.targetScale = 1;
                });
                if(!flag) c.style.cursor = "auto";
            }
        }
    }
}
// *** MOUSEDOWN EVENT (with additional functions) ***
function game_mouseDownEvent(e){
    game_view.mouseup = ()=>{game_view.mousemove=game_defaultMousemoveEvent;};
    if(!checkPopups(e) && !checkPulleys(e) && !checkGears(e) && !checkButtons(e)){
        var origX = mouse(e).x;
        var origY = mouse(e).y;
        game_view.mousemove = function(e){
            view_displacement.x += mouse(e).x - origX;
            view_displacement.y += mouse(e).y - origY;
            origX = mouse(e).x;
            origY = mouse(e).y;
        };
    }
}
function checkGears(e){
    let last = gears.length -1;
    var origX = mouse(e).x;
    var origY = mouse(e).y;
    var i;
    //Searching for front gear group
    for(i=last; i>=0&&gears[i].centerContainsPoint(origX, origY)==null; i--){};
    if(i>=0){
        let g = gears[i].centerContainsPoint(origX, origY);
        var flag = false;
        //Coupling gears if necessary
        if(g.child.g == null){
            if(concentricB.boxed){
                selected.concentricWith(g);
                concentricB.boxed = false;
                flag = true;
                playerPulley.snap();
                loadPulley.snap();
            }
            if(coupledB.boxed){
                selected.coupleWith(g);
                coupledB.boxed = false;
                flag = true;
                playerPulley.snap();
                loadPulley.snap();
            }
        }
        //Making sure only first gears in each chain are in gears array
        let temp = gears;
        gears = [];
        temp.forEach(function(gear){if(gear.parent.g == null&& gear != g) gears.push(gear);});
        //Adding selected gear to front
        if(g.parent.g == null) gears.push(g);
        //Changing which gear is selected
        selected = g;
        //Moving gear
        if(!flag) game_view.mousemove = function(e){
            g.move((mouse(e).x-origX)/zoom, (mouse(e).y-origY)/zoom);
            origX = mouse(e).x;
            origY = mouse(e).y;
            playerPulley.snap();
            loadPulley.snap();
        }
        return true;
    //Resizing gears
    } else {
        for(i=last; i>=0&&gears[i].edgeContainsPoint(origX, origY)==null; i--){};
        if(i>=0){
            selected = gears[i].edgeContainsPoint(origX, origY);
            if(selected.parent.g == null && selected.child.g == null){
                game_view.mousemove = function(e){
                    var r = vectorMagnitude(mouse(e).x-nX(selected.x), mouse(e).y-nY(selected.y));
                    r = Math.round(r/DEFAULT_R/zoom); //Inverse nS
                    selected.r = snapR(r)*DEFAULT_R;
                    playerPulley.snap();
                    loadPulley.snap();
                }
            }
            return true;
        }
    }
}
function snapR(r){
    if(r<1) return 1;
    if(r>MAX_R) return MAX_R;
    return r;
}
function checkButtons(e){
    var flag = false;
    game_buttons.forEach(function(b){
        if(b.containsPoint(mouse(e).x, mouse(e).y)){
            b.action();
            flag = true;
        }
    });
    return flag;
}
function checkPopups(e){
    var i;
    for(i=popups.length-1; i>=0&&!(popups[i].button0.containsPoint(mouse(e).x, mouse(e).y)||popups[i].button1!=null&&popups[i].button1.containsPoint(mouse(e).x, mouse(e).y)); i--);
    if(i>=0){
        if(popups[i].button0.containsPoint(mouse(e).x, mouse(e).y)){
            popups[i].button0.action();
        } else if(popups[i].button1 != null){
            if(popups[i].button1.containsPoint(mouse(e).x, mouse(e).y)){
                popups[i].button1.action();
            }
        }
        return true;
    }
    return false;
}
function checkPulleys(e){
    let chosen = null;
    if(Math.abs(anX(mouse(e).x)-playerPulley.ropeX)<LOAD_LT && anY(mouse(e).y)<=playerPulley.gear.y+playerPulley.l && anY(mouse(e).y)>playerPulley.gear.y){
        chosen = playerPulley;
    } else if(Math.abs(anX(mouse(e).x)-loadPulley.ropeX)<LOAD_LT && anY(mouse(e).y)<=loadPulley.gear.y+loadPulley.l && anY(mouse(e).y)>loadPulley.gear.y){
        chosen = loadPulley;
    }
    if(chosen == null) return false;
    game_view.mousemove = function(e){
        chosen.ropeX = anX(mouse(e).x);
        chosen.y = anY(mouse(e).y);
    };
    game_view.mouseup = function(e){
        var i;
        for(i=gears.length-1; i>=0&&gears[i].centerContainsPoint(mouse(e).x, mouse(e).y) == null; i--);
        if(i>=0){
            let g = gears[i].centerContainsPoint(mouse(e).x, mouse(e).y);
            chosen.gear = g;
            chosen.side = anX(mouse(e).x) >= g.x ? 1 : -1;
        }
        chosen.snap();
        game_view.mousemove = game_defaultMousemoveEvent;
    };
    return true;
}
// *** SCROLL EVENT ***
function game_scrollEvent(e){
    if(e.deltaY<0) zoom *= ZOOM_SPEED;
    else zoom /= ZOOM_SPEED;
};

//BUTTON FUNCTIONS ================================================================================
function newGear(){
    selected = new Gear(anX(-1000), anY(-1000), 1);
    gears.push(selected);
    game_view.mouseup = null;
    game_view.mousemove = function(e){
        selected.x = anX(mouse(e).x);
        selected.y = anY(mouse(e).y);
    };
}
function removeGear(){
    if(selected != null){
        if(selected == playerPulley.gear || selected == loadPulley.gear) return;
        for(let current=selected; current.child.g != null; current=current.child.g) if(current.child.g == playerPulley.gear || current.child.g == loadPulley.gear) return;
        if(selected.parent.g != null) selected.parent.g.child = {g: null, t:0};
        removeFromArray(selected, gears);
    }
}
function commit(){
    go = true;
    window.setTimeout(function(){
        let t = playerPulley.getNetTorque()==0;
        if(t && usedAllRequired()) popups.push(new Popup("Success!", "You balanced the weights!", undefined, nextStage));
        else if(!t) popups.push(new Popup("Oh no!", "Your weights are unbalanced.", "Try again!", ()=>{
            resetGears();
            if(progress > 0) progress --;
            go=false;
        }));
        else popups.push(new Popup("Use Required Gears", "Your weights are balanced, but you didn't use the required gears.", "Try again!", ()=>{
            resetGears();
            go=false;
        }));
    }, GO_PAUSE);
}
function resetGears(){
    playerPulley.l = DEFAULT_L;
    loadPulley.l = DEFAULT_L;
    gears.forEach((g)=>{g.v = 0;});
}
function nextStage(){
    go = false;
    gears = [new Gear(ZOOM_CENTER.x, ZOOM_CENTER.y, 1)];
    playerPulley.gear = gears[0];
    playerPulley.side = 1;
    loadPulley.gear = gears[0];
    loadPulley.side = -1;
    playerPulley.snap();
    loadPulley.snap();
    stage ++;
    if(progress<2) progress++;
    else {
        difficulty ++;
        progress = 0;
    }
    generateStage();
}
function generateStage(){
    requiredGears = [];
    playerPulley.weight = 1;
    loadPulley.weight = 1;
    var playerGears = [];
    var loadGears = [];
    for(let i=0; i<difficulty; i++){
        var r = Math.floor((MAX_R-1)*Math.random())+2;
        while(loadGears.indexOf(r)>=0) r = Math.floor((MAX_R-1)*Math.random())+2;
        playerGears.push(r);
        playerPulley.weight*=r;
        requiredGears.push(r);
        while(playerGears.indexOf(r)>=0) r= Math.floor((MAX_R-1)*Math.random())+2;
        loadGears.push(r);
        loadPulley.weight*=r;
        requiredGears.push(r);
    }
    requiredGears = mergeSort(requiredGears);
    let ratio = decimalToFraction(playerPulley.weight/loadPulley.weight);
    playerPulley.weight = ratio.n;
    loadPulley.weight = ratio.d;
}
function usedAllRequired(){
    var g = playerPulley.gear;
    while(g.parent.g != null) g = g.parent.g;
    var used = [];
    for(; g.child.g!=null; g = g.child.g) used.push(Math.round(g.r/DEFAULT_R));
    used.push(Math.round(g.r/DEFAULT_R));
    for(let i=0; i<requiredGears.length; i++){
        if(used.indexOf(requiredGears[i])<0) return false;
    }
    return true;
}