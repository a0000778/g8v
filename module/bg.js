(function(){
	function transform(x,y){
		return ol.proj.transform([parseFloat(x,10),parseFloat(y,10)],'EPSG:4326','EPSG:900913');
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
	var bgMap,bgMapView;
	
	var controlForm=$.tag('form',{'textContent':'設定背景：'});
	var inputBgData=controlForm.$add('input',{'type':'input','placeholder':'圖片、RGB、OSM'});
	controlForm.$add('input',{'type':'submit'});
	controlForm.addEventListener('submit',function(e){
		e.preventDefault();
		bg.load(inputBgData.value);
	});
	g8v.module.config.addItem(controlForm);
	
	var bg={
		'load': function(data){
			var mapArgs;
			if(/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/.test(data)){//RGB Color
				bgStaticLayer.style.display='';
				bgMapLayer.style.display='none';
				bgStaticLayer.style.background=data;
			}else if(mapArgs=data.match(/^(http(s)?:\/\/)?(www\.)?openstreetmap\.org\/#map=(\d+)\/(\d+(\.\d+)?)\/(\d+(\.\d+)?)/)){//OSM
				bgStaticLayer.style.display='none';
				bgMapLayer.style.display='';
				if(!bgMap){//Map init
					bgMapView=new ol.View({
						center: transform(0,0),
						zoom: 1
					});
					bgMap=new ol.Map({
						'target': bgMapLayer,
						'layers': [
							new ol.layer.Tile({source: new ol.source.OSM()})
						],
						'view': bgMapView
					});
					//bgMap.on('move',function(){
						//bgMap.getCenter();
					//});
				}
				bg.mapMoveTo(mapArgs[7],mapArgs[5],mapArgs[4]);
			}else{//img
				bgStaticLayer.style.display='';
				bgMapLayer.style.display='none';
				bgStaticLayer.style.background='url('+data+')';
			}
			if(!bgObj) g8v.createObj('bg',bgObj=[]);
			bgObj[0]=data;
		},
		'mapMoveTo': function(x,y,z){
			if(z!=null)
				bgMapView.setZoom(parseInt(z));
			if(x!=null && y!=null)
				bgMapView.setCenter(transform(x,y));
		}
	};
	g8v.module.bg=bg;
})();