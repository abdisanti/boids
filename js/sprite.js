//Parent Sprit Classa
class Sprite {
    constructor(sprite_json, x, y, start_state, start_x_v, start_y_v){
        this.sprite_json = sprite_json;
        
        //current sprite position (top left corner of sprite)
        this.x = x; 
        this.y = y;

        this.state = start_state;
        this.root_e = "TenderBud";

        this.cur_frame = 0;

        this.cur_bk_data = null;

        //for sprite movement
        this.x_v = start_x_v;
        this.y_v = start_y_v;

        //for key press status
        this.initial_release = true;
        this.initial_press = true;
        this.initial_afk = true;

        //for hitbox dimensions
        this.hitbox_x = null;
        this.hitbox_y = null;
    }

    draw(state){
        var ctx = canvas.getContext('2d');
        //console.log(this.sprite_json[this.root_e][this.state][this.cur_frame]['w']);
        //console.log("key press " + state['key_press']);
        //console.log("key release " + state['key_release']);
        //console.log(state['key']);

        if(this.sprite_json[this.root_e][this.state][this.cur_frame]['img'] == null){
            console.log("loading");
            this.sprite_json[this.root_e][this.state][this.cur_frame]['img'] = new Image();
            this.sprite_json[this.root_e][this.state][this.cur_frame]['img'].src = 'Penguins/' + this.root_e + '/' + this.state + '/' + this.cur_frame + '.png';
        }

        
        if( this.cur_bk_data != null){
            ctx.putImageData(this.cur_bk_data , (this.x - this.x_v) , (this.y - this.y_v)); //puts bkg img back from where sprite passed
        }

        //gets current bkg img data where sprite will be drawn
        this.cur_bk_data = ctx.getImageData(this.x, this.y, 
                        this.sprite_json[this.root_e][this.state][this.cur_frame]['w'], 
                        this.sprite_json[this.root_e][this.state][this.cur_frame]['h']); 

        this.hitbox_x = this.sprite_json[this.root_e][this.state][this.cur_frame]['w'];
        this.hitbox_y = this.sprite_json[this.root_e][this.state][this.cur_frame]['h'];
        console.log("hitbox height is "+ this.hitbox_x + " width is " + this.hitbox_y);

        //sprite gets drawn    
        ctx.drawImage(this.sprite_json[this.root_e][this.state][this.cur_frame]['img'], this.x, this.y );

        this.cur_frame = this.cur_frame + 1;
        if(this.cur_frame >= this.sprite_json[this.root_e][this.state].length){
            console.log(this.cur_frame);
            this.cur_frame = 0;
        }

        //***************************************** start of sprite behavior **************************************************************

        if(state['afk'] && this.initial_afk) //-----------------------for initiating afk movement/bouncing-----------------------
        {
            console.log("afk");
            const movement_state = ["walk_NE", "walk_NW", "walk_SE", "walk_SW"];
            const random = Math.floor(Math.random() * movement_state.length);
            console.log("random movement " + random);
            this.initial_afk = false;
            this.cur_frame = 0;
            this.state = movement_state[random];
            if(movement_state[random] == "walk_NE")
            {
                this.x_v = 10;
                this.y_v = -10;
            }
            else if(movement_state[random] == "walk_NW")
            {
                this.x_v = -10;
                this.y_v = -10;
            }
            else if(movement_state[random] == "walk_SE")
            {
                this.x_v = 10;
                this.y_v = 10;
            }
            else if(movement_state[random] == "walk_SW")
            {
                this.x_v = -10;
                this.y_v = 10;
            }
        }   //-----------------------------------for state changing when key is pressed-----------------------------
        else if(state['key_press'] && this.initial_press){      
            this.key_press(state['key']);
            this.initial_press = false;
            this.initial_release = true;
        }   //-----------------------------------for changing to idle when key is let go----------------------------------
        else if(state['key_release'] && this.initial_release){     
            console.log("key released")
            this.key_press(state['key']);
            this.initial_press = true;
            this.initial_release = false;
            this.initial_afk = true;
        }   //------------------------------------start of afk bouncing -----------------------------------------------
        else if((this.x >= (window.innerWidth - this.sprite_json[this.root_e][this.state][this.cur_frame]['w'])-35) && this.x_v > 0 && state['afk']){  
            if(this.state == "walk_NW")
                this.afk_bouncing(this.state, 'E');
            else
                this.afk_bouncing(this.state, 'E');
        }else if(this.x <= 0 && this.x_v < 0 && state['afk']){
            if(this.state == "walk_NE")
                this.afk_bouncing(this.state, 'W');
            else
                this.afk_bouncing(this.state, 'W');
        }else if((this.y >= (window.innerHeight - this.sprite_json[this.root_e][this.state][this.cur_frame]['h'])) && this.y_v > 0 && state['afk']){
            if(this.state == "walk_SW")
                this.afk_bouncing(this.state, 'S');
            else
                this.afk_bouncing(this.state, 'S');
        }else if(this.y <= 0 && this.y_v < 0 && state['afk']){
            if(this.state == "walk_NW")
                this.afk_bouncing(this.state, 'N');
            else
                this.afk_bouncing(this.state, 'N');
        }   //---------------------------------start of bound hit when player is in control-------------------------------
        else if((this.x >= (window.innerWidth - this.sprite_json[this.root_e][this.state][this.cur_frame]['w'])-35) && this.x_v > 0){  
            this.bound_hit('E');
        }else if(this.x <= 0 && this.x_v < 0){
            this.bound_hit('W');
        }else if((this.y >= (window.innerHeight - this.sprite_json[this.root_e][this.state][this.cur_frame]['h'])) && this.y_v > 0){
            this.bound_hit('S');
        }else if(this.y <= 0 && this.y_v < 0){
            this.bound_hit('N');
        }

        this.x = this.x + this.x_v;
        this.y = this.y + this.y_v;
        //return false;
    }

