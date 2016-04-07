(function(){
	var chat={
		'source': {
			'irc': function(url){
				var data=url.match(/^irc(s)?:(?:\/\/?)?([^:\/]+)(?::(\d+))?(?:(?:\/)([^\?]*)(?:(?:\?)(.*))?)?$/);
				if(!data) return false;
				return $.tag('iframe',{
					'src': 'https://kiwiirc.com/client/'+encodeURIComponent(data[0])+'?nick=test_?',
					'style': {
						'width': '100%',
						'height': '100%',
						'background': '#FFF'
					}
				});
			},
			'livehouse': function(url,unCheckDomain){
				var data=url.match(/^(https?:\/\/livehouse\.in\/)?channel\/([a-zA-Z0-9_-]+)/);
				if(!data || !(data[1] || unCheckDomain)) return false;
				return $.tag('iframe',{
					'src': 'https://livehouse.in/channel/'+data[2]+'/chatroom',
					'allowfullscreen': 'true',
					'style': {
						'width': '100%',
						'height': '100%'
					}
				});
			},
			'twitch': function(url,unCheckDomain){
				var data=url.match(/^(http:\/\/(?:www\.)?twitch\.tv\/)?([a-zA-Z0-9_-]+)/);
				if(!data || !(data[1] || unCheckDomain)) return false;
				return $.tag('iframe',{
					'src': 'http://www.twitch.tv/'+data[2]+'/chat',
					'allowfullscreen': 'true',
					'style': {
						'width': '100%',
						'height': '100%'
					}
				});
			},
			'ustream': function(url,unCheckDomain){
				var data=url.match(/^(https?:\/\/(?:www.)?ustream.tv\/)?((?:(channel|recorded)\/)?((?:[-+_~.\d\w]|%[a-fA-F\d]{2})+))/);
				if(!data || !(data[1] || unCheckDomain)) return false;
				var tag=$.tag('iframe',{
					'src': 'data:text/html,Loading...',
					'style': {
						'width': '100%',
						'height': '100%',
						'background': '#FFF'
					}
				});
				if(data[3]==='channel' && !Number.isNaN(parseInt(data[4],10))){
					tag.src='http://www.ustream.tv/socialstream/'+data[4]+'?siteMode=1?activeTab=socialStream&hideVideoTab=1&colorScheme=light&v=6';
					return tag;
				}
				new Ajax('POST','http://g8v-a0000778.rhcloud.com/getSourceId',{
					'source': 'ustream',
					'path': data[2]
				}).on('load',function(){
					tag.src=this.result()? 'http://www.ustream.tv/socialstream/'+this.result()+'?siteMode=1?activeTab=socialStream&hideVideoTab=1&colorScheme=light&v=6':'data:text/html,Load Failed.';
				}).send();
				return tag;
			}
		},
		'load': function(source,data,title,left,top,width,height){
			var content;
			if(!source){
				for(source in this.source){
					if(content=this.source[source](data)) break;
				}
				if(!content) return false;
			}else if(!this.source[source]) return false;
			var obj=g8v.createObj(
				'chat',
				[source,data],
				title? title:source,
				left? left:0,
				top? top:0,
				width? width:400,
				height? height:600
			);
			g8v.createWindow(obj,title,content? content:this.source[source](data,true));
			g8v.updateShareUrl();
			return obj;
		},
		'loadData': function(data){
			return this.load(undefined,data);
		}
	};
	var form=$.tag('form')
		.$add(document.createTextNode('新增聊天：'),null,true)
		.$add('input',{'type':'input','name':'url','placeholder':'直播網址、IRC...'},null,true)
		.$add('input',{'type':'submit','value':'新增'},null,true)
	;
	form.addEventListener('submit',function(e){
		e.preventDefault();
		var url=e.target.querySelector('[name=url]').value;
		e.target.querySelector('[name=url]').value='';
		if(chat.loadData(url)===false) alert('網址格式錯誤或不支援的格式！');
	});
	g8v.module.config.addItem(form);
	g8v.module.chat=chat;
})();