'use strict';
/*
VirtualWindow 虛擬視窗 重製版 by a0000778
MIT License
*/
function VirtualWindow(obj,posX,posY,width,height,option){
	if(typeof(obj)==='string')
		obj=$(obj);
	if(!obj) throw new Error('視窗物件不存在');
	option=option || {};
	
	this._obj=obj;
	this._event={
		'toTop': [],//cancel()
		'blur': [],//undefined
		'focus': [],//undefined
		'resize': [],//undefined
		'move': [],//undefined
		'open': [],//undefined
		'close': [],//del
		'resizeStart': [],//e
		'resizeBefore': [],//e,updateInfo{}
		'resizeEnd': [],//e
		'dragStart': [],//e
		'dragBefore': [],//e,toPos{}
		'dragEnd': []//e
	};
	this._barDownX=null;
	this._barDownY=null;
	this._resizeWidth={'mode':false,'pos':null};
	this._resizeHeight={'mode':false,'pos':null};
	this.borderWidth=option.borderWidth || 5;
	Object.defineProperty(this,'width',{
		'get': () => Number.parseInt(this._obj.style.width,10),
		'set': (value) => {
			this._obj.style.width=value+'px';
			this._emit('resize');
		}
	});
	Object.defineProperty(this,'height',{
		'get': () => Number.parseInt(this._obj.style.height,10),
		'set': (value) => {
			this._obj.style.height=value+'px';
			this._emit('resize');
		}
	});
	Object.defineProperty(this,'posX',{
		'get': () => Number.parseInt(this._obj.style.left,10),
		'set': (value) => {
			this._obj.style.left=value+'px';
			this._emit('move');
		}
	});
	Object.defineProperty(this,'posY',{
		'get': () => Number.parseInt(this._obj.style.top,10),
		'set': (value) => {
			this._obj.style.top=value+'px';
			this._emit('move');
		}
	});
	
	//覆寫函式以支援 this 及事件處理
	this._dragStart=(e) => VirtualWindow.prototype._dragStart.call(this,e);
	this._dragMove=(e) => VirtualWindow.prototype._dragMove.call(this,e);
	this._dragEnd=(e) => VirtualWindow.prototype._dragEnd.call(this,e);
	this._resizeMode=(e) => VirtualWindow.prototype._resizeMode.call(this,e);
	this._resizeStart=(e) => VirtualWindow.prototype._resizeStart.call(this,e);
	this._resizeUpdate=(e) => VirtualWindow.prototype._resizeUpdate.call(this,e);
	this._resizeEnd=(e) => VirtualWindow.prototype._resizeEnd.call(this,e);
	
	//初始化
	this._obj.style.position='absolute';
	this._obj.addEventListener('mousedown',this._resizeStart);
	this._obj.addEventListener('mousemove',this._resizeMode);
	
	var select;
	select=this._obj.querySelectorAll(option.dragBarSelect || '.vw_bar');
	select && select.forEach((ele) => ele.addEventListener('mousedown',this._dragStart));
	select=this._obj.querySelectorAll(option.hideButtonSelect || '.vw_hide');
	select && select.forEach((ele) => ele.addEventListener('click',() => this.close()));
	select=this._obj.querySelectorAll(option.closeObjSelect || '.vw_close');
	select && select.forEach((ele) => ele.addEventListener('click',() => this.close(true)));
	this
		.moveTo(posX,posY)
		.resize(width || this._obj.clientWidth,height || this._obj.clientHeight)
		.focus()
	;
	
	this._emit('open');
}
VirtualWindow.focus=null;
VirtualWindow.topZIndex=1000;
VirtualWindow.consoleLayer=null;
VirtualWindow.prototype.on=function(eventName,func){
	var evList=this._event[eventName];
	if(!evList) return false;
	evList.push(func);
	return this;
}
VirtualWindow.prototype.unOn=function(eventName,func){
	var evList=this._event[eventName];
	if(!evList) return false;
	if(func){
		var evFuncId=evList.indexOf(func);
		if(evFuncId) evList.splice(evFuncId,1);
	}else
		this._event[eventName]=[];
	return this;
}
VirtualWindow.prototype._emit=function(eventName){
	var evList=this._event[eventName];
	if(!evList) return false;
	var args=Array.prototype.slice.call(arguments,1);
	for(var evFunc of evList)
		evFunc.apply(this,args);
	return this;
}
VirtualWindow.prototype.focus=function(){
	if(VirtualWindow.focus!==this){
		VirtualWindow.focus && VirtualWindow.focus._emit('blur');
		var cancel=false;
		this._emit('toTop',() => cancel=true);
		if(!cancel) this._obj.style.zIndex=VirtualWindow.topZIndex++;
		VirtualWindow.focus=this;
		this._emit('focus');
	}
	return this;
}
VirtualWindow.prototype.open=function(){
	this._obj.style.display='block';
	this._emit('open');
	return this;
}
VirtualWindow.prototype.close=function(del){
	if(VirtualWindow.focus===this){
		VirtualWindow.focus=undefined;
		this._emit('blur');
	}
	if(del) this._obj.$del();
	else this._obj.style.display='none';
	this._emit('close',del);
	return this;
}
VirtualWindow.prototype.moveTo=function(x,y){
	this._obj.style.left=x+'px';
	this._obj.style.top=y+'px';
	this._emit('move');
	return this;
}
VirtualWindow.prototype.resize=function(width,height){
	this._obj.style.width=width+'px';
	this._obj.style.height=height+'px';
	this._emit('resize');
	return this;
}
VirtualWindow.prototype._disableSelect=function(e){
	e.preventDefault();
}
VirtualWindow.prototype._dragStart=function(e){
	e.stopPropagation();
	this.focus();
	this._obj.classList.add('hover');
	this._barDownX=e.clientX-this.posX;
	this._barDownY=e.clientY-this.posY;
	VirtualWindow.consoleLayer.style.cursor='move';
	VirtualWindow.consoleLayer.style.display='block';
	document.addEventListener('selectstart',this._disableSelect);
	window.addEventListener('mousemove',this._dragMove);
	window.addEventListener('mouseup',this._dragEnd);
	this._emit('dragStart',e);
}
VirtualWindow.prototype._dragMove=function(e){
	e.stopPropagation();
	var toPos={
		'x': e.clientX-this._barDownX,
		'y': e.clientY-this._barDownY
	};
	this._emit('dragBefore',e,toPos);
	this.moveTo(toPos.x,toPos.y);
}
VirtualWindow.prototype._dragEnd=function(e){
	e.stopPropagation();
	this._barDownX=null;
	this._barDownY=null;
	window.removeEventListener('mousemove',this._dragMove);
	window.removeEventListener('mouseup',this._dragEnd);
	document.removeEventListener('selectstart',this._disableSelect);
	VirtualWindow.consoleLayer.style.display='none';
	this._obj.classList.remove('hover');
	this._emit('dragEnd',e);
}
VirtualWindow.prototype._resizeMode=function(e){
	if(e.target!==this._obj) return;
	if(e.layerX<this.borderWidth){
		this._resizeWidth.mode='left';
		this._resizeWidth.pos=e.layerX;
	}else if(e.layerX+this.borderWidth>this.width){
		this._resizeWidth.mode='right';
		this._resizeWidth.pos=e.layerX-this.width;
	}else{
		this._resizeWidth.mode=false;
		this._resizeWidth.pos=null;
	}
	if(e.layerY<this.borderWidth){
		this._resizeHeight.mode='top';
		this._resizeHeight.pos=e.layerY;
	}else if(e.layerY+this.borderWidth>this.height){
		this._resizeHeight.mode='bottom';
		this._resizeHeight.pos=e.layerY-this.height;
	}else{
		this._resizeHeight.mode=false;
		this._resizeHeight.pos=null;
	}
	if(this._resizeWidth.mode && this._resizeHeight.mode){
		if(
			(this._resizeHeight.mode=='top' && this._resizeWidth.mode=='left') || 
			(this._resizeHeight.mode=='bottom' && this._resizeWidth.mode=='right')
		) this._obj.style.cursor='nwse-resize';
		else this._obj.style.cursor='nesw-resize';
	}else if(this._resizeWidth.mode)
		this._obj.style.cursor='ew-resize';
	else if(this._resizeHeight.mode)
		this._obj.style.cursor='ns-resize';
	else
		this._obj.style.cursor='auto';
}
VirtualWindow.prototype._resizeStart=function(e){
	e.stopPropagation();
	this._resizeMode(e);
	if(this._resizeWidth.mode || this._resizeHeight.mode){
		this.focus();
		this._obj.classList.add('hover');
		VirtualWindow.consoleLayer.style.cursor=this._obj.style.cursor;
		VirtualWindow.consoleLayer.style.display='block';
		this._obj.removeEventListener('mousemove',this._resizeMode);
		document.addEventListener('selectstart',this._disableSelect);
		window.addEventListener('mousemove',this._resizeUpdate);
		window.addEventListener('mouseup',this._resizeEnd);
		this._emit('resizeStart',e);
	}
}
VirtualWindow.prototype._resizeUpdate=function(e){
	e.stopPropagation();
	var updateInfo={
		'posX': this.posX,
		'posY': this.posY,
		'width': this.width,
		'height': this.height,
		'wMode': this._resizeWidth.mode,
		'hMode': this._resizeHeight.mode
	}
	if(this._resizeWidth.mode=='left'){
		updateInfo.posX=e.clientX-this._resizeWidth.pos;
		updateInfo.width+=this.posX+this._resizeWidth.pos-e.clientX;
	}else if(this._resizeWidth.mode=='right')
		updateInfo.width=e.clientX-this.posX-this._resizeWidth.pos;
	if(this._resizeHeight.mode=='top'){
		updateInfo.posY=e.clientY-this._resizeHeight.pos;
		updateInfo.height+=this.posY+this._resizeHeight.pos-e.clientY;
	}else if(this._resizeHeight.mode=='bottom')
		updateInfo.height=e.clientY-this.posY-this._resizeHeight.pos;
	this._emit('resizeBefore',e,updateInfo);
	this.moveTo(updateInfo.posX,updateInfo.posY).resize(updateInfo.width,updateInfo.height);
}
VirtualWindow.prototype._resizeEnd=function(e){
	if(!(this._resizeWidth.mode || this._resizeHeight.mode)) return;
	e.stopPropagation();
	this._resizeWidth.mode=false;
	this._resizeHeight.mode=false;
	this._obj.classList.remove('hover');
	window.removeEventListener('mousemove',this._resizeUpdate);
	window.removeEventListener('mouseup',this._resizeEnd);
	document.removeEventListener('selectstart',this._disableSelect);
	this._obj.addEventListener('mousemove',this._resizeMode);
	VirtualWindow.consoleLayer.style.display='none';
	this._emit('resizeEnd',e);
}
window.addEventListener('load',function(){
	VirtualWindow.consoleLayer=$().$add('div',{'style':{
		'position': 'fixed',
		'top': 0,
		'left': 0,
		'right': 0,
		'bottom': 0,
		'zIndex': 2147483647,
		'display': 'none'
	}})
});