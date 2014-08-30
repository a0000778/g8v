(function(){
	var sourceList=function(form,title,left,top,width,height){
		var obj=g0v.createObj(
			'sourceList',
			[form],
			title,
			left? left:0,
			top? top:0,
			width? width:400,
			height? height:600
		);
		var content=$.tag('div',{
			'textContent': 'Loading...',
			'style': {
				'backgroundColor': '#FFF',
				'width': '100%',
				'height': '100%',
				'paddingTop': '25px'
			}
		});
		new Ajax('get','https://ethercalc.org/_/'+form+'/csv').on('load',function(){
			content.innerHTML='';
			content.$add(this.result().csvToArray({'rSep':'\n'}).reduce(function(r,i){
				if(i[0].charAt(0)=='#') return r;
				var li=$.tag('li',{'textContent':i[0]});
				switch(i[1]){
					case 'video':
						var url=i[2].match(/^(http(s)?:\/\/)?([a-zA-Z0-9-]+\.)?([a-zA-Z0-9-]+)(\.[a-zA-Z0-9-]+)+\/(.+)/);
						li.addEventListener('click',function(){
							if(!g8v.createVideo(url[4],url[6],url[4])) alert('網址格式錯誤或不支援的格式！');
						});
					break;
					case 'chat':
						var url=i[2].match(/^(http(s)?:\/\/)?([a-zA-Z0-9-]+\.)?([a-zA-Z0-9-]+)(\.[a-zA-Z0-9-]+)+\/(.+)/);
						li.addEventListener('click',function(){
							if(!g8v.createChat(url[4],url[6],url[4])) alert('網址格式錯誤或不支援的格式！');
						});
					break;
					case 'page':
						li.addEventListener('click',function(){
							g8v.createIFrame(i[2],'頁面');
						});
					break;
					default:
						return r;
				}
				return r.$add(li,null,true);
			},$.tag('ul')));
		}).send();
		g8v.createWindow(obj,title,content);
		g8v.updateShareUrl();
	};
	var form=$.tag('form')
		.$add(document.createTextNode('新增來源清單：'),null,true)
		.$add('input',{'type':'input','name':'code','placeholder':'輸入 EtherCalc 代碼'},null,true)
		.$add('input',{'type':'submit','value':'新增'},null,true)
	;
	form.addEventListener('submit',function(e){
		e.preventDefault();
		var code=e.target.querySelector('[name=code]');
		code.value='';
		if(sourceList.load(code)===false) alert('網址格式錯誤或不支援的格式！');
	});
	g8v.module.config.addItem(form);
	g8v.module.sourceList={
		'load': sourceList
	};
})();