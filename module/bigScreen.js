'use strict';
/*
	G8V Big Screen Module by a0000778
	MIT License
*/
{
	let appendItem;
	let screenInfo=[0,0,800,600];
	
	g8v.loading('bigScreen');
	g8v.module.set('bigScreen',{
		'append': append
	});
	g8v.windowOption.push(function(item){
		return $.tag('li',{
			'className': 'ion-ios-albums',
			'title': '大畫面',
			'addEventListener': ['click',function(){
				if(appendItem && appendItem.contentItem===item)
					appendItem.delete();
				else
					append(item);
			}]
		});
	});
	g8v.loaded('bigScreen');
	
	function BigScreenItem(){
		g8v.AppendItem.call(this,'bigScreen',[0,0,0,0]);
		Object.defineProperty(this,'oldPosX',{
			'get': () => this.args[0],
			'set': (v) => this.args[0]=v
		});
		Object.defineProperty(this,'oldPosY',{
			'get': () => this.args[1],
			'set': (v) => this.args[1]=v
		});
		Object.defineProperty(this,'oldWidth',{
			'get': () => this.args[2],
			'set': (v) => this.args[2]=v
		});
		Object.defineProperty(this,'oldHeight',{
			'get': () => this.args[3],
			'set': (v) => this.args[3]=v
		});
		this.appended=false;
	}
	BigScreenItem.prototype.__proto__=g8v.AppendItem.prototype;
	BigScreenItem.prototype._append=function(){
		if(!this.contentItem.vw){
			console.error('[BigScreen] 錯誤的附加對象');
			this.delete();
		}
		this.oldPosX=this.contentItem.posX;
		this.oldPosY=this.contentItem.posY;
		this.oldWidth=this.contentItem.width;
		this.oldHeight=this.contentItem.height;
		this.contentItem.vw
			.moveTo(screenInfo[0],screenInfo[1])
			.resize(screenInfo[2],screenInfo[3])
			.on('move',updateScreenPos)
			.on('resize',updateScreenSize)
			.on('dragEnd',updateScreenPos)
			.on('resizeEnd',updateScreenPos)
			.on('resizeEnd',updateScreenSize)
		;
		this.appended=true;
	}
	BigScreenItem.prototype._delete=function(){
		if(!this.appended) return;
		this.contentItem.vw
			.unOn('move',updateScreenPos)
			.unOn('resize',updateScreenSize)
			.unOn('dragEnd',updateScreenPos)
			.unOn('resizeEnd',updateScreenPos)
			.unOn('resizeEnd',updateScreenSize)
			.moveTo(this.oldPosX,this.oldPosY)
			.resize(this.oldWidth,this.oldHeight)
		;
		this.appended=false;
	}
	function append(item,args){
		if(!appendItem) appendItem=new BigScreenItem();
		if(appendItem.contentItem)
			appendItem.delete();
		if(!item.vw) return;
		if(args){
			screenInfo=[item.posX,item.posY,item.width,item.height];
			appendItem.append(item);
			appendItem.oldPosX=args[0];
			appendItem.oldPosY=args[1];
			appendItem.oldWidth=args[2];
			appendItem.oldHeight=args[3];
		}else
			appendItem.append(item);
	}
	function updateScreenPos(){
		screenInfo[0]=appendItem.contentItem.posX;
		screenInfo[1]=appendItem.contentItem.posY;
	}
	function updateScreenSize(){
		screenInfo[2]=appendItem.contentItem.width;
		screenInfo[3]=appendItem.contentItem.height;
	}
}