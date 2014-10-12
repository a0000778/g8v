(function(){
	var iframe={
		'load': function(url,title,left,top,width,height){
			var obj=g8v.createObj(
				'iframe',
				[url],
				title? title:'頁面',
				left? left:0,
				top? top:0,
				width? width:400,
				height? height:600
			);
			g8v.createWindow(obj,title,$.tag('iframe',{
				'src': url,
				'style': {
					'width': '100%',
					'height': '100%',
					'background': '#FFF'
				}
			}));
			g8v.updateShareUrl();
			return obj;
		}
	};
	var form=$.tag('form')
		.$add(document.createTextNode('新增頁面：'),null,true)
		.$add('input',{'type':'input','name':'url','placeholder':'輸入目標頁面網址'},null,true)
		.$add('input',{'type':'submit','value':'新增'},null,true)
	;
	form.addEventListener('submit',function(e){
		e.preventDefault();
		var url=e.target.querySelector('[name=url]');
		if(iframe.load(url.value)===false) alert('網址格式錯誤或不支援的格式！');
		url.value='';
	});
	g8v.module.config.addItem(form);
	g8v.module.iframe=iframe;
})();