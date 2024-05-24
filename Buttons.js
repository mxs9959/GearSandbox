class Button {
    constructor(image, x, y, w, h, action){
        this.image = image;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.action = action;
        this.boxed = false;
    }
    draw(){
        ctx.drawImage(this.image, this.x-this.w/2, this.y-this.h/2, this.w, this.h);
        if(this.boxed){
            ctx.roundRect(this.x-this.w/2, this.y-this.h/2, this.w, this.h, BOX_RADIUS);
            ctx.stroke();
        }
    }
    containsPoint(x, y){
        return (x>=this.x-this.w/2 && x<=this.x+this.w/2) && (y>=this.y-this.h/2 && y<=this.y+this.h/2);
    }
}

//Button functions
function newGear(){
    selected = new Gear(anX(-1000), anY(-1000), 1);
    document.onmouseup = null;
    document.onmousemove = function(e){
        selected.x = anX(mouse(e).x);
        selected.y = anY(mouse(e).y);
    };
}
