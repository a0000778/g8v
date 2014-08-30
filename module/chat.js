(function(){
	var chat={
		'source': {
			'ustream': function(path){
				if(!/^(channel\/)?([-+_~.\d\w]|%[a-fA-F\d]{2})+/.test(path)){
					return $.tag('iframe',{
						'src': 'data:text/html,not support',
						'style': {
							'width': '100%',
							'height': '100%',
							'background': '#FFF'
						}
					});
				}
				var tag=$.tag('iframe',{
					'src': 'data:text/html,Loading...',
					'style': {
						'width': '100%',
						'height': '100%',
						'background': '#FFF'
					}
				});
				new Ajax('POST','http://api.a0000778.idv.biz/g8v/getsourceid.php',{
					'source': 'ustream',
					'path': path.match(/^(channel\/)?([-+_~.\d\w]|%[a-fA-F\d]{2})+/)[0]
				}).on('load',function(){
					tag.src=this.result()? 'http://www.ustream.tv/socialstream/'+this.result()+'?siteMode=1?activeTab=socialStream&hideVideoTab=1&colorScheme=light&v=6':'data:text/html,Load Failed.';
				}).send();
				return tag;
			}
		},
		'load': function(source,path,title,left,top,width,height){
			if(!this.source[source]) return false;
			var obj=g8v.createObj(
				'chat',
				[source,path],
				title,
				left? left:0,
				top? top:0,
				width? width:400,
				height? height:600
			);
			g8v.createWindow(obj,title,this.source[source](path));
			g8v.updateShareUrl();
		}
	};
	var form=$.tag('form')
		.$add(document.createTextNode('新增聊天：'),null,true)
		.$add('input',{'type':'input','name':'url','placeholder':'輸入直播瀏覽頁網址'},null,true)
		.$add('input',{'type':'submit','value':'新增'},null,true)
	;
	form.addEventListener('submit',function(e){
		e.preventDefault();
		var url=e.target.querySelector('[name=url]').value.match(/^(http(s)?:\/\/)?([a-zA-Z0-9-]+\.)?([a-zA-Z0-9-]+)(\.[a-zA-Z0-9-]+)+\/(.+)/);
		e.target.querySelector('[name=url]').value='';
		if(chat.load(url[4],url[6],url[4])===false) alert('網址格式錯誤或不支援的格式！');
	});
	g8v.module.config.addItem(form);
	g8v.module.chat=chat;
})();