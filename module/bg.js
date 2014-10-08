(function(){
	var bgObj;
	var bgStaticLayer=$().$add('div',{
		'style': {
			'display': 'none',
			'position': 'absolute',
			'top': '0px',
			'left': '0px',
			'bottom': '0px',
			'right': '0px',
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
			'style':{
				'backgroundColor': '#F00',
				'borderRadius': '100%',
				'borderColor': '#000',
				'borderWidth': '2px',
				'borderStyle': 'solid',
				'width': '5px',
				'height': '5px'
			}
		}).$add('div',{
			'className': 'name',
			'style': {
				'position': 'relative',
				'top': '10px',
				'left': '-50%',
				'fontSize': '10px',
				'whiteSpace': 'nowrap',
				'display': 'table-cell'
			}
		},null,true);
		var bgMapLayer=$().$add('div',{
			'style': {
				'display': 'none',
				'position': 'absolute',
				'top': '0px',
				'left': '0px',
				'bottom': '0px',
				'right': '0px',
				'zIndex': g8v.bgLayer++
			}
		});
		var mapView=new ol.View({
			center: transform(0,0),
			zoom: 1
		});
		var map=new ol.Map({
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
				map.updateSize();
				//socket=new WebSocket('ws://g8v-a0000778.rhcloud.com:8000/'+data,'mapPoint');
				tryConnect++;
				socket=new WebSocket('ws://192.168.1.123:10080/'+code,'mapPoint');
				socket.addEventListener('message',ev_message);
				socket.addEventListener('open',ev_open);
				socket.addEventListener('close',ev_close);
				//bg.mapMark('=====立法院=====',121.52007,25.0438);
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
					'module': mark.mod,
					'args': mark.args
				}));
		};
		bg.mapUnMark=function(name){
			var mark=markList['p_'+name];
			if(!mark) return;
			map.removeOverlay(mark.layer);
			mark=bgMapMarkList['p_'+name]=undefined;
			delete mark,bgMapMarkList['p_'+name];
			if(!formServer)
				bgMapSocket.send(JSON.stringify({
					'action': 'delete',
					'name': name
				}));
		};
	})();
	
	var controlForm=$.tag('form',{'textContent':'設定背景：'});
	var inputBgData=controlForm.$add('input',{'type':'input','placeholder':'圖片、RGB、標記地圖'});
	controlForm.$add('input',{'type':'submit','value':'設定'});
	controlForm.addEventListener('submit',function(e){
		e.preventDefault();
		bg.load(inputBgData.value);
	});
	g8v.module.config.addItem(controlForm);
	
	g8v.module.bg=bg;
})();