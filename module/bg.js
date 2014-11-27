(function(){
	var bgObj;
	var bgStaticLayer=$().$add('div',{
		'className': 'mod_bg',
		'style': {
			'display': 'none',
			'zIndex': g8v.bgLayer++
		}
	});
	
	var bg={
		'load': function(data){
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
			}else return;
			if(!bgObj)
				bgObj=g8v.createObj('bg',[data]);
			else
				bgObj.args[0]=data;
			g8v.updateShareUrl();
		}
	};
	//bgMap
	(function(){
		if(!window.WebSocket){
			alert('你的瀏覽器過舊，不支援背景地圖功能，請更換或更新瀏覽器');
			return;
		}
		var transform=function(x,y){
			return ol.proj.transform((y!=undefined)? [parseFloat(x,10),parseFloat(y,10)]:[parseFloat(x[0],10),parseFloat(x[1],10)],'EPSG:4326','EPSG:900913');
		};
		var socket,code;
		var markList={};
		var markObj=$.tag('div',{
			'className': 'mod_bg_mark'
		}).$add('div',{
			'className': 'name'
		},null,true);
		var waitMark=false;
		var bgMapLayerIndex=g8v.bgLayer++;
		var bgMapLayer=$().$add('div',{
			'className': 'mod_bg',
			'style': {
				'display': 'none',
				'zIndex': bgMapLayerIndex
			}
		});
		var mapView=new ol.View({
			center: transform(0,0),
			zoom: 1
		});
		var map=new ol.Map({
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
		bg.mapLoad=(function(){
			var tryConnect=0;
			var ev_message=function(e){
				console.log(e.data);
				var msg=JSON.parse(e.data);
				switch(msg.action){
					case 'move':
						bg.mapMark(msg.name,msg.pos,msg.module,msg.args,true);
					break;
					case 'delete':
						bg.mapUnMark(msg.name,true);
					break;
					case 'viewAll':
						var x=[];
						var y=[];
						var name,pos;
						for(name in markList){
							pos=markList[name].pos;
							x.push(pos[0]);
							y.push(pos[1]);
						}
						var min=transform(Math.min.apply(Math,x),Math.min.apply(Math,y));
						var max=transform(Math.max.apply(Math,x),Math.max.apply(Math,y));
						mapView.fitExtent([min[0],min[1],max[0],max[1]],map.getSize());
					break;
					default:
						console.error('[bgMap] 不支援的操作 %s,msg=%s',msg.action,JSON.stringify(msg));
				}
			}
			var ev_open=function(){
				tryConnect=0;
			}
			var ev_close=function(){
				if(!code) return;
				if(tryConnect>=3){
					console.log('[bgMap] 無法與伺服器連線，放棄連線');
					alert('背景地圖無法與伺服器連線，請檢查網路連線，或者目前伺服器發生異常');
					return;
				}
				if(tryConnect){
					console.log('[bgMap] 無法與伺服器連線，嘗試次數：%d',tryConnect);
					setTimeout(bg.mapLoad,3000,code);
				}else{
					console.error('[bgMap] 失去連線，3 秒後重新連線');
					setTimeout(bg.mapLoad,3000,code);
				}
			}
			return function(data){
				if(!/^\w+$/.test(data)) return false;
				bg.mapUnload();
				code=data;
				bgMapLayer.style.display='';
				map.setSize([innerWidth,innerHeight]);
				tryConnect++;
				//socket=new WebSocket('ws://192.168.1.123:10080/'+code,'mapPoint');
				socket=new WebSocket('ws://g8v-a0000778.rhcloud.com:8000/'+code,'mapPoint');
				socket.addEventListener('message',ev_message);
				socket.addEventListener('open',ev_open);
				socket.addEventListener('close',ev_close);
			};
		})();
		bg.mapUnload=function(){
			if(!code) return;
			socket.close();
			socket=undefined;
			var k,o
			for(k in markList){
				o=markList[k];
				map.removeOverlay(o.layer);
				o.obj.$del();
				markList[k]=undefined;
				delete markList[k];
			}
			bgMapLayer.style.display='none';
			code=null;
			bg.mapAbortMark();
		};
		bg.mapMark=function(name,pos,mod,args,formServer){
			var mark=markList['p_'+name];
			if(!mark){
				var obj=markObj.cloneNode(true);
				obj.querySelector('.name').textContent=name;
				obj.addEventListener('click',function(){
					if(!(mark.module.length && g8v.module.hasOwnProperty(mark.module))) return;
					var mod=g8v.module[mark.module];
					mod.load.apply(mod,mark.args);
				});
				obj.addEventListener('contextmenu',function(e){
					e.preventDefault();
					if(confirm('確定要刪除標記點 '+name+' ?')) bg.mapUnMark(name);
				});
				mark=markList['p_'+name]={
					'name': name,
					'pos': pos,
					'module': mod || '',
					'args': args || [],
					'layer': new ol.Overlay({
						'position': transform(pos[0],pos[1]),
						'element': obj
					}),
					'obj': obj
				};
				map.addOverlay(mark.layer);
				obj=undefined;
				delete obj;
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
		bg.mapUnMark=function(name,formServer){
			var mark=markList['p_'+name];
			if(!mark) return;
			map.removeOverlay(mark.layer);
			mark=markList['p_'+name]=undefined;
			delete mark,markList['p_'+name];
			if(!formServer)
				socket.send(JSON.stringify({
					'action': 'delete',
					'name': name
				}));
		};
		bg.mapStartMark=function(obj){
			if(!code) return null;
			if(waitMark) return false;
			bgMapLayer.style.zIndex=2147483646;
			alert('請擊點欲標記的位址');
			waitMark=obj;
			return true;
		};
		bg.mapAbortMark=function(){
			bgMapLayer.style.zIndex=bgMapLayerIndex;
			waitMark=false;
		};
		g8v.windowOption.push(function(obj){
			return $.tag('li',{
				'className': 'ion-location',
				'addEventListener': ['click',function(e){
					switch(bg.mapStartMark(obj)){
						case false: alert('其他項目正在標記中'); break;
						case null: alert('標記地點需搭配背景地圖使用！'); break;
					}
				}]
			});
		});
		map.on('click',function(e){
			if(!waitMark) return;
			var name;
			while(!(name=prompt('請輸入標記點名稱：(輸入現存標記點名稱則表示更動該標記點)'))){
				if(name!==null) continue;
				bg.mapAbortMark();
				alert('取消標記');
				return;
			}
			if(markList['p_'+name] && !confirm('確定要更動標記點 '+name+' ?')) return;
			bg.mapMark(
				name,
				ol.proj.transform(e.coordinate,'EPSG:900913','EPSG:4326'),
				waitMark.module,
				(waitMark.title && waitMark.width && waitMark.height && waitMark.posX!=undefined && waitMark.posY!=undefined)?
					waitMark.args.concat([waitMark.title,waitMark.posX,waitMark.posY,waitMark.width,waitMark.height]):
					waitMark.args
			);
			bg.mapAbortMark();
		});
	})();
	
	var controlForm=$.tag('form',{'textContent':'設定背景：'});
	var inputBgData=controlForm.$add('input',{'type':'input','placeholder':'圖片、RGB、標記地圖'});
	controlForm.$add('input',{'type':'submit','value':'設定'});
	controlForm.addEventListener('submit',function(e){
		e.preventDefault();
		bg.load(inputBgData.value);
	});
	g8v.module.config.addItem(controlForm);
	
	document.head.$add('link',{
		'type': 'text/css',
		'rel': 'stylesheet',
		'href': (navigator.userAgent.indexOf('Firefox')!==-1)? 'module/bg_firefox.css':'module/bg.css'
	});
	g8v.module.bg=bg;
})();