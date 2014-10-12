/*
VirtualWindow 虛擬視窗 v1.3 修改版 by a0000778
MIT License
*/
function VirtualWindow(obj,left,top,width,height,option){
	this.obj=typeof obj==='string'? $(obj):obj;
	if(!this.obj) return;
	this.width=parseInt(width? width:this.obj.clientWidth,10);
	this.height=parseInt(height? height:this.obj.clientHeight,10);
	var option=option? option:{};
	this.option={
		'dragBarSelect': option.hasOwnProperty('dragBarSelect')? option.bar:'.vw_bar',
		'hideObjSelect': option.hasOwnProperty('hideButtonSelect')? option.hideButtonSelect:'.vw_hide',
		'closeObjSelect': option.hasOwnProperty('closeObjSelect')? option.closeObjSelect:'.vw_close',
		'opacityObjSelect': option.hasOwnProperty('opacityObjSelect')? option.opacityObjSelect:'.vw_opacity'
	};
	this.posX=parseInt(left);
	this.posY=parseInt(top);
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
		'close': [],
		'resizeStart': [],
		'resizeEnd': [],
		'dragStart': [],
		'dragEnd': []
	};
	
	this.obj.style.position='absolute';
	this.obj.style.zIndex=VirtualWindow.topZIndex++;
	this.moveTo(this.posX,this.posY);
	this.resize(this.width,this.height);
	
	this.obj.addEventListener('mousedown',this.resizeStart.bind(this));
	
	var bar=this.obj.querySelector(this.option.dragBarSelect);
	bar.addEventListener('mousedown',this.dragStart.bind(this));
	this.option.hideObjSelect && this.obj.querySelectorAll(this.option.hideObjSelect).forEach(function(o){
		o.addEventListener('click',this.close.bind(this,false));
	},this);
	this.option.closeObjSelect && this.obj.querySelectorAll(this.option.closeObjSelect).forEach(function(o){
		o.addEventListener('click',this.close.bind(this,true));
	},this);
	this.option.opacityObjSelect && this.obj.querySelectorAll(this.option.opacityObjSelect).forEach(function(o){
		o.addEventListener('click',this.opacity.bind(this,undefined));
	},this);
}
VirtualWindow.topZIndex=1000;
VirtualWindow.consoleLayer=null;
VirtualWindow.prototype.toTop=function(){
	this.obj.style.zIndex=VirtualWindow.topZIndex++;
	return this;
}
VirtualWindow.prototype.open=function(){
	this.obj.style.display='block';
	this.trigger('open');
	return this;
}
VirtualWindow.prototype.close=function(del){
	if(del) this.obj.$del();
	else this.obj.style.display='none';
	this.trigger('close');
	return this;
}
VirtualWindow.prototype.opacity=function(value){
	if(value!==undefined){
		this.obj.style.opacity=value.toString();
	}else{
		var opacity=parseFloat(this.obj.style.opacity || '1',10);
		if(opacity>=1) this.obj.style.opacity='0.7';
		else if(opacity>=0.7) this.obj.style.opacity='0.4';
		else if(opacity>=0.4) this.obj.style.opacity='0.1';
		else this.obj.style.opacity='1';
	}
	return this;
}
VirtualWindow.prototype.on=function(eventName,func){
	var evList=this.event[eventName];
	if(!evList) return false;
	evList.push(func);
	return this;
}
VirtualWindow.prototype.unOn=function(eventName,func){
	var evList=this.event[eventName];
	if(!evList) return false;
	if(func){
		var evFuncId=evList.indexOf(func);
		if(evFuncId) evList.splice(evFuncId,1);
	}else
		evList.splice(0,evList.length);
	return this;
}
VirtualWindow.prototype.trigger=function(eventName,args){
	var evList=this.event[eventName];
	if(!evList) return false;
	evList.forEach(function(func){
		func.apply(this,args);
	},this);
	return this;
}
VirtualWindow.prototype.moveTo=function(x,y){
	this.posX=parseInt(x);
	this.posY=parseInt(y);
	this.obj.style.left=x+'px';
	this.obj.style.top=y+'px';
	this.trigger('move');
	return this;
}
VirtualWindow.prototype.resize=function(width,height){
	this.width=parseInt(width);
	this.height=parseInt(height);
	this.obj.style.width=width+'px';
	this.obj.style.height=height+'px';
	this.trigger('resize');
	return this;
}
VirtualWindow.prototype.disableSelect=function(e){
	e.preventDefault();
}
VirtualWindow.prototype.dragStart=function(e){
	e.stopPropagation();
	this.obj.style.zIndex=2147483647;
	this.barDownX=e.clientX-this.posX;
	this.barDownY=e.clientY-this.posY;
	VirtualWindow.consoleLayer.style.display='block';
	document.addEventListener('selectstart',this.disableSelect);
	window.addEventListener('mousemove',this.dragMove);
	window.addEventListener('mouseup',this.dragEnd.bind(this));
	this.trigger('dragStart');
}
VirtualWindow.prototype.dragMove=function(e){
	e.stopPropagation();
	this.moveTo(e.clientX-this.barDownX,e.clientY-this.barDownY);
}
VirtualWindow.prototype.dragEnd=function(e){
	e.stopPropagation();
	this.barDownX=null;
	this.barDownY=null;
	this.toTop();
	window.removeEventListener('mousemove',this.dragMove);
	document.removeEventListener('selectstart',this.disableSelect);
	VirtualWindow.consoleLayer.style.display='none';
	this.trigger('dragEnd');
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
		VirtualWindow.consoleLayer.style.display='block';
		document.addEventListener('selectstart',this.disableSelect);
		window.addEventListener('mousemove',this.resizeUpdate);
		window.addEventListener('mouseup',this.resizeEnd.bind(this));
		this.trigger('resizeStart');
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
			newHeight+=this.posY+this.resizeHeight.pos-e.clientY;
		break;
		case 'bottom': newHeight=e.clientY-this.posY-this.resizeHeight.pos;
	}
	this.moveTo(newLeft,newTop).resize(newWidth,newHeight);
}
VirtualWindow.prototype.resizeEnd=function(e){
	if(!(this.resizeWidth.mode || this.resizeHeight.mode)) return;
	e.stopPropagation();
	this.resizeWidth.mode=false;
	this.resizeHeight.mode=false;
	window.removeEventListener('mousemove',this.resizeUpdate);
	document.removeEventListener('selectstart',this.disableSelect);
	VirtualWindow.consoleLayer.style.display='none';
	this.trigger('resizeEnd');
}
window.addEventListener('load',function(){
	VirtualWindow.consoleLayer=$().$add('div',{'style':{
		'position': 'fixed',
		'top': 0,
		'left': 0,
		'right': 0,
		'bottom': 0,
		'zIndex': 2147483646,
		'display': 'none'
	}})
});