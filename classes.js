class Popup {
    constructor(title, message0, message1="", action=()=>{}, optional=false){
        this.title = title;
        this.message0 = message0;
        this.message1 = message1;
        this.button0 = new Button(check, CANVAS_WIDTH/2 + (optional? 0.6*BUTTON_SIZE : 0), CANVAS_HEIGHT/2+0.3*POPUP_HEIGHT, BUTTON_SIZE, BUTTON_SIZE, ()=>{
            removeFromArray(this, popups);
            action();
        });
        this.button1 = optional? (new Button(x_button, CANVAS_WIDTH/2 - 0.6*BUTTON_SIZE, CANVAS_HEIGHT/2+0.3*POPUP_HEIGHT, BUTTON_SIZE, BUTTON_SIZE, ()=>{removeFromArray(this, popups);})) : null;
    }
    draw(){
        ctx.beginPath();
        ctx.fillStyle = GRAY;
        ctx.lineWidth = LINEWIDTH;
        ctx.roundRect(CANVAS_WIDTH/2-POPUP_WIDTH/2, CANVAS_HEIGHT/2-POPUP_HEIGHT/2, POPUP_WIDTH, POPUP_HEIGHT, CORNER_RADIUS);
        ctx.stroke();
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.lineWidth = 1;

        ctx.font = "45px JB_Mono";
        ctx.textAlign = "center";
        ctx.fillText(this.title, CANVAS_WIDTH/2, CANVAS_HEIGHT/2-0.25*POPUP_HEIGHT, 0.5*POPUP_WIDTH);
        ctx.font = "20px JB_Mono";
        ctx.fillText(this.message0, CANVAS_WIDTH/2, CANVAS_HEIGHT/2-0.05*POPUP_HEIGHT, 0.85*POPUP_WIDTH);
        ctx.fillText(this.message1, CANVAS_WIDTH/2, CANVAS_HEIGHT/2+0.1*POPUP_HEIGHT, 0.85*POPUP_WIDTH);

        this.button0.rescale();
        this.button0.draw();
        if(this.button1 != null){
            this.button1.rescale();
            this.button1.draw();
        }
    }
}
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
class Gear {
    constructor(x, y, r){
        this.x = x;
        this.y = y;
        this.r = r*DEFAULT_R;
        this.v = 0;
        this.a = 0;
        this.parent = {
            g: null,
            t: 0 //0 is concentric, 1 is coupled
        };
        this.child = {
            g: null,
            t: 0
        }
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
        ctx.textAlign = "center";
        ctx.font = Math.round(nS(0.5*this.r)) + "px JB_Mono";
        ctx.fillText(Math.abs(Math.round(this.r/DEFAULT_R)) + "", nX(this.x), nY(this.y) + nS(this.r/2));
        
        //Drawing pulleys in order
        if(this == playerPulley.gear){
            playerPulley.spool();
            playerPulley.draw("green");
        }
        if(this == loadPulley.gear){
            loadPulley.spool();
            loadPulley.draw("red");
        }

        //Drawing children and outlines of obscured gears
        if(this.child.g!= null) this.child.g.draw();
        if(this.parent.g != null && this.parent.t == 0 && this.parent.g.r < this.r){
            ctx.beginPath();
            ctx.arc(nX(this.x), nY(this.y), nS(this.parent.g.r), 0, Math.PI*2);
            ctx.setLineDash([nS(5), nS(5)]);
            ctx.lineWidth = nS(LINEWIDTH);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.lineWidth = 1;
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
        this.x += dx;
        this.y += dy;
        if(this.child.g != null) this.child.g.move(dx, dy, true);
        if(this.parent.g != null && !indirect){
            this.parent.g.child = {g: null, t: 0};
            this.parent = {g: null, t: 0};
            gears.push(this);
        }
    }
    rotate(){
        if(this.parent.g != null){
            if(this.parent.t == 0) this.v = this.parent.g.v;
            if(this.parent.t == 1) this.v = -this.parent.g.v*(this.parent.g.r/this.r);
        }
        this.a += this.v;
        if(this.child.g != null) this.child.g.rotate();
    }
    coupleWith(otherGear){
        if(this == otherGear) return;
        if(this.parent.g!=null) this.parent.g.child = {g: null, t: 0};
        this.parent = {g: otherGear, t: 1};
        otherGear.child = {g: this, t: 1};
        let k = (otherGear.r+this.r)/vectorMagnitude(this.x-otherGear.x, this.y-otherGear.y);
        this.move(otherGear.x + (this.x-otherGear.x)*k - this.x, otherGear.y + (this.y-otherGear.y)*k - this.y, true);
        if(this.x<otherGear.x){
            this.a = Math.atan((this.y-otherGear.y)/(this.x-otherGear.x));
            otherGear.a = this.a + Math.PI;
        } else{
            this.a = Math.atan((this.y-otherGear.y)/(this.x-otherGear.x)) + Math.PI;
            otherGear.a = this.a + Math.PI;
        }
    }
    concentricWith(otherGear){
        if(this == otherGear) return;
        if(this.parent.g != null) this.parent.g.child = {g: null, t: 0};
        this.parent = {g: otherGear, t: 0};
        otherGear.child = {g: this, t: 0};
        this.move(otherGear.x - this.x, otherGear.y - this.y, true);
        this.v = otherGear.v;
        this.a = otherGear.a;
    }
}
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
        let other = this==playerPulley? loadPulley : playerPulley;
        if(this.l<=LIMIT_L && this.side*this.gear.v<=0){
            var g = this.gear;
            while(g.parent.g!=null) g = g.parent.g;
            g.v = 0;
        } else if(!(other.l<=LIMIT_L && other.side*other.gear.v<=0)){
            var g = this.gear;
            while(g.parent.g!=null) g = g.parent.g;
            g.v += M*this.getNetTorque()/g.r;
            this.l += this.side*this.gear.v*this.gear.r;
        }
    }
    getNetTorque(){ //Gets net torque at the base of this pulley's gear train.
        var pt = playerPulley.weight*playerPulley.gear.r*(playerPulley.side==1?1:-1); //playerPulley torque
        var lt = loadPulley.weight*loadPulley.gear.r*(loadPulley.side==1?1:-1); //loadPulley torque
        var g = playerPulley.gear;
        while(g.parent.g != null){
            if(g.parent.t == 1) pt*=-g.parent.g.r/g.r; //Signs alternate with each gear in train.
            g = g.parent.g;
        }
        g = loadPulley.gear;
        while(g.parent.g != null){
            if(g.parent.t==1) lt*=-g.parent.g.r/g.r;
            g = g.parent.g;
        }
        let sameChain = getSpeedRatio()!=0;
        let isPlayerPulley = this == playerPulley;
        return (sameChain||isPlayerPulley?pt:0)+(sameChain||!isPlayerPulley?lt:0); //Takes summation of possible torques, but ignores those outside of train.
    }
}
class View {
    constructor(update, mousedown, mousemove, mouseup, scroll=()=>{}){
        this.update = update;
        this.mousedown = mousedown;
        this.mousemove = mousemove;
        this.mouseup = mouseup;
        this.scroll = scroll;
    }
}