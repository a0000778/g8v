(function(){
	var chat={
		'source': {
			'livehouse': function(path){
				var id=path.match(/^channel\/([a-zA-Z0-9_-]+)/);
				var record=path.indexOf('/record/');
				if(record===-1)
					return $.tag('iframe',{
						'src': 'https://livehouse.in/embed/channel/'+(id? id[1]:''),
						'allowfullscreen': 'true',
						'style': {
							'width': '100%',
							'height': '100%'
						}
					});
				else
					return $.tag('iframe',{
						'src': 'data:text/html,尚不支援記錄！',
						'style': {
							'width': '100%',
							'height': '100%'
						}
					});
			},
			'twitch': function(path){
				var id=path.match(/^([a-zA-Z0-9_-]+)/);
				return $.tag('iframe',{
					'src': 'http://www.twitch.tv/'+id[1]+'/chat',
					'allowfullscreen': 'true',
					'style': {
						'width': '100%',
						'height': '100%'
					}
				});
			},
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
				var checkIdOnly=path.match(/^(channel\/)?(\d+)/);
				if(checkIdOnly){
					tag.src='http://www.ustream.tv/socialstream/'+checkIdOnly[2]+'?siteMode=1?activeTab=socialStream&hideVideoTab=1&colorScheme=light&v=6';
					return tag;
				}
				new Ajax('POST','http://g8v-a0000778.rhcloud.com/getSourceId',{
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
				title? title:source,
				left? left:0,
				top? top:0,
				width? width:400,
				height? height:600
			);
			g8v.createWindow(obj,title,this.source[source](path));
			g8v.updateShareUrl();
			return obj;
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