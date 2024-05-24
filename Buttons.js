let RADIUS = 10;

let plus = new Image();
plus.src = "images/plus.png";
let concentric = new Image();
concentric.src = "images/concentric.png";
let coupled = new Image();
coupled.src = "images/coupled.png";
let trash = new Image();
trash.src = "images/trash.png";

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
            ctx.roundRect(this.x-this.w/2, this.y-this.h/2, this.w, this.h, RADIUS);
            ctx.stroke();
        }
    }
    containsPoint(x, y){
        return (x>=this.x-this.w/2 && x<=this.x+this.w/2) && (y>=this.y-this.h/2 && y<=this.y+this.h/2);
    }
}
