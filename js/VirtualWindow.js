/*
VirtualWindow 虛擬視窗 v0.1 by a0000778
*/
function VirtualWindow(id,top,left,width,height){
	this.obj=$(id);
	if(!this.obj) return;
	this.width=width? width:this.obj.clientWidth;
	this.height=height? height:this.obj.clientHeight;
	this.posX=left;
	this.posY=top;
	this.barDownX=null;
	this.barDownY=null;
	this.resizeWidth={'mode':false,'pos':null};
	this.resizeHeight={'mode':false,'pos':null};
	this.dragMove=this.dragMove.bind(this);
	this.resizeUpdate=this.resizeUpdate.bind(this);
	this.disableSelect=this.disableSelect.bind(this);
	this.event={
		'resize': [],
		'move': [],
		'open': [],
		'close': []
	};

	this.obj.style.position='absolute';
	this.obj.style.zIndex=VirtualWindow.topZIndex++;
	this.moveTo(left,top);
	this.resize(width,height);

	this.obj.addEventListener('mousedown',this.resizeStart.bind(this));
	this.obj.addEventListener('mouseup',this.resizeEnd.bind(this));

	var bar=this.obj.getElementsByClassName('vw_bar')[0];
	bar.addEventListener('mousedown',this.dragStart.bind(this));
	bar.addEventListener('mouseup',this.dragEnd.bind(this));
	this.obj.querySelectorAll('.vw_close,.vw_hide').forEach(function(o){
		o.addEventListener('click',this.close.bind(this,(o.className.indexOf('vw_close')>=0)));
	},this);
}
VirtualWindow.topZIndex=0;
VirtualWindow.prototype.toTop=function(){
	this.obj.style.zIndex=VirtualWindow.topZIndex++;
}
VirtualWindow.prototype.open=function(){
	this.obj.style.display='block';
	this.trigger('open');
}
VirtualWindow.prototype.close=function(del){
	if(del) this.obj.$del();
	else this.obj.style.display='none';
	this.trigger('close');
}
VirtualWindow.prototype.on=function(eventName,func){
	if(!this.event[eventName]) return false;
	this.event[eventName].push(func);
}
VirtualWindow.prototype.trigger=function(eventName,args){
	if(!this.event[eventName]) return false;
	this.event[eventName].forEach(function(func){
		func.apply(this,args);
	},this);
}
VirtualWindow.prototype.moveTo=function(x,y){
	this.posX=x;
	this.posY=y;
	this.obj.style.left=x+'px';
	this.obj.style.top=y+'px';
	this.trigger('move');
}
VirtualWindow.prototype.resize=function(width,height){
	this.width=width;
	this.height=height;
	this.obj.style.width=width+'px';
	this.obj.style.height=height+'px';
	this.trigger('resize');
}
VirtualWindow.prototype.disableSelect=function(e){
	e.preventDefault();
}
VirtualWindow.prototype.dragStart=function(e){
	e.stopPropagation();
	this.toTop();
	this.barDownX=e.layerX;
	this.barDownY=e.layerY;
	document.addEventListener('selectstart',this.disableSelect,true);
	document.addEventListener('mousemove',this.dragMove);
}
VirtualWindow.prototype.dragMove=function(e){
	e.stopPropagation();
	this.moveTo(e.clientX-this.barDownX,e.clientY-this.barDownY);
}
VirtualWindow.prototype.dragEnd=function(e){
	e.stopPropagation();
	this.barDownX=null;
	this.barDownY=null;
	document.removeEventListener('mousemove',this.dragMove);
	document.removeEventListener('selectstart',this.disableSelect);
}
VirtualWindow.prototype.resizeStart=function(e){
	e.stopPropagation();
	if(e.layerX<5){
		this.resizeWidth.mode='left';
		this.resizeWidth.pos=e.layerX;
	}else if(e.layerX+5>this.width){
		this.resizeWidth.mode='right';
		this.resizeWidth.pos=e.layerX-this.width;
	}
	if(e.layerY<5){
		this.resizeHeight.mode='top';
		this.resizeHeight.pos=e.layerY;
	}else if(e.layerY+5>this.height){
		this.resizeHeight.mode='bottom';
		this.resizeHeight.pos=e.layerY-this.height;
	}
	if(this.resizeWidth.mode || this.resizeHeight.mode){
		this.toTop();
		document.addEventListener('selectstart',this.disableSelect,true);
		document.addEventListener('mousemove',this.resizeUpdate);
	}
}
VirtualWindow.prototype.resizeUpdate=function(e){
	e.stopPropagation();
	var newLeft=this.posX;
	var newTop=this.posY;
	var newWidth=this.width;
	var newHeight=this.height;
	switch(this.resizeWidth.mode){
		case 'left':
			newLeft=e.clientX-this.resizeWidth.pos;
			newWidth+=this.posX+this.resizeWidth.pos-e.clientX;
		break;
		case 'right': newWidth=e.clientX-this.posX-this.resizeWidth.pos;
	}
	switch(this.resizeHeight.mode){
		case 'top':
			newTop=e.clientY-this.resizeHeight.pos;
			newWidth+=this.posY+this.resizeHeight.pos-e.clientY;
		break;
		case 'bottom': newHeight=e.clientY-this.posY-this.resizeHeight.pos;
	}
	this.moveTo(newLeft,newTop);
	this.resize(newWidth,newHeight);
}
VirtualWindow.prototype.resizeEnd=function(e){
	if(!(this.resizeWidth.mode || this.resizeHeight.mode)) return;
	e.stopPropagation();
	this.resizeWidth.mode=false;
	this.resizeHeight.mode=false;
	document.removeEventListener('mousemove',this.resizeUpdate);
	document.removeEventListener('selectstart',this.disableSelect);
}