class Gear {
    constructor(x, y, r, pulley=null){
        this.x = x;
        this.y = y;
        this.r = r*DEFAULT_R;
        this.v = DEFAULT_V;
        this.a = 0;
        this.parent = {
            g: null,
            t: 0 //0 is concentric, 1 is coupled
        };
        this.child = {
            g: null,
            t: 0
        }
        this.pulley = pulley;
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
        ctx.fill();
        //Relative radius number
        ctx.font = Math.round(nS(0.5*this.r)) + "px Arial";
        ctx.fillText(Math.abs(Math.round(this.r/DEFAULT_R)) + "", nX(this.x), nY(this.y) + nS(this.r/2));
        
        if(this.child.g!= null) this.child.g.draw();
        if(this.parent.g != null && this.parent.t == 0 && this.parent.g.r < this.r){
            ctx.beginPath();
            ctx.arc(nX(this.x), nY(this.y), nS(this.parent.g.r), 0, Math.PI*2);
            ctx.setLineDash([nS(5), nS(5)]);
            ctx.lineWidth = nS(LINEWIDTH);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
    centerContainsPoint(x, y){
        let p;
        if(vectorMagnitude(x-nX(this.x), y-nY(this.y)) < nS(this.r-BORDER_WIDTH)) p = this;
        else p = null;
        if(this.child.g != null){
            let b = this.child.g.centerContainsPoint(x,y);
            if(b!=null) return b;
            else return p;
        } else return p;
    }
    edgeContainsPoint(x,y){
        let p;
        let m = vectorMagnitude(x-nX(this.x), y-nY(this.y));
        if(m>=nS(this.r-BORDER_WIDTH) && m<=nS(this.r)) p = this;
        else p = null;
        if(this.child.g != null){
            let b = this.child.g.edgeContainsPoint(x,y);
            if(b != null) return b;
            else return p;
        } else return p;
    }
    move(dx, dy, indirect=false){ //Inverse nS
        if(this.pulley != null) return;
        this.x += dx/zoom;
        this.y += dy/zoom;
        if(this.child.g != null) this.child.g.move(dx, dy, true);
        if(this.parent.g != null && !indirect){
            this.parent.g.child = {g: null, t: 0};
            this.parent = {g: null, t: 0};
            if(this.pulley == null) gears.push(this);
        }
    }
    rotate(){
        if(this.parent.g != null) this.v = -this.parent.g.v*(this.parent.g.r/this.r);
        if(this.pulley != null) this.v = this.pulley.v/this.r*(this.pulley.ccw?-1:1);
        this.a += this.v;
        if(this.child.g != null && this.child.g.pulley == null) this.child.g.rotate();
    }
    coupleWith(otherGear){
        if(this == otherGear || this.pulley != null) return;
        if(this.parent.g!=null) this.parent.g.child = {g: null, t: 0};
        this.parent = {g: otherGear, t: 1};
        otherGear.child = {g: this, t: 1};
        let k = (otherGear.r+this.r)/vectorMagnitude(this.x-otherGear.x, this.y-otherGear.y);
        this.x = otherGear.x + (this.x-otherGear.x)*k;
        this.y = otherGear.y + (this.y-otherGear.y)*k;
        if(this.x<otherGear.x){
            this.a = Math.atan((this.y-otherGear.y)/(this.x-otherGear.x));
            otherGear.a = this.a + Math.PI;
        } else{
            this.a = Math.atan((this.y-otherGear.y)/(this.x-otherGear.x)) + Math.PI;
            otherGear.a = this.a + Math.PI;
        }
    }
    concentricWith(otherGear){
        if(this == otherGear || this.pulley != null) return;
        if(this.parent.g != null) this.parent.g.child = {g: null, t: 0};
        this.parent = {g: otherGear, t: 0};
        otherGear.child = {g: this, t: 0};
        this.x = otherGear.x;
        this.y = otherGear.y;
        this.v = otherGear.v;
        this.a = otherGear.a;
    }
}