//Global variables
var selected = null;
var gears = [];
var zoom = 1;
var view_displacement = {x: 0, y: 0};
var std_v = DEFAULT_V;
var playerPulley;
var loadPulley;

//Buttons
let concentricB = new Button(concentric, 890, 220, BUTTON_SIZE, BUTTON_SIZE, ()=>{concentricB.boxed = !concentricB.boxed;});
let coupledB = new Button(coupled, 890, 300, BUTTON_SIZE, BUTTON_SIZE, ()=>{coupledB.boxed = !coupledB.boxed;});
let buttons = [
    new Button(plus, 890, 140, BUTTON_SIZE, BUTTON_SIZE, newGear),
    concentricB, coupledB,
    new Button(trash, 890, 380, BUTTON_SIZE, BUTTON_SIZE, removeGear)
];

function mouse(e) {
    var rect = c.getBoundingClientRect();
    return {
      x:e.clientX - rect.left,
      y:e.clientY - rect.top
    };
}

function resetMoveEvent(){
    document.onmousemove = function(e){
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
                for(i=buttons.length-1; i>=0; i--){
                    if(buttons[i].containsPoint(mouse(e).x, mouse(e).y)){
                        flag = true;
                        c.style.cursor = "pointer";
                        buttons[i].targetScale = HOVER_SCALE;
                    } else buttons[i].targetScale = 1;
                }
                if(!flag) c.style.cursor = "auto";
            }
        }
    };
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
        if(!flag) document.onmousemove = function(e){
            g.move((mouse(e).x-origX)/zoom, (mouse(e).y-origY)/zoom);
            origX = mouse(e).x;
            origY = mouse(e).y;
            playerPulley.snap();
            loadPulley.snap();
        }
        document.onmouseup = function(e){
            resetMoveEvent();
        }
        return true;
    //Resizing gears
    } else {
        for(i=last; i>=0&&gears[i].edgeContainsPoint(origX, origY)==null; i--){};
        if(i>=0){
            selected = gears[i].edgeContainsPoint(origX, origY);
            if(selected.parent.g == null && selected.child.g == null){
                document.onmousemove = function(e){
                    var r = vectorMagnitude(mouse(e).x-nX(selected.x), mouse(e).y-nY(selected.y));
                    r = Math.round(r/DEFAULT_R/zoom)*DEFAULT_R; //Inverse nS
                    if(r==0) selected.r = DEFAULT_R;
                    else selected.r = r;
                    playerPulley.snap();
                    loadPulley.snap();
                }
                document.onmouseup = function(e){
                    resetMoveEvent();
                }
            }
            return true;
        }
    }

}

function checkButtons(e){
    var flag = false;
    buttons.forEach(function(b){
        if(b.containsPoint(mouse(e).x, mouse(e).y)){
            b.action();
            flag = true;
        }
    });
    return flag;
}

function checkPulleys(e){
    let chosen = null;
    if(Math.abs(anX(mouse(e).x)-playerPulley.ropeX)<LOAD_LT && anY(mouse(e).y)<=playerPulley.gear.y+playerPulley.l && anY(mouse(e).y)>playerPulley.gear.y){
        chosen = playerPulley;
    } else if(Math.abs(anX(mouse(e).x)-loadPulley.ropeX)<LOAD_LT && anY(mouse(e).y)<=loadPulley.gear.y+loadPulley.l && anY(mouse(e).y)>loadPulley.gear.y){
        chosen = loadPulley;
    }
    if(chosen == null) return false;
    document.onmousemove = function(e){
        chosen.ropeX = anX(mouse(e).x);
        chosen.y = anY(mouse(e).y);
    };
    document.onmouseup = function(e){
        var i;
        for(i=gears.length-1; i>=0&&gears[i].centerContainsPoint(mouse(e).x, mouse(e).y) == null; i--);
        if(i>=0){
            let g = gears[i].centerContainsPoint(mouse(e).x, mouse(e).y);
            chosen.gear = g;
            chosen.side = anX(mouse(e).x) >= g.x ? 1 : -1;
        }
        chosen.snap();
        resetMoveEvent();
    };
    return true;
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

function update(){
    //Clear screen and draw background
    ctx.clearRect(0,0,c.width,c.height);
    drawBg();
    //Rotate and draw gears
    gears.forEach(function(g){
        g.rotate();
        g.draw();
    });
    playerPulley.spool();
    loadPulley.spool();
    playerPulley.draw();
    loadPulley.draw();
    //Drawing speed ratio display
    if(selected != null){
        ctx.drawImage(throttle, 790, 25, 60, 60);
        ctx.font = "75px Arial";
        ctx.textAlign = "center";
        let fraction = decimalToFraction(Math.abs(selected.v/std_v));
        ctx.fillText(fraction.n + ":" + fraction.d, 900, 80, 80);
    }
    //Drawing buttons
    buttons.forEach(function(b){
        b.rescale();
        b.draw();
    });
}

window.addEventListener("load", function(){
    c.width = CANVAS_WIDTH;
    c.height = CANVAS_HEIGHT;
    c.style = "border: 1px solid black";
    document.body.appendChild(c);
    resetMoveEvent();
    gears.push(new Gear(ZOOM_CENTER.x, ZOOM_CENTER.y, 1));
    playerPulley = new Pulley(gears[0], 1);
    loadPulley = new Pulley(gears[0], -1);
    setInterval(update, 1/FPS);
});

c.addEventListener("mousedown", function(e){
    if(!checkButtons(e) && !checkGears(e) && !checkPulleys(e)){
        var origX = mouse(e).x;
        var origY = mouse(e).y;
        document.onmousemove = function(e){
            view_displacement.x += mouse(e).x - origX;
            view_displacement.y += mouse(e).y - origY;
            origX = mouse(e).x;
            origY = mouse(e).y;
        };
        document.onmouseup = function(e){
            resetMoveEvent();
        };
    }
});

c.addEventListener("wheel", function(e){
    if(e.deltaY<0) zoom *= ZOOM_SPEED;
    else zoom /= ZOOM_SPEED;
});
