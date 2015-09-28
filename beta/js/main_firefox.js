'use strict';
/*
	G8V beta for Firefox by a0000778
	MIT License
	* 解決不支援 block functions 問題
*/
{//G8V主程式
	let g8v={};
	let module=new Map();
	let windowOption=[];
	let itemList=new Set();
	let bgLayer=0;
	let normalLayer=1000;
	let topLayer=1000000000;
	let controlTop=null;
	let controlBottom=null;
	
	let AppendItem=function(module,args){
		this.contentItem=null;
		this.module=module;
		this.args=args;
		this._event=new Map();
		
		for(let func of AppendItem.afterCreate)
			func(this);
	}
	AppendItem.afterCreate=[];
	AppendItem.prototype._append=function(){}//請覆寫我
	AppendItem.prototype._delete=function(){}//請覆寫我
	AppendItem.prototype.append=function(contentItem){
		if(this.contentItem) return;
		this.contentItem=contentItem;
		contentItem.append.push(this);
		this._append();//交由各 append 模組實作生效步驟
		this.emit('append',contentItem);
		contentItem.emit('append',this);
	}
	AppendItem.prototype.delete=function(){
		this._delete();//交由各 append 模組實作移除步驟
		this.contentItem.append.splice(this.contentItem.append.indexOf(this),1);
		this.contentItem=null;
		this.emit('delete');
	}
	AppendItem.prototype.emit=function(eventName){
		let evList=this._event.get(eventName);
		if(!evList) return this;
		let args=Array.prototype.slice.call(arguments,1);
		for(let evFunc of evList.values())
			evFunc.apply(this,args);
		return this;
	}
	AppendItem.prototype.on=function(evName,func){
		let evList=this._event.get(evName);
		if(!evList){
			evList=new Set();
			this._event.set(evName,evList);
		}
		evList.add(func);
		return this;
	}
	AppendItem.prototype.unOn=function(evName,func){
		let evList=this._event.get(evName);
		if(!evList) return this;
		if(func) evList.delete(func);
		else evList.clear();
		return this;
	}
	let ContentItem=function(module,args){
		this.module=module;
		this.args=args;
		this.append=[];
		this._event=new Map();
		
		itemList.add(this);
		for(let func of ContentItem.afterCreate)
			func(this);
	}
	ContentItem.afterCreate=[];
	ContentItem.prototype._delete=function(){}//請覆寫我
	ContentItem.prototype.delete=function(){
		this._delete();
		itemList.delete(this);
		this.emit('delete');
	}
	ContentItem.prototype.emit=function(eventName){
		let evList=this._event.get(eventName);
		if(!evList) return this;
		let args=Array.prototype.slice.call(arguments,1);
		for(let evFunc of evList.values())
			evFunc.apply(this,args);
		return this;
	}
	ContentItem.prototype.findAppend=function(module){
		return this.append.filter((append) => append.module===module);
	}
	ContentItem.prototype.on=function(evName,func){
		let evList=this._event.get(evName);
		if(!evList){
			evList=new Set();
			this._event.set(evName,evList);
		}
		evList.add(func);
		return this;
	}
	ContentItem.prototype.unOn=function(evName,func){
		let evList=this._event.get(evName);
		if(!evList) return this;
		if(func) evList.delete(func);
		else evList.clear();
		return this;
	}
	let WindowItem=function(module,args,title,content,posX,posY,width,height){
		ContentItem.call(this,module,args);
		let windowObj=$().$add('div',{
			'className': 'window'
		});
		let titleObj=windowObj.$add('div',{'className': 'vw_bar'}).$add(document.createTextNode(title));
		let contentEle=windowObj.$add(
			windowOption.reduce(
				(r,f) => {
					r.$add(f(this)).addEventListener('mousedown',(e) => e.stopPropagation());
					return r;
				},
				$.tag('ul',{
					'className': 'vw_option'
				})
			)
			,null,true
		).$add('div',{'className':'content'}).$add(content,null,true);
		
		this.vw=new VirtualWindow(
			windowObj,
			posX,
			posY,
			width,
			height
		).on('close',() => {
			this.vw=undefined;
			this.delete();
		});
		this.content=contentEle;
		Object.defineProperty(this,'title',{
			'get': () => titleObj.textContent,
			'set': (value) => {
				titleObj.textContent=value;
				this.emit('title');
			}
		});
		Object.defineProperty(this,'posX',{
			'get': () => this.vw.posX,
			'set': (value) => this.vw.posX=value
		});
		Object.defineProperty(this,'posY',{
			'get': () => this.vw.posY,
			'set': (value) => this.vw.posY=value
		});
		Object.defineProperty(this,'width',{
			'get': () => this.vw.width,
			'set': (value) => this.vw.width=value
		});
		Object.defineProperty(this,'height',{
			'get': () => this.vw.height,
			'set': (value) => this.vw.height=value
		});
		
		for(let func of WindowItem.afterCreate)
			func(this);
	}
	WindowItem.afterCreate=[];
	WindowItem.prototype.__proto__=ContentItem.prototype;
	WindowItem.prototype.delete=function(){
		this.vw && this.vw.close(true);
		ContentItem.prototype.delete.call(this);
	}
	
	{//載入步驟控制
		let waitLoad=new Set();
		let onLoad=new Map();
		let emitOnLoad=false;
		
		window.addEventListener('load',() => {
			emitOnLoad=true;
		});
		g8v.loading=function(modName){
			waitLoad.add(modName);
			console.log('[G8V] 正在載入模組 %s ...',modName);
		}
		g8v.loaded=function(modName){
			if(!waitLoad.has(modName)) throw new Error('未知的載入中項目 '+modName);
			waitLoad.delete(modName);
			console.log('[G8V] 模組 %s 載入完畢，觸發相關事件 ...',modName);
			onLoad.has(modName) && onLoad.get(modName).forEach((func) => func());
			onLoad.set(modName,null);
			console.log('[G8V] 模組 %s 載入完畢，相關事件觸發完畢',modName);
			if(emitOnLoad && !waitLoad.size){
				console.log('[G8V] 所有模組載入完畢，觸發 onLoad ...');
				onLoad.get().forEach((func) => func());
				onLoad.set(undefined,null);
				emitOnLoad=false;
				console.log('[G8V] onLoad 觸發完畢，載入完畢！');
			}
		}
		g8v.onLoad=function(modName,func){
			if(!func){
				func=modName;
				modName=undefined;
			}
			if(!onLoad.has(modName))
				onLoad.set(modName,[]);
			let onLoad_mod=onLoad.get(modName);
			if(onLoad_mod===null)
				func();
			else
				onLoad_mod.push(func);
		}
		g8v.loading('g8v');
	}
	{//介接各種變數供模組使用
		window.g8v=g8v;
		Object.defineProperty(g8v,'bgLayer',{
			'get': () => bgLayer,
			'set': (value) => bgLayer=value
		});
		Object.defineProperty(g8v,'topLayer',{
			'get': () => topLayer,
			'set': (value) => topLayer=value
		});
		//連動VirtualWindow
		Object.defineProperty(VirtualWindow,'topZIndex',{
			'get': () => normalLayer,
			'set': (value) => normalLayer=value
		});
		//對外變數
		g8v.module=module;
		g8v.windowOption=windowOption;
		g8v.itemList=itemList;
		//對外類
		g8v.AppendItem=AppendItem;
		g8v.ContentItem=ContentItem;
		g8v.WindowItem=WindowItem;
		//對外API
		g8v.addControlTop=function(ele){
			controlTop.$add(ele);
			return g8v;
		}
		g8v.addControlBottom=function(ele){
			controlBottom.$add(ele);
			return g8v;
		}
	}
	
	window.addEventListener('load',function(){
		controlTop=document.querySelector('#control .top');
		controlBottom=document.querySelector('#control .bottom');
		let ctl=document.getElementById('control');
		let focusEle=null;
		ctl.addEventListener('focus',(e) => {
			if(e.target.tagName.toLowerCase()==='input'){
				focusEle=e.target;
				let parentEle=e.target.parentNode;
				do{
					parentEle.classList.add('hover');
					parentEle=parentEle.parentNode;
				}while(parentEle!==ctl)
				parentEle.classList.add('hover');
			}
		},true);
		ctl.addEventListener('blur',() => {
			if(focusEle===null) return;
			let parentEle=focusEle.parentNode;
			do{
				parentEle.classList.remove('hover');
				parentEle=parentEle.parentNode;
			}while(parentEle!==ctl)
			parentEle.classList.remove('hover');
			focusEle=null;
		},true);
		g8v.loaded('g8v');
	});
}
{//核心模組: 視窗基本選項
	g8v.windowOption.push(
		function(){
			return $.tag('li',{
				'className': 'vw_close ion-close-round',
				'title': '關閉視窗'
			});
		},
		function(item){
			return $.tag('li',{
				'className': 'ion-loop',
				'title': '重新整理',
				'addEventListener': ['click',function(){
					let mod=g8v.module.get(item.module);
					if(!mod.load){
						alert('這個視窗不支援重新整理功能！');
						return;
					}
					let newObj=mod.load.apply(mod,item.args.concat([item.title,item.posX,item.posY,item.width,item.height]));
					if(newObj){
						item.append.forEach(function(objAppend){
							let module=this.get(objAppend.module);
							if(module && module.append)
								module.append.apply(module,[newObj].concat(objAppend.args));
						},g8v.module);
					}
					item.delete();
				}]
			});
		},
		function(obj){
			return $.tag('li',{
				'className': 'ion-ios-pricetag',
				'title': '修改標題',
				'addEventListener': ['click',function(e){
					var newtitle=prompt('請輸入新標題',obj.title);
					if(newtitle===null) return;
					obj.title=newtitle;
				}]
			});
		}
	);
}
{//核心模組: 排版功能強化
	const fixMaxRange=10;//距離多少以內觸發貼齊
	let dragBefore=function(item,e,toPos){
		//自動貼齊
		let xItem,xItemMode,yItem,yItemMode;
		let xItemDist=fixMaxRange+1,yItemDist=fixMaxRange+1;
		let xPCache=toPos.x+item.width;
		let yPCache=toPos.y+item.height;
		for(let checkItem of g8v.itemList){
			if(checkItem===item || !checkItem.vw) continue;
			let distX=[
				Math.abs(toPos.x-checkItem.posX),//LeftLeft
				Math.abs(toPos.x-checkItem.posX-checkItem.width),//LeftRight
				Math.abs(xPCache-checkItem.posX),//RightLeft
				Math.abs(xPCache-checkItem.posX-checkItem.width)//RightRight
			];
			let distY=[
				Math.abs(toPos.y-checkItem.posY),//TopTop
				Math.abs(toPos.y-checkItem.posY-checkItem.height),//TopBottom
				Math.abs(yPCache-checkItem.posY),//BottomTop
				Math.abs(yPCache-checkItem.posY-checkItem.height)//BottomBottom
			];
			let distXMin=Math.min.apply(Math,distX);
			let distYMin=Math.min.apply(Math,distY);
			if(distXMin<xItemDist){
				xItem=checkItem;
				xItemDist=distXMin;
				xItemMode=distX.indexOf(distXMin);
			}
			if(distYMin<yItemDist){
				yItem=checkItem;
				yItemDist=distYMin;
				yItemMode=distY.indexOf(distYMin);
			}
		}
		switch(xItemMode){
			case 0: toPos.x=xItem.posX; break;
			case 1: toPos.x=xItem.posX+xItem.width; break;
			case 2: toPos.x=xItem.posX-item.width; break;
			case 3: toPos.x=xItem.posX+xItem.width-item.width; break;
		}
		switch(yItemMode){
			case 0: toPos.y=yItem.posY; break;
			case 1: toPos.y=yItem.posY+yItem.height; break;
			case 2: toPos.y=yItem.posY-item.height; break;
			case 3: toPos.y=yItem.posY+yItem.height-item.height; break;
		}
	}
	let resizeBefore=function(item,oldSize,siezScale,e,updateInfo){
		//自動貼齊
		if(updateInfo.wMode==='left'){
			let xItem,xItemMode;
			let xItemDist=fixMaxRange+1;
			for(let checkItem of g8v.itemList){
				if(checkItem===item || !checkItem.vw) continue;
				let distX=[
					Math.abs(updateInfo.posX-checkItem.posX),
					Math.abs(updateInfo.posX-checkItem.posX-checkItem.width)
				];
				let distXMin=Math.min.apply(Math,distX);
				if(distXMin<xItemDist){
					xItem=checkItem;
					xItemDist=distX;
					xItemMode=distX.indexOf(distXMin);
				}
			}
			if(xItemMode===0){
				updateInfo.width+=updateInfo.posX-xItem.posX;
				updateInfo.posX=xItem.posX;
			}else if(xItemMode===1){
				updateInfo.width+=updateInfo.posX-xItem.posX-xItem.width;
				updateInfo.posX=xItem.posX+xItem.width;
			}
		}else if(updateInfo.wMode==='right'){
			let xItem,xItemMode;
			let xItemDist=fixMaxRange+1;
			let xPCache=updateInfo.posX+updateInfo.width;
			for(let checkItem of g8v.itemList){
				if(checkItem===item || !checkItem.vw) continue;
				let distX=[
					Math.abs(xPCache-checkItem.posX),
					Math.abs(xPCache-checkItem.posX-checkItem.width)
				];
				let distXMin=Math.min.apply(Math,distX);
				if(distXMin<xItemDist){
					xItem=checkItem;
					xItemDist=distX;
					xItemMode=distX.indexOf(distXMin);
				}
			}
			if(xItemMode===0)
				updateInfo.width=xItem.posX-updateInfo.posX;
			else if(xItemMode===1)
				updateInfo.width=xItem.posX+xItem.width-updateInfo.posX;
		}
		if(updateInfo.hMode==='top'){
			let yItem,yItemMode;
			let yItemDist=fixMaxRange+1;
			for(let checkItem of g8v.itemList){
				if(checkItem===item || !checkItem.vw) continue;
				let distY=[
					Math.abs(updateInfo.posY-checkItem.posY),
					Math.abs(updateInfo.posY-checkItem.posY-checkItem.height)
				];
				let distYMin=Math.min.apply(Math,distY);
				if(distYMin<yItemDist){
					yItem=checkItem;
					yItemDist=distY;
					yItemMode=distY.indexOf(distYMin);
				}
			}
			if(yItemMode===0){
				updateInfo.height+=updateInfo.posY-yItem.posY;
				updateInfo.posY=yItem.posY;
			}else if(yItemMode===1){
				updateInfo.height+=updateInfo.posY-yItem.posY-yItem.height;
				updateInfo.posY=yItem.posY+yItem.height;
			}
		}else if(updateInfo.hMode==='bottom'){
			let yItem,yItemMode;
			let yItemDist=fixMaxRange+1;
			let yPCache=updateInfo.posY+updateInfo.height;
			for(let checkItem of g8v.itemList){
				if(checkItem===item || !checkItem.vw) continue;
				let distY=[
					Math.abs(yPCache-checkItem.posY),
					Math.abs(yPCache-checkItem.posY-checkItem.height)
				];
				let distYMin=Math.min.apply(Math,distY);
				if(distYMin<yItemDist){
					yItem=checkItem;
					yItemDist=distY;
					yItemMode=distY.indexOf(distYMin);
				}
			}
			if(yItemMode===0)
				updateInfo.height=yItem.posY-updateInfo.posY;
			else if(yItemMode===1)
				updateInfo.height=yItem.posY+yItem.height-updateInfo.posY;
		}
		if(e.shiftKey){//等比縮放
			if(updateInfo.wMode && updateInfo.hMode){
				let width=Math.floor(updateInfo.height*siezScale);
				let height=Math.floor(updateInfo.width/siezScale);
				let changeW=Math.abs(updateInfo.width-width);
				let changeH=Math.abs(updateInfo.height-height);
				if(updateInfo.wMode==='left' && changeW<changeH)
					updateInfo.posX+=updateInfo.width-width;
				if(updateInfo.hMode==='top' && changeW>=changeH)
					updateInfo.posY+=updateInfo.height-height;
				if(changeW<changeH)
					updateInfo.width=width;
				else
					updateInfo.height=height;
			}else if(updateInfo.wMode)
				updateInfo.height=Math.floor(updateInfo.width/siezScale);
			else if(updateInfo.hMode)
				updateInfo.width=Math.floor(updateInfo.height*siezScale);
		}else{//等比縮放中途取消的恢復步驟
			if(updateInfo.width!==oldSize.width && !updateInfo.wMode)
				updateInfo.width=oldSize.width;
			if(updateInfo.height!==oldSize.height && !updateInfo.hMode)
				updateInfo.height=oldSize.height;
		}
	}
	g8v.WindowItem.afterCreate.push(function(item){
		let oldSize;
		let siezScale;
		item.vw
			.on('dragBefore',(e,toPos) => dragBefore(item,e,toPos))
			.on('resizeStart',() => {
				oldSize={
					'width': item.vw.width,
					'height': item.vw.height
				}
				siezScale=item.vw.width/item.vw.height;
			})
			.on('resizeBefore',(e,updateInfo) => resizeBefore(item,oldSize,siezScale,e,updateInfo))
		;
	});
}
{//核心模組: 視窗溢位
	const minSize=30;//限制最小視窗邊長，防止用於攻擊
	let vwObj,select,browser;
	
	let getRange=function(){
		let result={
			'startX': 0,
			'startY': 0,
			'endX': 0,
			'endY': 0
		};
		for(let item of g8v.itemList){
			if(item.vw){
				result.startX=Math.min(result.startX,item.posX);
				result.startY=Math.min(result.startY,item.posY);
				result.endX=Math.max(item.posX+item.width,result.endX);
				result.endY=Math.max(item.posY+item.height,result.endY);
			}
		}
		return result;
	}
	let check=function(){
		let range=getRange();
		let iW=innerWidth;
		let iH=innerHeight;
		if(range.endX>iW || range.endY>iH){
			//推薦處理方法
			let width=range.endX-range.startX;
			let height=range.endY-range.startY;
			//瀏覽器過小，放大即可解決問題
			browser.style.display=(screen.width>=width && screen.height>=height)? '':'none';
			if(width<=iW && height<=iH){
				//自動搬移：實際區塊小於畫面大小
				select.value='move';
			}else if(height/width<iH/iW*1.2){
				//移動到可視範圍：單螢幕顯示多螢幕來源
				select.value='moveInDisplay';
			}else{
				//自動縮放：解析度問題，縮放處理
				select.value='resize';
			}
			vwObj.open().moveTo(
				Math.floor((iW-400)/2),
				Math.floor((iH-300)/2)
			).focus();
		}else{
			vwObj.close();
		}
	}
	let fixOverflow=function(action){
		switch(action){
			case 'move'://自動搬移
				{
					let range=getRange();
					let width=range.endX-range.startX;
					let height=range.endY-range.startY;
					if(width<=innerWidth && height<=innerHeight){
						let x=range.startX-((innerWidth-width)/2);
						let y=range.startY-((innerHeight-height)/2);
						for(let item of g8v.itemList)
							item.vw && item.vw.moveTo(item.posX-x,item.posY-y);
					}
				}
			break;
			case 'moveInDisplay'://移動到可視範圍
				{
					let nextPosX=30;
					let nextPosY=30;
					for(let item of g8v.itemList){
						if(!item.vw) continue;
						//30為拖拉條區塊約略高度，100為視窗功能區塊寬度
						if(
							item.posX+30>innerWidth || item.posX+item.width<100 ||
							item.posY+30>innerHeight || item.posY<-15
						){
							item.vw.moveTo(nextPosX,nextPosY).focus();
							if(nextPosY+130<=innerHeight){
								nextPosY+=100;
							}else{
								nextPosX+=200;
								nextPosY=30;
							}
						}
					}
				}
			break;
			case 'resize'://自動縮放
				{
					let range=getRange();
					let resize=Math.min(innerWidth/range.endX,innerHeight/range.endY);
					for(let item of g8v.itemList){
						if(!item.vw) return;
						item.vw.moveTo(
							Math.floor(item.posX*resize),
							Math.floor(item.posY*resize)
						).resize(
							Math.floor(item.width*resize),
							Math.floor(item.height*resize)
						);
					}
				}
			break;
			case 'notthing': break;
			default:
				return;
		}
		vwObj.close();
	}
	
	g8v.loading('fixWindowOverflow');
	g8v.WindowItem.afterCreate.push(function(item){
		if(item.width<minSize) item.width=minSize;
		if(item.height<minSize) item.height=minSize;
		item.vw
			.on('resize',() => {
				if(item.width<minSize) item.width=minSize;
				if(item.height<minSize) item.height=minSize;
			})
			.on('resizeBefore',(e,updateInfo) => {
				if(updateInfo.width<minSize){
					if(updateInfo.wMode==='left')
						updateInfo.posX+=updateInfo.width-minSize;
					updateInfo.width=minSize;
				}
				if(updateInfo.height<minSize){
					if(updateInfo.hMode==='top')
						updateInfo.posY+=updateInfo.height-minSize;
					updateInfo.height=minSize;
				}
			})
			.on('resizeEnd',check)
			.on('dragEnd',check)
			.on('open',check)
		;
	});
	window.addEventListener('load',function(){
		vwObj=new VirtualWindow($('overflow_confirm'),0,0,400,300).close();
		document.querySelector('#overflow_confirm .vw_hide')
			.addEventListener('mousedown',(e) => e.stopPropagation())
		;
		select=$('overflow_action');
		browser=$('overflow_browser');
		$('overflow_do').addEventListener('click',() => fixOverflow(select.value));
		window.addEventListener('resize',check);
		g8v.loaded('fixWindowOverflow');
	});
}
{//核心模組: 分享
	let shareUrlEle=$.tag('input',{'type':'input','readOnly':true});
	
	let mountEvent=function(item){
		item
			.on('append',updateShareUrl)
			.on('delete',updateShareUrl)
			.on('updateShareUrl',updateShareUrl)
		;
		updateShareUrl();
	}
	let mountWindowEvent=function(item){
		let keepUpdate=true;
		let stopUpdate=function(){
			keepUpdate=false;
		}
		let resumeUpdate=function(){
			keepUpdate=true;
			updateShareUrl();
		}
		item
			.on('title',updateShareUrl)
		.vw
			.on('move',() => keepUpdate && updateShareUrl())
			.on('resize',() => keepUpdate && updateShareUrl())
			.on('dragStart',stopUpdate)
			.on('dragEnd',resumeUpdate)
			.on('resizeStart',stopUpdate)
			.on('resizeEnd',resumeUpdate)
		;
		updateShareUrl();
	}
	let updateShareUrl=function(){
		let url=location.protocol+'//'+location.host+location.pathname+'#';
		let sp='';
		for(let item of g8v.itemList){
			url+=sp+item.module+'='+item.args.map(encodeURIComponent).join('|');
			if(item.vw)
				url+='|'+encodeURIComponent(item.title)+'|'+item.posX+'|'+item.posY+'|'+item.width+'|'+item.height;
			for(let append of item.append)
				url+='+'+append.module+'='+append.args.map(encodeURIComponent).join('|');
			sp='&';
		}
		shareUrlEle.value=url;
		location.replace(url);
	}
	let shortShareUrl=function(e){
		let url=shareUrlEle.value;
		shareUrlEle.value='縮短中...';
		e.target.disabled=true;
		new Ajax('POST','http://g8v-a0000778.rhcloud.com/urlShorten',{
			'url': url
		}).on('load',function(){
			e.target.disabled=false;
			if(Math.floor(this.xhr.status/200)!==1)
				alert('網址縮短失敗！');
			else
				shareUrlEle.value=this.result();
		}).send();
	}
	
	g8v.loading('shareUrl');
	g8v.AppendItem.afterCreate.push(mountEvent);
	g8v.ContentItem.afterCreate.push(mountEvent);
	g8v.WindowItem.afterCreate.push(mountWindowEvent);
	shareUrlEle.addEventListener('click',function(){this.select();});
	g8v.onLoad('g8v',function(){
		let control=$.tag('li',{
			'className':'ion-share',
			'title':'分享'
		});
		control.$add('div')
			.$add(shareUrlEle,undefined,true)
			.$add('button',{'className':'ion-ios-color-wand-outline','title':'縮短'})
			.addEventListener('click',shortShareUrl)
		;
		g8v.addControlBottom(control);
		g8v.loaded('shareUrl');
	});
	g8v.onLoad(() => {
		if(location.hash.length>1){
			let loadItem=location.hash.slice(1).split('&');
			for(let itemInfo of loadItem){
				itemInfo=itemInfo.split('+');
				let itemInfoMain=itemInfo.shift().split('=');
				let item;
				if(g8v.module.has(itemInfoMain[0])){
					item=g8v.module.get(itemInfoMain[0]).load.apply(undefined,
						itemInfoMain[1].split('|').map(decodeURIComponent)
					);
				}else{
					console.error('模組 %s 不存在',itemInfoMain[0]);
					continue;
				}
				if(!item) continue;
				for(let itemInfoAppend of itemInfo){
					itemInfoAppend=itemInfoAppend.split('=');
					if(g8v.module.has(itemInfoAppend[0])){
						g8v.module.get(itemInfoAppend[0]).append(
							item,
							itemInfoAppend[1].split('|').map(decodeURIComponent)
						);
					}else{
						console.error('模組 %s 不存在',itemInfoAppend[0]);
						continue;
					}
				}
			}
		}else{
			g8v.module.get('iframe').load('https://g0v.hackpad.com/ep/pad/static/JBDd9hvDt5f','使用說明',307,0,500,400);
			updateShareUrl();
		}
	});
}