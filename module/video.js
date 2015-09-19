(function(){
	var video={
		'source': {
			'livehouse': function(url,unCheckDomain){
				//var data=url.match(/^(https?:\/\/livehouse\.in\/)?channel\/([a-zA-Z0-9_-]+)(?:\/records\/([a-zA-Z0-9_-]{20}))$/);
				var data=url.match(/^(https?:\/\/livehouse\.in\/)?channel\/([a-zA-Z0-9_-]+)$/);
				if(!data || !(data[1] || unCheckDomain)) return false;
				return $.tag('iframe',{
					'src': 'https://livehouse.in/embed/channel/'+data[2],
					'allowfullscreen': 'true',
					'style': {
						'width': '100%',
						'height': '100%'
					}
				});
			},
			'twitch': function(url,unCheckDomain){
				var data=url.match(/^(http:\/\/(?:www\.)?twitch\.tv\/)?([a-zA-Z0-9_-]+)(?:\/[bc]\/(\d+))/);
				if(!data || !(data[1] || unCheckDomain)) return false;
				if(data[3]){
					var content=$.tag('object',{
						'type': 'application/x-shockwave-flash',
						'data': 'http://www.twitch.tv/widgets/archive_embed_player.swf',
						'style': {
							'width': '100%',
							'height': '100%'
						}
					});
					content.innerHTML='\
						<param name="allowFullScreen" value="true">\
						<param name="allowScriptAccess" value="always">\
						<param name="allowNetworking" value="all">\
						<param name="movie" value="http://www.twitch.tv/widgets/archive_embed_player.swf">\
						<param name="flashvars" value="channel='+data[2]+'&amp;auto_play=true&amp;chapter_id='+data[3]+'">\
					';
					return content;
				}else{
					return $.tag('iframe',{
						'src': 'http://www.twitch.tv/'+data[2]+'/embed',
						'allowfullscreen': 'true',
						'style': {
							'width': '100%',
							'height': '100%'
						}
					});
				}
			},
			'ustream': function(url,unCheckDomain){
				var data=url.match(/^(https?:\/\/(?:www.)?ustream.tv\/)?((?:(channel|recorded)\/)?((?:[-+_~.\d\w]|%[a-fA-F\d]{2})+))/);
				if(!data || !(data[1] || unCheckDomain)) return false;
				if(data[3]==='recorded'){
					return $.tag('iframe',{
						'src': 'http://www.ustream.tv/embed/recorded/'+data[4]+'?v=3&wmode=direct&autoplay=1',
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
				if(data[3] && !Number.isNaN(parseInt(data[4],10))){
					tag.src='http://www.ustream.tv/embed/'+data[4]+'?v=3&wmode=direct&autoplay=1';
					return tag;
				}
				new Ajax('POST','http://g8v-a0000778.rhcloud.com/getSourceId',{
					'source': 'ustream',
					'path': data[2]
				}).on('load',function(){
					tag.src=this.result()? 'http://www.ustream.tv/embed/'+this.result()+'?v=3&wmode=direct&autoplay=1':'data:text/html,Load Failed.';
				}).on('error',function(){
					tag.src='data:text/html,Loading...Fail'
				}).send();
				return tag;
			},
			'youtube': function(url,unCheckDomain){
				if(!(unCheckDomain || /^https?:\/\/(?:www.)?youtube.com\/(watch|playlist|c)/.test(url))) return false;
				var id=url.match(/(?:\?|&)v=([a-zA-Z0-9_-]+)(?:&|#|$)/);
				var list=url.match(/(?:\?|&)list=([a-zA-Z0-9_-]+)(?:&|#|$)/);
				var c=url.match(/\/(c\/[a-zA-Z0-9_-]+\/live)(?:\/|\?|#|$)/);
				if(id || list){
					return $.tag('iframe',{
						'src': 'http://www.youtube.com/embed/'+(id? id[1]:'')+'?rel=0&showinfo=0&autoplay=1'+(list? '&list='+list[1]:''),
						'allowfullscreen': 'true',
						'style': {
							'width': '100%',
							'height': '100%'
						}
					});
				}else if(c){
					var tag=$.tag('iframe',{
						'src': 'data:text/html,Loading...',
						'style': {
							'width': '100%',
							'height': '100%',
							'background': '#FFF'
						}
					});
					new Ajax('POST','http://g8v-a0000778.rhcloud.com/getSourceId',{
						'source': 'youtube',
						'path': c[1]
					}).on('load',function(){
						tag.src=this.result()? 'http://www.youtube.com/embed/'+this.result()+'?rel=0&showinfo=0&autoplay=1':'data:text/html,Load Failed.';
					}).on('error',function(){
						tag.src='data:text/html,Loading...Fail'
					}).send();
					return tag;
				}else
					return false;
			},
			'url': (function(){
				var protocolList=['http','https','ftp','rtmp'];
				var typeList={
					'flv': 'video/x-flv',
					'mkv': 'video/x-matroska',
					'mp4': 'video/mp4',
					'mov': 'video/mp4',
					'ogv': 'video/ogg',
					'webm': 'video/webm',
					'3gpp': 'video/3gpp',
					'm3u8': 'application/x-mpegurl'
				};
				var video=$.tag('video');
				var getType=function(url){
					var ext=url.match(/^.+\.([a-zA-Z0-9]+)(?:$|\?(?:.+)?)/);
					type=ext && typeList[ext[1]];
					var protocol=url.substring(0,url.indexOf('://'));
					if(!protocol || protocolList.indexOf(protocol.toLowerCase())===-1) return null;
					if(protocol=='rtmp')
						return (type && type.replace('video/','rtmp/')) || 'rtmp';
					return type;
				}
				return function(url){
					var type=getType(url);
					if(video.canPlayType(type)=='probably'){
						var ele=$.tag('video',{
							'autoplay': true,
							'controls': true,
							'preload': 'auto',
							'style': {
								'backgroundColor': '#000',
								'width': '100%',
								'height': '100%'
							}
						});
						ele.$add('source',{'src': url});
					}else if(type){
						var args={
							'src': url,
							'autoPlay': true,
							'plugin_hls': 'plugin/flashls/flashlsOSMF.swf'
						};
						var argsArray=[];
						for(var key in args){
							argsArray.push(encodeURIComponent(key)+'='+encodeURIComponent(args[key]));
						}
						var ele=$.tag('object',{
							'type':'application/x-shockwave-flash',
							'data':'plugin/GrindPlayer.swf',
							'style': {
								'backgroundColor': '#000',
								'width': '100%',
								'height': '100%'
							}
						})
							.$add('param',{'name':'allowFullScreen','value':'true'},null,true)
							.$add('param',{'name':'wmode','value':'direct'},null,true)
							.$add('param',{'name':'flashvars','value':argsArray.join('&')},null,true)
						;
					}
					return ele;
				};
			})()
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
				'video',
				[source,data],
				title? title:source,
				left? left:0,
				top? top:0,
				width? width:800,
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
		.$add(document.createTextNode('新增畫面：'),null,true)
		.$add('input',{'type':'input','name':'url','placeholder':'直播、串流網址...'},null,true)
		.$add('input',{'type':'submit','value':'新增'},null,true)
	;
	form.addEventListener('submit',function(e){
		e.preventDefault();
		var url=e.target.querySelector('[name=url]').value;
		e.target.querySelector('[name=url]').value='';
		if(video.loadData(url)===false) alert('網址格式錯誤或不支援的格式！');
	});
	g8v.module.config.addItem(form);
	g8v.module.video=video;
})();