    set_idle_state(){
        if(this.x_v != 0 || this.y_v != 0){
            this.x_v = 0;
            this.y_v = 0;
        }
        const idle_state = ["idle","idleBackAndForth","idleBreathing","idleFall","idleLayDown","idleLookAround","idleLookDown","idleLookLeft","idleLookRight","idleLookUp","idleSit","idleSpin","idleWave"];
        this.cur_frame = 0; //reset frame counter
        const random = Math.floor(Math.random() * idle_state.length);
        //console.log(idle_state[random]);
        this.state = idle_state[random];
    }

    bound_hit(side){
        //console.log("hit" + side);
        this.set_idle_state();
    } 

   afk_bouncing(dir, border){
        //console.log("bouncing");
        if(dir == "walk_NE" && border == 'N')
        {
            this.x_v = 10;
            this.y_v = 10;
            this.state = "walk_SE";
        }else if(dir == "walk_SE" && border == 'S')
        {
            this.x_v = 10;
            this.y_v = -10;
            this.state = "walk_NE";
        }else if(dir == "walk_NW" && border == 'N')
        {
            this.x_v = -10;
            this.y_v = 10;
            this.state = "walk_SW";
        }else if(dir == "walk_SW" && border == 'S')
        {
            this.x_v = -10;
            this.y_v = -10;
            this.state = "walk_NW";
        } else if(dir == "walk_SW" && border == 'W')
        {
            this.x_v = 10;
            this.y_v = 10;
            this.state = "walk_SE";
        }else if(dir == "walk_NW" && border == 'W')
        {
            this.x_v = 10;
            this.y_v = -10;
            this.state = "walk_NE";
        }else if(dir == "walk_SE" && border == 'E')
        {
            this.x_v = -10;
            this.y_v = 10;
            this.state = "walk_SW";
        }else if(dir == "walk_NE" && border == 'E')
        {
            this.x_v = -10;
            this.y_v = -10;
            this.state = "walk_NW";
        }
   }

   key_press(key){
        console.log("key pressed")
        var up_arrow = 38;
        var down_arrow = 40;
        var left_arrow = 37;
        var right_arrow = 39;
        
        if(key == up_arrow)
        {
            this.x_v = 0;
            this.y_v = -10;
            this.state = "walk_N";
        }else if(key == down_arrow)
        {
            this.x_v = 0;
            this.y_v = 10;
            this.state = "walk_S";
        }else if(key == right_arrow)
        {
            this.x_v = 10;
            this.y_v = 0;
            this.state = "walk_E";
        }else if(key == left_arrow)
        {
            this.x_v = -10;
            this.y_v = 0;
            this.state = "walk_W";
        }else if(key == null)
        {
            this.x_v = 0;
            this.y_v = 0;
            this.set_idle_state();

        }

        //Resets frame counter incase current frame is higher than new state frame length
        if(this.cur_frame >= this.sprite_json[this.root_e][this.state].length)
        {
            this.cur_frame = 0;
        }
   }


}
