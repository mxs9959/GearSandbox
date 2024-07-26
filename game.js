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
    ctx.fillText(stage, CANVAS_WIDTH/2-PROG_BAR_W/2-10, 50);
    ctx.textAlign = "left";
    ctx.fillText(stage+1, CANVAS_WIDTH/2+PROG_BAR_W/2+10, 50);
    ctx.fillStyle = GRAY;
    ctx.fillRect(CANVAS_WIDTH/2-PROG_BAR_W/2, 35, PROG_BAR_W, PROG_BAR_H);
    ctx.fillStyle = "black";
    ctx.fillRect(CANVAS_WIDTH/2-PROG_BAR_W/2, 35, progress/(1+difficulty*2)*PROG_BAR_W, PROG_BAR_H);
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
            return;
        } else popups[i].button0.targetScale = 1;
        if(popups[i].button1 != null){
            if(popups[i].button1.containsPoint(mouse(e).x, mouse(e).y)){
                c.style.cursor = "pointer";
                popups[i].button1.targetScale = HOVER_SCALE;
                return;
            } else popups[i].button1.targetScale = 1;
        }
    }
    if(Math.abs(anX(mouse(e).x)-playerPulley.ropeX)<LOAD_LT && anY(mouse(e).y)<=playerPulley.gear.y+playerPulley.l && anY(mouse(e).y)>playerPulley.gear.y ||
    Math.abs(anX(mouse(e).x)-loadPulley.ropeX)<LOAD_LT && anY(mouse(e).y)<=loadPulley.gear.y+loadPulley.l && anY(mouse(e).y)>loadPulley.gear.y){
        c.style.cursor = "move";
    } else {
        let last = gears.length -1;
        var i;
        for(i=last; i>=0&&gears[i].getGrandchild().centerContainsPoint(mouse(e).x, mouse(e).y)==null; i--);
        if(i>=0){
            c.style.cursor = "move";
        //Not necessary in this version of the game (for resizing gears)
        } /* else {
            for(i=last; i>=0&&gears[i].getGrandchild().edgeContainsPoint(mouse(e).x, mouse(e).y)==null; i--);
            if(i>=0){
                let g = gears[i];
                if((mouse(e).y-nY(g.y))/(mouse(e).x-nX(g.x))>0) c.style.cursor = "nwse-resize";
                else c.style.cursor = "nesw-resize";
            } */ else {
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
        //}
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
    for(i=last; i>=0&&gears[i].getGrandchild().centerContainsPoint(origX, origY)==null; i--);
    if(i>=0){
        selected = gears[i].getGrandchild().centerContainsPoint(origX, origY);
        reorderGears();
        //Moving gear
        game_view.mousemove = function(e){
            selected.move((mouse(e).x-origX)/zoom, (mouse(e).y-origY)/zoom);
            origX = mouse(e).x;
            origY = mouse(e).y;
            playerPulley.snap();
            loadPulley.snap();
        }
        game_view.mouseup = function(){
            let last = gears.length-1;
            //Resetting move events
            game_view.mousemove=game_defaultMousemoveEvent;
            game_view.mouseup = ()=>{game_view.mousemove=game_defaultMousemoveEvent;};
            //Checking whether gear needs to be coupled
            if(selected.parent.g == null){
                for(i=last; i>=0&&gears[i].getGrandchild().touching(selected, -selected.r)==null; i--);
                //Defining this block of code as function because needs to be called in two places.
                let checkCouple = function(){
                    for(i=last; i>=0&&gears[i].getGrandchild().touching(selected)==null; i--);
                    if(i>=0){
                        let g = gears[i].getGrandchild().touching(selected);
                        if(g.child.g == null) selected.coupleWith(g);
                        playerPulley.snap();
                        loadPulley.snap();
                    }
                }
                if(i>=0){
                    let g = gears[i].getGrandchild().touching(selected, -selected.r);
                    if(g.child.g == null) selected.concentricWith(g);
                    else checkCouple();
                    playerPulley.snap();
                    loadPulley.snap();
                } else checkCouple();
            }
            reorderGears();
        }
        return true;
    //Resizing gears
    //Not necessary for this version
    } /* else {
        for(i=last; i>=0&&gears[i].getGrandchild().edgeContainsPoint(origX, origY)==null; i--){};
        if(i>=0){
            selected = gears[i].getGrandchild().edgeContainsPoint(origX, origY);
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
    */
}
function reorderGears(){
    //Making sure only first gears in each chain are in gears array
    let temp = gears;
    gears = [];
    temp.forEach(function(gear){if(gear.parent.g == null && gear != selected) gears.push(gear);});
    gears.push(selected);
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
        for(i=gears.length-1; i>=0&&gears[i].getGrandchild().edgeContainsPoint(mouse(e).x, mouse(e).y) == null; i--);
        if(i>=0){
            let g = gears[i].getGrandchild().edgeContainsPoint(mouse(e).x, mouse(e).y);
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
    if(e.deltaY<0){
        let old = {x: anX(mouse(e).x), y: anY(mouse(e).y)};
        zoom *= ZOOM_SPEED;
        view_displacement = {
            x: view_displacement.x + mouse(e).x - nX(old.x),
            y: view_displacement.y + mouse(e).y - nY(old.y)
        };
    } else {
        let old = {x: anX(mouse(e).x), y: anY(mouse(e).y)};
        zoom /= ZOOM_SPEED;
        view_displacement = {
            x: view_displacement.x + mouse(e).x - nX(old.x),
            y: view_displacement.y + mouse(e).y - nY(old.y)
        };
    }
};

//BUTTON FUNCTIONS ================================================================================
function commit(){
    go = true;
    removeFromArray(play_button, game_buttons);
    window.setTimeout(function(){
        if(playerPulley.getNetTorque()==0) popups.push(new Popup("Success!", "You balanced the weights!", undefined, ()=>{nextStage;game_buttons.push(play_button);}));
        else popups.push(new Popup("Oh no!", "Your weights are unbalanced.", "Try again!", ()=>{
            resetGears();
            if(progress > 0) progress --;
            go=false;
            game_buttons.push(play_button);
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
    view_displacement = {x: 0, y: 0};
    zoom = 1;
    if(progress<difficulty*2) progress++;
    else {
        if(difficulty<MAX_DIFFICULTY) difficulty ++;
        stage++;
        progress = 0;
        if(stage==2){
            popups.push(new Popup("Level 2", "Tension becomes more difficult from this point.", "Please watch the following demo.", ()=>{showDemo = 2;demo2.play();}));
        }
    }
    generateStage();
}
function generateStageRaw(){
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
    try {
        let ratio = decimalToFraction(playerPulley.weight/loadPulley.weight);
        playerPulley.weight = ratio.n;
        loadPulley.weight = ratio.d;
        requiredGears = mergeSort(requiredGears);
    } catch(error) {
        console.log(error);
        generateStageRaw();
    }
}
function generateStage(){
    generateStageRaw();
    if(playerPulley.weight<=MAX_WEIGHT && loadPulley.weight<=MAX_WEIGHT){addGears(requiredGears);return;}
    var bestRequiredGears = requiredGears;
    var bestWeightAvg = (playerPulley.weight + loadPulley.weight)/2;
    var bestLoadWeight = loadPulley.weight;
    for(let i=0; i<RETRY_COUNT-1; i++){
        generateStageRaw();
        if(playerPulley.weight<=MAX_WEIGHT && loadPulley.weight<=MAX_WEIGHT){addGears(requiredGears);return;}
        if((playerPulley.weight+loadPulley.weight)/2<bestWeightAvg){
            bestRequiredGears = requiredGears;
            bestWeightAvg = (playerPulley.weight+loadPulley.weight)/2;
            bestLoadWeight = loadPulley.weight;
        }
    }
    requiredGears = bestRequiredGears;
    loadPulley.weight = bestLoadWeight;
    playerPulley.weight = 2*bestWeightAvg - bestLoadWeight;
    addGears(requiredGears);
}
function addGears(rs){
    gears = [];
    zoom = 450/rs[rs.length-1]/DEFAULT_R/2;
    var s = 0;
    rs.forEach((r)=>{s+=r;});
    var x = CANVAS_WIDTH/2-(rs.length*30 + 2*s*DEFAULT_R)/2;
    rs.forEach(function(r){
        x += r*DEFAULT_R + 15;
        gears.push(new Gear(x, anY(CANVAS_HEIGHT/2), r));
        x += r*DEFAULT_R + 15;
    });
    playerPulley.gear = gears[0];
    playerPulley.side = 1;
    loadPulley.gear = gears[0];
    loadPulley.side = -1;
    playerPulley.snap();
    loadPulley.snap();
}