(function(){
	var video={
		'source': {
			'ustream': function(path){
				if(path.indexOf('recorded')===0){
					return $.tag('iframe',{
						'src': 'http://www.ustream.tv/embed/recorded/'+path.match(/^recorded\/(\d+)/)[1]+'?v=3&wmode=direct&autoplay=1',
						'style': {
							'width': '100%',
							'height': '100%'
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
					tag.src='http://www.ustream.tv/embed/'+checkIdOnly[2]+'?v=3&wmode=direct&autoplay=1';
					return tag;
				}
				new Ajax('POST','http://g8v-a0000778.rhcloud.com/getSourceId',{
					'source': 'ustream',
					'path': path.match(/^(channel\/)?([-+_~.\d\w]|%[a-fA-F\d]{2})+/)[0]
				}).on('load',function(){
					tag.src=this.result()? 'http://www.ustream.tv/embed/'+this.result()+'?v=3&wmode=direct&autoplay=1':'data:text/html,Load Failed.';
				}).on('error',function(){
					tag.src='data:text/html,Loading...Fail'
				}).send();
				return tag;
			},
			'youtube': function(path){
				var id=path.match(/(\?|&)v=([a-zA-Z0-9_-]+)/);
				var list=path.match(/(\?|&)list=([a-zA-Z0-9_-]+)/);
				return $.tag('iframe',{
					'src': 'http://www.youtube.com/embed/'+(id? id[2]:'')+(list? '?list='+list[2]:''),
					'allowfullscreen': 'true',
					'style': {
						'width': '100%',
						'height': '100%'
					}
				})
			}
		},
		'load': function(source,path,title,left,top,width,height){
			if(!this.source[source]) return false;
			var obj=g8v.createObj(
				'video',
				[source,path],
				title,
				left? left:0,
				top? top:0,
				width? width:800,
				height? height:600
			);
			g8v.createWindow(obj,title,this.source[source](path));
			g8v.updateShareUrl();
		}
	};
	var form=$.tag('form')
		.$add(document.createTextNode('新增畫面：'),null,true)
		.$add('input',{'type':'input','name':'url','placeholder':'輸入直播瀏覽頁網址'},null,true)
		.$add('input',{'type':'submit','value':'新增'},null,true)
	;
	form.addEventListener('submit',function(e){
		e.preventDefault();
		var url=e.target.querySelector('[name=url]').value.match(/^(http(s)?:\/\/)?([a-zA-Z0-9-]+\.)?([a-zA-Z0-9-]+)(\.[a-zA-Z0-9-]+)+\/(.+)/);
		e.target.querySelector('[name=url]').value='';
		if(video.load(url[4],url[6],url[4])===false) alert('網址格式錯誤或不支援的格式！');
	});
	g8v.module.config.addItem(form);
	g8v.module.video=video;
})();