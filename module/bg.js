(function(){
	function transform(x,y){
		return ol.proj.transform((y!=undefined)? [parseFloat(x,10),parseFloat(y,10)]:[parseFloat(x[0],10),parseFloat(x[1],10)],'EPSG:4326','EPSG:900913');
	}
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
	var bgMapLayer=$().$add('div',{
		'style': {
			'position': 'absolute',
			'top': '0px',
			'left': '0px',
			'bottom': '0px',
			'right': '0px',
			'zIndex': g8v.bgLayer++
		}
	});
	var bgMap,bgMapView,bgMapMarkSource,bgMapMarkImage,bgMapMarkList,bgMapSocket;
	
	
	var bg={
		'load': function(data){
			var mapArgs;
			if(bgMapSocket){
				bgMapSocket.close();
				bgMapSocket=undefined;
			}
			if(/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/.test(data)){//RGB Color
				bgStaticLayer.style.display='';
				bgMapLayer.style.display='none';
				bgStaticLayer.style.background=data;
			}else if(/^http(s)?:\/\//.test(data)){//img
				bgStaticLayer.style.display='';
				bgMapLayer.style.display='none';
				bgStaticLayer.style.background='url('+data+')';
			}else if(/^\w+$/.test(data)){//OSM
				if(!window.WebSocket){
					alert('你的瀏覽器過舊，不支援背景地圖功能，請更換或更新瀏覽器');
					return;
				}
				bgStaticLayer.style.display='none';
				bgMapLayer.style.display='';
				if(!bgMap){//Map init
					bgMapView=new ol.View({
						center: transform(0,0),
						zoom: 1
					});
					bgMapMarkSource=new ol.source.Vector();
					bgMapMarkList={};
					bgMapMarkImage=new ol.style.Icon({
						anchor: [0.5, 1],
						anchorXUnits: 'fraction',
						anchorYUnits: 'fraction',
						src: 'module/bg_map_pos.png'
					});
					this.mapMarkMove('=====立法院=====',121.52007,25.0438);
					bgMap=new ol.Map({
						'target': bgMapLayer,
						'layers': [
							new ol.layer.Tile({source: new ol.source.OSM()}),
							new ol.layer.Vector({'source': bgMapMarkSource})
						],
						'view': bgMapView
					});
				}else{
					alert('不支援的項目');
					return;
				}
				bgMapSocket=new WebSocket('ws://g8v-a0000778.rhcloud.com:8000/'+data,'mapPoint');
				bgMapSocket.addEventListener('error',function(err){
					console.error('[bgMap] Error: %s',err.toString());
					
				});
				bgMapSocket.addEventListener('message',function(msg){
					msg=JSON.parse(msg);
					switch(msg.action){
						case 'move':
							bg.mapMarkMove(msg.name,msg.pos,msg.module,msg.args,true);
						break;
						case 'delete':
							bg.mapMarkDelete(msg.name,true);
						break;
						default:
							console.error('[bgMap] 不支援的操作 %s,msg=%s',msg.action,JSON.stringify(msg));
					}
				});
				bgMapSocket.addEventListener('close',function(msg){
					bgMapSocket=undefined;
				});
				//bg.mapMoveTo(mapArgs[7],mapArgs[5],mapArgs[4]);
				bg.mapMoveTo(121.5215,25.0439,17)
			}
			if(!bgObj) g8v.createObj('bg',bgObj=[]);
			bgObj[0]=data;
		},
		'mapMoveTo': function(x,y,z){
			if(z!=null)
				bgMapView.setZoom(parseInt(z));
			if(x!=null && y!=null)
				bgMapView.setCenter(transform(x,y));
		},
		'mapMarkMove': function(name,x,y,mod,args,formServer){
			var mark=bgMapMarkList['p_'+name];
			if(!mark){
				var obj=new ol.Feature();
				obj.setStyle(new ol.style.Style({
					'image': bgMapMarkImage,
					'text': new ol.style.Text({
						'font': '12px 文泉驛微米黑, 黑體-繁, 新細明體',
						'text': name,
						'textAlign': 'center',
						'offsetY': 15,
						'fill': new ol.style.Fill({'color': '#000'})
					})
				}));
				obj.on('click',function(){
					console.log('click');
				});
				bgMapMarkSource.addFeature(obj);
				mark=bgMapMarkList['p_'+name]={
					'name': name,
					'pos': [x,y],
					'module': mod || '',
					'args': args || [],
					'obj': obj
				};
			}
			if(x!=null && y!=null){
				mark.pos=[x,y];
				mark.obj.setGeometry(new ol.geom.Point(transform(x,y)));
			}
			if(mod && args){
				mark.module=mod;
				mark.args=args;
			}
			if(!formServer)
				bgMapSocket.send(JSON.stringify({
					'action': 'move',
					'name': name,
					'pos': mark.pos,
					'module': mark.mod,
					'args': mark.args
				}));
		},
		'mapMarkDelete': function(name,formServer){
			var mark=bgMapMarkList['p_'+name];
			if(!mark) return;
			bgMapMarkSource.removeFeature(mark.obj);
			mark=bgMapMarkList['p_'+name]=undefined;
			delete mark,bgMapMarkList['p_'+name];
			if(!formServer)
				bgMapSocket.send(JSON.stringify({
					'action': 'delete',
					'name': name
				}));
		}
	};
	
	var controlForm=$.tag('form',{'textContent':'設定背景：'});
	var inputBgData=controlForm.$add('input',{'type':'input','placeholder':'圖片、RGB、OSM'});
	controlForm.$add('input',{'type':'submit'});
	controlForm.addEventListener('submit',function(e){
		e.preventDefault();
		bg.load(inputBgData.value);
	});
	g8v.module.config.addItem(controlForm);
	
	g8v.module.bg=bg;
})();