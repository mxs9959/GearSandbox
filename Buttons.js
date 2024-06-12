class Button {
    constructor(image, x, y, w, h, action){
        this.image = image;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.action = action;
        this.boxed = false;
        this.targetScale = 1;
        this.scale = 1;
    }
    draw(){
        ctx.drawImage(this.image, this.x-this.scale*this.w/2, this.y-this.scale*this.h/2, this.scale*this.w, this.scale*this.h);
        if(this.boxed){
            ctx.beginPath();
            ctx.roundRect(this.x-this.scale*this.w/2, this.y-this.scale*this.h/2, this.scale*this.w, this.scale*this.h, BOX_RADIUS);
            ctx.stroke();
        }
    }
    containsPoint(x, y){
        return (x>=this.x-this.scale*this.w/2 && x<=this.x+this.scale*this.w/2) && (y>=this.y-this.scale*this.h/2 && y<=this.y+this.scale*this.h/2);
    }
    rescale(){
        if(Math.abs(this.scale - this.targetScale)>SCALE_SPEED){
            if(this.scale < this.targetScale) this.scale += SCALE_SPEED;
            else this.scale -= SCALE_SPEED;
        }
    }
}

//Button functions
function newGear(){
    selected = new Gear(anX(-1000), anY(-1000), 1);
    gears.push(selected);
    document.onmouseup = null;
    document.onmousemove = function(e){
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
