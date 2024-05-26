class Pulley {
    constructor(x, effort){
        this.x = x;
        this.gear = new Gear(x, CANVAS_HEIGHT-BAR_HEIGHT-PULLEY_CLEARANCE-DEFAULT_R, 1, this);
        gears.push(this.gear);
        selected = this.gear;
        this.effort = effort;
        this.reset();
        this.v = 0;
        this.ccw = true;
    }
    draw(){
        ctx.beginPath();
        ctx.moveTo(nX(this.effort[0].x), nY(CANVAS_HEIGHT-BAR_HEIGHT-this.effort[0].h/2));
        let tangentPoint = getTangentPoint(this.effort[0].x, CANVAS_HEIGHT-BAR_HEIGHT-this.effort[0].h/2, this.gear.x, this.gear.y, this.gear.r, !this.ccw);
        ctx.lineTo(nX(tangentPoint.x), nY(tangentPoint.y));
        ctx.strokeStyle = "black";
        ctx.lineWidth = nS(ROPE_THICKNESS);
        ctx.stroke();
        this.effort.forEach((e) => {e.draw();});
        this.gear.draw();
    }
    play(){
        if(this.v>0) return;
        this.effort.forEach((e)=>{this.v += e.f;}); //Change later!
        std_v = this.v/this.gear.r;
    }
    advance(){
        this.effort.forEach((e)=>{e.x += this.v;});
    }
    reset(){
        this.v = 0;
        this.effort.forEach((e)=>{e.x = this.x+EFFORT_DX;});
    }
}

class Effort {
    constructor(type){
        this.x = -1000;
        this.d = 0;
        switch(type){
            default: 
                this.image = pickup;
                this.h = 40;
                this.w = 100;
                this.f = STD_FORCE;
        }
    }
    draw(){
        ctx.drawImage(this.image, nX(this.x-this.w/2), nY(CANVAS_HEIGHT-BAR_HEIGHT-this.h), nS(this.w), nS(this.h));
    }
}