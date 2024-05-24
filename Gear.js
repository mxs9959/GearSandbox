let COLOR = "#F5D3C0";
let BORDER_COLOR = "#6B5152"
let BORDER_WIDTH = 15;
let DOT_RAD = 9;
let RATIO = 0.75;
let DEFAULT_V = 0.01;
let DEFAULT_R = 50;
let FONT_RATIO = 0.5;

function vectorMagnitude(dx, dy){
    return Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
}

function removeFromArray(item, array){
    for(let i=array.length-1; i>=0; i--){
        if(array[i]==item) array.splice(i, 1);
    }
}

class Gear {
    constructor(x, y, r){
        this.x = x;
        this.y = y;
        this.r = r*DEFAULT_R;
        this.v = DEFAULT_V;
        this.a = 0;
        this.gg = new GearGroup([this]);
    }
    draw(){
        //Basic gear with border
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
        ctx.fillStyle = BORDER_COLOR;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r-BORDER_WIDTH, 0, Math.PI*2);
        ctx.fillStyle = (selected==this ? "green" : COLOR);
        ctx.fill();
        //Tracking dot
            ctx.beginPath();
            ctx.arc(this.x + this.r*RATIO*Math.cos(this.a), this.y + this.r*RATIO*Math.sin(this.a), DOT_RAD, 0, 2*Math.PI);
            ctx.fillStyle = "black";
            ctx.fill();
        //Center dot
        ctx.beginPath();
        ctx.arc(this.x,this.y,DOT_RAD,0,2*Math.PI);
        ctx.fillStyle = "black";
        ctx.fill();
        //Relative radius number
        ctx.font = Math.round(0.5*this.r) + "px Arial";
        ctx.fillText(Math.abs(Math.round(this.r/DEFAULT_R)) + "", this.x, this.y + this.r/2);
    }
    centerContainsPoint(x, y){
        return vectorMagnitude(x-this.x, y-this.y) < this.r-BORDER_WIDTH;
    }
    edgeContainsPoint(x,y){
        let m = vectorMagnitude(x-this.x, y-this.y);
        return m>=this.r-BORDER_WIDTH && m<=this.r;
    }
    move(dx, dy){
        this.x += dx;
        this.y += dy;
    }
    rotate(){
        this.a += this.v;
    }
    coupleWith(otherGear){
        removeFromArray(this, this.gg.gears);
        this.gg = otherGear.gg;
        this.gg.gears.push(this);
        let k = (otherGear.r+this.r)/vectorMagnitude(this.x-otherGear.x, this.y-otherGear.y);
        this.x = otherGear.x + (this.x-otherGear.x)*k;
        this.y = otherGear.y + (this.y-otherGear.y)*k;
        this.v = -otherGear.v*(otherGear.r/this.r);
        if(this.x<otherGear.x){
            this.a = Math.atan((this.y-otherGear.y)/(this.x-otherGear.x));
            otherGear.a = this.a + Math.PI;
        } else{
            this.a = Math.atan((this.y-otherGear.y)/(this.x-otherGear.x)) + Math.PI;
            otherGear.a = this.a + Math.PI;
        }
    }
    concentricWith(otherGear){
        removeFromArray(this, this.gg.gears);
        this.gg = otherGear.gg;
        this.gg.gears.push(this);
        this.x = otherGear.x;
        this.y = otherGear.y;
        this.v = otherGear.v;
        this.a = otherGear.a;
    }
}

class GearGroup {
    constructor(gears){
        this.gears=gears;
        ggs.push(this);
    }
    move(dx, dy){
        this.gears.forEach(gear => {
            gear.move(dx,dy);
        });
    }
    containsPoint(x, y){
        for(let i=this.gears.length-1; i>=0; i--){
            if(this.gears[i].centerContainsPoint(x, y)) return this.gears[i];
        }
        return null;
    }
    edgePoint(x, y){
        for(let i=this.gears.length-1; i>=0; i--){
            if(this.gears[i].edgeContainsPoint(x, y)) return this.gears[i];
        }
        return null;
    }
}