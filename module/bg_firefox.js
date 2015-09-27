'use strict';
/*
	G8V BG Module for Firefox by a0000778
	MIT License
	* 解決不支援 block functions 問題
*/
{
	let bgObj,bgStaticLayer;
	
	let BGItem=function(data){
		g8v.ContentItem.call(this,'bg',[data]);
		Object.defineProperty(this,'data',{
			'get': () => this.args[0]
		});
		
		if(!this.update(data)){
			this.delete();
			return false;
		}
	}
	BGItem.prototype.__proto__=g8v.ContentItem.prototype;
	BGItem.prototype._delete=function(){
		bgStaticLayer.style.display='none';
		bg.mapUnload();
	}
	BGItem.prototype.update=function(data){
		if(/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/.test(data)){//RGB Color
			bgStaticLayer.style.display='';
			bg.mapUnload();
			bgStaticLayer.style.background=data;
		}else if(/^http(s)?:\/\//.test(data)){//img
			bgStaticLayer.style.display='';
			bg.mapUnload();
			bgStaticLayer.style.background='url('+data+')';
		}else if(/^\w+$/.test(data)){//OSM
			bgStaticLayer.style.display='none';
			bg.mapLoad(data);
		}else return false;
		this.args[0]=data;
		this.emit('updateShareUrl');
		return true;
	}
	let load=function(data){
		if(!bgObj)
			return bgObj=new BGItem(data);
		else
			return bgObj.update(data);
	}
	let bg={
		'load': load,
		'loadData': load
	};
	
	g8v.loading('bg');
	g8v.module.set('bg',bg);
	g8v.onLoad('g8v',function(){
		bgStaticLayer=$().$add('div',{
			'className': 'mod_bg',
			'style': {
				'display': 'none',
				'zIndex': g8v.bgLayer++
			}
		});
		
		let inputEle=$.tag('input',{'type':'input','name':'data','placeholder':'圖片、RGB、標記地圖'});
		let form=$.tag('form')
			.$add(inputEle,undefined,true)
			.$add('button',{'type':'submit','className':'ion-android-done','title':'設定'},undefined,true)
		;
		form.addEventListener('submit',function(e){
			e.preventDefault();
			if(load(inputEle.value)===false) alert('格式錯誤或不支援的格式！');
			form.reset();
		});
		let control=$.tag('li',{
			'className':'ion-image',
			'title':'設定背景'
		});
		control.$add(form,undefined,true);
		g8v.addControlTop(control);
		g8v.loaded('bg');
	});
}
{//背景地圖
	if(!window.WebSocket){
		alert('你的瀏覽器過舊，不支援背景地圖功能，請更換或更新瀏覽器');
		throw new Error('你的瀏覽器過舊，不支援背景地圖功能，請更換或更新瀏覽器');
	}
	g8v.loading('bgMap');
	document.head.$add('link',{
		'type': 'text/css',
		'rel': 'stylesheet',
		'href': 'module/bg.css'
	});
	let socket,code;
	let mapUnload=function(){
		if(!code) return;
		socket.close();
		socket=undefined;
		for(let mark in markList){
			map.removeOverlay(mark[1].layer);
			mark[1].obj.$del();
		}
		markList.clear();
		bgMapLayer.style.display='none';
		code=null;
		mapAbortMark();
	};
	let mapMark=function(name,pos,mod,args,formServer){
		let mark=markList.get(name);
		if(!mark){
			let obj=markObj.cloneNode(true);
			obj.querySelector('.name').textContent=name;
			obj.addEventListener('click',function(){
				if(g8v.module.has(mark.module)){
					let mod=g8v.module.get(mark.module);
					mod.load.apply(mod,mark.args);
				}
			});
			obj.addEventListener('contextmenu',function(e){
				e.preventDefault();
				if(confirm('確定要刪除標記點 '+name+' ?')) mapUnMark(name);
			});
			mark={
				'name': name,
				'pos': pos,
				'module': mod || '',
				'args': args || [],
				'layer': new ol.Overlay({
					'position': transform(pos[0],pos[1]),
					'element': obj
				}),
				'obj': obj
			}
			markList.set(name,mark);
			map.addOverlay(mark.layer);
		}else{
			if(pos && pos.length===2){
				mark.pos=pos;
				mark.layer.setPosition(transform(pos[0],pos[1]))
			}
			if(mod && args){
				mark.module=mod;
				mark.args=args;
			}
		}
		if(!formServer)
			socket.send(JSON.stringify({
				'action': 'move',
				'name': name,
				'pos': mark.pos,
				'module': mark.module,
				'args': mark.args
			}));
	};
	let mapUnMark=function(name,formServer){
		let mark=markList.get(name);
		if(!mark) return;
		map.removeOverlay(mark.layer);
		markList.delete(name);
		if(!formServer)
			socket.send(JSON.stringify({
				'action': 'delete',
				'name': name
			}));
	};
	let mapStartMark=function(item){
		if(!code) return null;
		if(waitMark) return false;
		bgMapLayer.style.zIndex=bgMapLayerTopIndex;
		alert('請擊點欲標記的位址');
		waitMark=item;
		return true;
	};
	let mapAbortMark=function(){
		bgMapLayer.style.zIndex=bgMapLayerIndex;
		waitMark=false;
	};
	let transform=function(x,y){
		return ol.proj.transform(
			(y!=undefined)? 
				[Number.parseFloat(x,10),Number.parseFloat(y,10)]:
				[Number.parseFloat(x[0],10),Number.parseFloat(x[1],10)]
			,
			'EPSG:4326',
			'EPSG:900913'
		);
	};
	let bg=g8v.module.get('bg');
	let markList=new Map();
	let waitMark=false;
	let markObj=$.tag('div',{
		'className': 'mod_bg_mark'
	}).$add('div',{
		'className': 'name'
	},null,true);
	let bgMapLayerIndex=g8v.bgLayer++;
	let bgMapLayerTopIndex=g8v.topLayer++;
	let bgMapLayer=$.tag('div',{
		'className': 'mod_bg',
		'style': {
			'display': 'none',
			'zIndex': bgMapLayerIndex
		}
	});
	let mapView=new ol.View({
		center: transform(0,0),
		zoom: 1
	});
	let map=new ol.Map({
		'controls': ol.control.defaults({
			'attributionOptions': {
				'collapsible': false
			}
		}),
		'interactions': ol.interaction.defaults().extend([new ol.interaction.Select()]),
		'target': bgMapLayer,
		'layers': [new ol.layer.Tile({source: new ol.source.OSM()})],
		'view': mapView
	});
	bg.mapAbortMark=mapAbortMark;
	bg.mapStartMark=mapStartMark;
	bg.mapUnMark=mapUnMark;
	bg.mapMark=mapMark;
	bg.mapUnload=mapUnload;
	map.on('click',function(e){
		if(!waitMark) return;
		let name;
		while(!(name=prompt('請輸入標記點名稱：(輸入現存標記點名稱則表示更動該標記點)'))){
			if(name!==null) continue;
			bg.mapAbortMark();
			alert('取消標記');
			return;
		}
		if(markList.has(name) && !confirm('確定要更動標記點 '+name+' ?')) return;
		bg.mapMark(
			name,
			ol.proj.transform(e.coordinate,'EPSG:900913','EPSG:4326'),
			waitMark.module,
			waitMark.vw?
				waitMark.args.concat([waitMark.title,waitMark.posX,waitMark.posY,waitMark.width,waitMark.height]):
				waitMark.args
		);
		bg.mapAbortMark();
	});
	g8v.windowOption.push(function(item){
		return $.tag('li',{
			'className': 'ion-location',
			'title': '標記位址',
			'addEventListener': ['click',function(e){
				switch(mapStartMark(item)){
					case false: alert('其他項目正在標記中'); break;
					case null: alert('標記地點需搭配背景地圖使用！'); break;
				}
			}]
		});
	});
	window.addEventListener('load',() => {
		$().$add(bgMapLayer);
		g8v.loaded('bgMap');
	});
	{//bg.mapLoad()
		let tryConnect=0;
		let ev_message=function(e){
			console.log(e.data);
			let msg=JSON.parse(e.data);
			switch(msg.action){
				case 'move':
					mapMark(msg.name,msg.pos,msg.module,msg.args,true);
				break;
				case 'delete':
					mapUnMark(msg.name,true);
				break;
				case 'viewAll':
					let x=[];
					let y=[];
					for(let mark in markList.values()){
						x.push(mark.pos[0]);
						y.push(mark.pos[1]);
					}
					let min=transform(Math.min.apply(Math,x),Math.min.apply(Math,y));
					let max=transform(Math.max.apply(Math,x),Math.max.apply(Math,y));
					mapView.fitExtent([min[0],min[1],max[0],max[1]],map.getSize());
				break;
				default:
					console.error('[bgMap] 不支援的操作 %s,msg=%s',msg.action,JSON.stringify(msg));
			}
		}
		let ev_open=function(){
			tryConnect=0;
		}
		let ev_close=function(){
			if(!code) return;
			if(tryConnect>=3){
				console.log('[bgMap] 無法與伺服器連線，放棄連線');
				alert('背景地圖無法與伺服器連線，請檢查網路連線，或者目前伺服器發生異常');
				return;
			}
			if(tryConnect){
				console.log('[bgMap] 無法與伺服器連線，嘗試次數：%d',tryConnect);
				setTimeout(mapLoad,3000,code);
			}else{
				console.error('[bgMap] 失去連線，3 秒後重新連線');
				setTimeout(mapLoad,3000,code);
			}
		}
		let mapLoad=function(data){
			if(!/^\w+$/.test(data)) return false;
			mapUnload();
			code=data;
			bgMapLayer.style.display='';
			map.setSize([innerWidth,innerHeight]);
			tryConnect++;
			socket=new WebSocket('ws://g8v-a0000778.rhcloud.com:8000/'+code,'mapPoint');
			socket.addEventListener('message',ev_message);
			socket.addEventListener('open',ev_open);
			socket.addEventListener('close',ev_close);
		};
		bg.mapLoad=mapLoad;
	}
}