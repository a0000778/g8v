(function(){
	var bgObj;
	var bgLayer=$().$add('div',{
		'style': {
			'position': 'absolute',
			'top': '0px',
			'left': '0px',
			'bottom': '0px',
			'right': '0px',
			'zIndex': g8v.bgLayer++
		}
	});
	
	var controlForm=$.tag('form',{'textContent':'設定背景：'});
	var inputBgData=controlForm.$add('input',{'type':'input','placeholder':'圖片、RGB、OSM'});
	controlForm.$add('input',{'type':'submit'});
	controlForm.addEventListener(function(){
		bg.load(inputBgData);
	});
	g8v.module.config.addItem(controlForm);
	
	var bg={
		'load': function(data){
			if(/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/.test(data)){//RGB Color
				bgLayer.style.background=data;
			}else if(/^(http(s)?:\/\/)?(www\.)?openstreetmap\.org\/#map=\d\/\d(\.\d)?\/\d(\.\d)?/.test(data)){//OSM
				
			}else{//img
				bgLayer.style.background='url('+data+')';
			}
			if(!bgObj) g8v.createObj('bg',bgObj=[]);
			bgObj[0]=data;
		}
	};
	g8v.module.bg=bg;
})();