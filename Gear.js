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
        ctx.arc(nX(this.x), nY(this.y), nS(this.r), 0, Math.PI*2);
        ctx.fillStyle = BORDER_COLOR;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(nX(this.x), nY(this.y), nS(this.r-BORDER_WIDTH), 0, Math.PI*2);
        ctx.fillStyle = (selected==this ? "green" : COLOR);
        ctx.fill();
        //Tracking dot
        ctx.beginPath();
        ctx.arc(nX(this.x + this.r*DOT_POS_RATIO*Math.cos(this.a)), nY(this.y + this.r*DOT_POS_RATIO*Math.sin(this.a)), nS(DOT_RAD), 0, 2*Math.PI);
        ctx.fillStyle = "black";
        ctx.fill();
        //Center dot
        ctx.beginPath();
        ctx.arc(nX(this.x),nY(this.y),nS(DOT_RAD),0,2*Math.PI);
        ctx.fillStyle = "black";
        ctx.fill();
        //Relative radius number
        ctx.font = Math.round(nS(0.5*this.r)) + "px Arial";
        ctx.fillText(Math.abs(Math.round(this.r/DEFAULT_R)) + "", nX(this.x), nY(this.y) + nS(this.r/2));
    }
    centerContainsPoint(x, y){
        return vectorMagnitude(x-nX(this.x), y-nY(this.y)) < nS(this.r-BORDER_WIDTH);
    }
    edgeContainsPoint(x,y){
        let m = vectorMagnitude(x-nX(this.x), y-nY(this.y));
        return m>=nS(this.r-BORDER_WIDTH) && m<=nS(this.r);
    }
    move(dx, dy){ //Inverse nS
        this.x += dx/zoom;
        this.y += dy/zoom;
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