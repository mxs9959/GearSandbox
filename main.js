let WIDTH = 960;
let HEIGHT = 720;
let FPS = 30;
let BUTTON_Y = 0.9;
let c = document.createElement("canvas");
let ctx = c.getContext("2d");

let concentricB = new Button(concentric, 100, BUTTON_Y*HEIGHT, 100, 100, ()=>{concentricB.boxed = !concentricB.boxed;});
let coupledB = new Button(coupled, 250, BUTTON_Y*HEIGHT, 100, 100, ()=>{coupledB.boxed = !coupledB.boxed;});

let throttle = new Image();
throttle.src = "images/throttle.png";

var selected = null;

let buttons = [
    new Button(plus, 860, BUTTON_Y*HEIGHT, 100, 100, newGear),
    concentricB, coupledB,
    new Button(trash, 710, BUTTON_Y*HEIGHT, 100, 100, ()=>{if(selected!=null)removeFromArray(selected, selected.gg.gears);})
];

var ggs = []; //Array of gear groups. Holds groups of gears that are dragged as one. New gears automatically group themselves and populate this array.

function mouse(canvas, e) {
    var rect = canvas.getBoundingClientRect();
    return {
      x:e.clientX - rect.left,
      y:e.clientY - rect.top
    };
  }

function resetMoveEvent(){
    document.onmousemove = function(e){
        let last = ggs.length -1;
        for(i=last; i>=0&&ggs[i].containsPoint(mouse(c,e).x, mouse(c,e).y)==null; i--){};
        if(i>=0){
            c.style.cursor = "move";
        } else {
            var g;
            for(i=last; i>=0&&ggs[i].edgePoint(mouse(c,e).x, mouse(c,e).y)==null; i--){};
            if(i>=0){
                g = ggs[i].edgePoint(mouse(c,e).x, mouse(c,e).y);
                let m = Math.atan( mouse(c,e).y-g.y)/(mouse(c,e).x-g.x);
                if(m>0) c.style.cursor = "nwse-resize";
                else c.style.cursor = "nesw-resize";
            } else c.style.cursor = "auto";
        }
    };
}

function dragGear(e){
    let last = ggs.length -1;
    var origX =mouse(c,e).x;
    var origY = mouse(c,e).y;
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
            ggs[last].move(mouse(c,e).x-origX, mouse(c,e).y-origY);
            origX = mouse(c,e).x;
            origY = mouse(c,e).y;
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
                    var r = vectorMagnitude(mouse(c,e).x-selected.x, mouse(c,e).y-selected.y);
                    r = Math.round(r/DEFAULT_R)*DEFAULT_R;
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

function newGear(){
    selected = new Gear(-1000, -1000, 1);
    document.onmouseup = null;
    document.onmousemove = function(e){
        selected.x = mouse(c,e).x;
        selected.y = mouse(c,e).y;
    };
}

function checkButtons(e){
    buttons.forEach(function(b){
        if(b.containsPoint(mouse(c,e).x, mouse(c,e).y)){
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
        b.draw();
    });
    if(selected != null){
        ctx.drawImage(throttle, 790, 25, 60, 60);
        ctx.font = "75px Arial";
        ctx.textAlign = "center";
        ctx.fillText(Math.abs(Math.round(DEFAULT_V/selected.v)) + "", 900, 80,80);
    }
}

window.addEventListener("load", function(){
    c.width = WIDTH;
    c.height = HEIGHT;
    c.style = "border: 1px solid black";
    document.body.appendChild(c);
    setInterval(update, 1/FPS);
});

window.addEventListener("mousedown", function(e){
    checkButtons(e);
    dragGear(e);
});
