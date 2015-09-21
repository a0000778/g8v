'use strict';
/*
	G8V beta by a0000778
	MIT License
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
	});

	function AppendItem(module,args){
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
	function ContentItem(module,args){
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
	function WindowItem(module,args,title,content,posX,posY,width,height){
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
{//核心模組: 視窗溢位
	let vwObj,select,browser;
	
	g8v.WindowItem.afterCreate.push((item) => {
		item.vw.on('resizeEnd',check).on('dragEnd',check).on('open',check);
	});
	window.addEventListener('resize',check);
	window.addEventListener('load',function(){
		vwObj=new VirtualWindow($('overflow_confirm'),0,0,400,300).close();
		document.querySelector('#overflow_confirm .vw_hide')
			.addEventListener('mousedown',(e) => e.stopPropagation())
		;
		select=$('overflow_action');
		browser=$('overflow_browser');
		$('overflow_do').addEventListener('click',() => fixOverflow(select.value));
	});
	
	function getRange(){
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
	function check(){
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
	function fixOverflow(action){
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
}
{//核心模組: 分享
	let shareUrlEle=$.tag('input',{'type':'input','readOnly':true});
	
	g8v.AppendItem.afterCreate.push(mountEvent);
	g8v.ContentItem.afterCreate.push(mountEvent);
	g8v.WindowItem.afterCreate.push(mountWindowEvent);
	shareUrlEle.addEventListener('click',function(){this.select();});
	window.addEventListener('load',function(){
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
		}else
			updateShareUrl();
	});
	
	function mountEvent(item){
		item
			.on('append',updateShareUrl)
			.on('delete',updateShareUrl)
			.on('updateShareUrl',updateShareUrl)
		;
		updateShareUrl();
	}
	function mountWindowEvent(item){
		let keepUpdate=true;
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
		function stopUpdate(){
			keepUpdate=false;
		}
		function resumeUpdate(){
			keepUpdate=true;
			updateShareUrl();
		}
	}
	function updateShareUrl(){
		let url=location.protocol+'//'+location.pathname+'#';
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
	function shortShareUrl(e){
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
}