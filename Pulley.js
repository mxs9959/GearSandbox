class Pulley {
    constructor(gear, side){
        this.l = DEFAULT_L;
        this.gear = gear;
        this.side = side; //-1 is left, 1 is right
        this.weight = 1;
        this.ropeX = this.gear.x + this.side*this.gear.r;
        this.y = this.gear.y;
    }
    draw(pulleyColor){
        ctx.beginPath();
        ctx.moveTo(nX(this.ropeX), nY(this.y));
        ctx.lineTo(nX(this.ropeX), nY(this.y + this.l));
        ctx.strokeStyle = "black";
        ctx.lineWidth = nS(ROPE_THICKNESS);
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.fillStyle = pulleyColor;
        drawTrapezoid(nX(this.ropeX-LOAD_LT/2), nY(this.y+this.l), nS(LOAD_LT), nS(LOAD_LB), nS(LOAD_H));
        ctx.font = Math.round(nS(0.5*LOAD_H)) + "px JB_Mono";
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.fillText(Math.round(this.weight) + "", nX(this.ropeX), nY(this.y+this.l+LOAD_H/2+5));
        ctx.fillStyle = "black";
    }
    snap(){
        this.ropeX = this.gear.x + this.side*this.gear.r;
        this.y = this.gear.y;
    }
    spool(){
        if(!go) return;
        if(this.l<LIMIT_L && this.side*this.gear.v<0){
            var g = this.gear;
            while(g.parent.g!=null) g = g.parent.g;
            g.v = 0;
        } else {
            var g = this.gear;
            while(g.parent.g!=null) g = g.parent.g;
            g.v += M*getNetTorque(this)/g.r;
        }
        this.l += this.side*this.gear.v*this.gear.r;
    }
}
