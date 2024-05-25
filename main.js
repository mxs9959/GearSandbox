//Global variables
var selected = null;
var ggs = []; //Array of gear groups. Holds groups of gears that are dragged as one. New gears automatically group themselves and populate this array.
var zoom = 1;
var targetRatio = newGoal();

function mouse(e) {
    var rect = c.getBoundingClientRect();
    return {
      x:e.clientX - rect.left,
      y:e.clientY - rect.top
    };
  }

function resetMoveEvent(){
    document.onmousemove = function(e){
        let last = ggs.length -1;
        var i;
        for(i=last; i>=0&&ggs[i].containsPoint(mouse(e).x, mouse(e).y)==null; i--);
        if(i>=0){
            c.style.cursor = "move";
        } else {
            for(i=last; i>=0&&ggs[i].edgePoint(mouse(e).x, mouse(e).y)==null; i--);
            if(i>=0){
                let g = ggs[i].edgePoint(mouse(e).x, mouse(e).y);
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
    let last = ggs.length -1;
    var origX = mouse(e).x;
    var origY = mouse(e).y;
    var i;
    //Searching for front gear group
    for(i=last; i>=0&&ggs[i].containsPoint(origX, origY)==null; i--){};
    if(i>=0){
        let newSelected = ggs[i].containsPoint(origX, origY);
        //Coupling gears if necessary
        if(newSelected.gg != selected.gg){
            if(concentricB.boxed){
                selected.concentricWith(newSelected);
                concentricB.boxed = false;
            }
            if(coupledB.boxed){
                selected.coupleWith(newSelected);
                coupledB.boxed = false;
            }
        }
        //Changing which gear is selected
        selected = newSelected;
        //Moving selected gear group to front
        let temp = ggs[last];
        ggs[last] = ggs[i];
        ggs[i] = temp;
        //Moving gear
        document.onmousemove = function(e){
            ggs[last].move(mouse(e).x-origX, mouse(e).y-origY);
            origX = mouse(e).x;
            origY = mouse(e).y;
        }
        document.onmouseup = function(e){
            resetMoveEvent();
        }
    } else {
        for(i=last; i>=0&&ggs[i].edgePoint(origX, origY)==null; i--){};
        if(i>=0){
            selected = ggs[i].edgePoint(origX, origY);
            if(selected.gg.gears.length == 1){
                    document.onmousemove = function(e){
                    var r = vectorMagnitude(mouse(e).x-nX(selected.x), mouse(e).y-nY(selected.y));
                    r = Math.round(r/DEFAULT_R/zoom)*DEFAULT_R; //Inverse nS
                    if(r==0) selected.r = DEFAULT_R;
                    else selected.r = r; 
                }
                document.onmouseup = function(e){
                    resetMoveEvent();
                }
            }
        }
    }

}

function checkButtons(e){
    buttons.forEach(function(b){
        if(b.containsPoint(mouse(e).x, mouse(e).y)){
            b.action();
        }
    });
}

function update(){
    ctx.clearRect(0,0,c.width,c.height);
    ggs.forEach(function(gg){
        gg.gears.forEach(function(g){
            g.rotate();
            g.draw();
        });
    });
    buttons.forEach(function(b){
        b.rescale();
        b.draw();
    });
    if(selected != null){
        ctx.drawImage(throttle, 790, 25, 60, 60);
        ctx.font = "75px Arial";
        ctx.textAlign = "center";
        let fraction = decimalToFraction(Math.abs(selected.v/DEFAULT_V));
        ctx.fillText(fraction.n + ":" + fraction.d, 900, 80, 80);
    }
    drawGoal();
    checkGoal();
}

window.addEventListener("load", function(){
    c.width = CANVAS_WIDTH;
    c.height = CANVAS_HEIGHT;
    c.style = "border: 1px solid black";
    document.body.appendChild(c);
    resetMoveEvent();
    setInterval(update, 1/FPS);
});

c.addEventListener("mousedown", function(e){
    checkButtons(e);
    checkGears(e);
});

c.addEventListener("wheel", function(e){
    if(e.deltaY<0) zoom *= ZOOM_SPEED;
    else zoom /= ZOOM_SPEED;
});
