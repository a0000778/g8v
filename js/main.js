var g8v={
	'windowList': [],
	'objList': [],
	'videoSource': {
		'justin': function(path){
			var id=path.match(/^[a-zA-Z0-9_-]+/)[0];
			var content=$.tag('object',{
				'type': 'application/x-shockwave-flash',
				'data': 'http://www.justin.tv/swflibs/JustinPlayer.swf?channel='+id,
				'style': {
					'width': '100%',
					'height': '100%'
				}
			});
			content.innerHTML='\
				<param name="allowFullScreen" value="true">\
				<param name="allowScriptAccess" value="always">\
				<param name="allowNetworking" value="all">\
				<param name="movie" value="http://www.justin.tv/swflibs/JustinPlayer.swf">\
				<param name="flashvars" value="hostname=www.justin.tv&amp;channel='+id+'&amp;auto_play=true&amp;start_volume=25">\
			';
			return content;
		},
		'livehouse': function(path){
			var id=path.match(/^channel\/([a-zA-Z0-9_-]+)/)[0];
			var content=$.tag('iframe',{'id':randstr(8,7),'src':'data:text/html,Loading...'});
			content.addEventListener('load',function(e){
				var id=e.target.id
				var player=jwplayer(id).setup({
					'playlist': [
						{
							'file':'http://wrtctw-rtcp-tw-1.livehouse.in/'+id+'/video/playlist.m3u8',
							'provider':'plugin/jwplayer_hls/HLSProvider6.swf',
							'type':'hls'
						}
					],
					'primary': 'flash',
					'autostart': true,
					'width': '100%',
					'height': '100%'
				})
				player.onReady(function(){
					$(id+'_wrapper').style.position='static';
				});
				player.onSetupError(function(){
					$(id+'_wrapper').$replace(document.createTextNode('Load Fail.'));
				})
			});
			return content;
		},
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
			new Ajax('POST','http://api.a0000778.idv.biz/g8v/getsourceid.php',{
				'source': 'ustream',
				'path': path.match(/^(channel\/)?[a-zA-Z0-9-]+/)[0]
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
	'chatSource': {
		'justin': function(path){
			var id=path.match(/^[a-zA-Z0-9_-]+/)[0];
			return $.tag('iframe',{
				'src': 'http://zh-tw.justin.tv/chat/embed?channel='+id+'&popout_chat=true',
				'style': {
					'width': '100%',
					'height': '100%'
				}
			})
		},
		'ustream': function(path){
			if(!/^(channel\/)?[a-zA-Z0-9-]+/.test(path)){
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
				'path': path.match(/^(channel\/)?[a-zA-Z0-9-]+/)[0]
			}).on('load',function(){
				tag.src=this.result()? 'http://www.ustream.tv/socialstream/'+this.result()+'?siteMode=1?activeTab=socialStream&hideVideoTab=1&colorScheme=light&v=6':'data:text/html,Load Failed.';
			}).send();
			return tag;
		},
		'youtube': function(path){
			
		}
	},
	
	'_createWindow': function(obj,objId,title,content){
		var titleObj=document.createTextNode(title);
		var optObj=$.tag('div',{
			'className': 'vw_option'
		});
		optObj.$add('span',{
			'className': 'vw_opacity',
			'textContent': '透'
		});
		optObj.$add('span',{
			'className': 'vw_title',
			'textContent': '標'
		}).addEventListener('click',function(e){
			obj.value[obj.value.length-5]=prompt('請輸入新標題',obj.value[obj.value.length-5]);
			titleObj.nodeValue=obj.value[obj.value.length-5];
			g8v.updateShareUrl();
		});
		optObj.$add('span',{
			'className': 'vw_close',
			'textContent': 'X'
		});
		var windowObj=$().$add('div',{
			'id': 'window_'+this.windowList.length,
			'className': 'window'
		});
		windowObj.$add('div',{'className': 'vw_bar'}).$add(titleObj);
		windowObj.$add(optObj,null,true).$add(content);
		var vw=new VirtualWindow(
			'window_'+this.windowList.length,
			obj.value[obj.value.length-4],
			obj.value[obj.value.length-3],
			obj.value[obj.value.length-2],
			obj.value[obj.value.length-1]
		);
		vw.on('move',function(){
			obj.value[obj.value.length-4]=this.posX;
			obj.value[obj.value.length-3]=this.posY;
			g8v.updateShareUrl();
		});
		vw.on('resize',function(){
			obj.value[obj.value.length-2]=this.width;
			obj.value[obj.value.length-1]=this.height;
			g8v.updateShareUrl();
		});
		vw.on('close',function(){
			this.objList.splice(objId);
		}.bind(this));
		this.windowList.push(vw);
		return vw;
	},
	'createVideo': function(form,path,title,left,top,width,height){
		if(!this.videoSource[form]) return false;
		var obj={
			'type': 'video',
			'value': [
				form,
				path,
				title,
				left? left:0,
				top? top:0,
				width? width:800,
				height? height:600
			]
		};
		this._createWindow(obj,this.objList.push(obj)-1,title,this.videoSource[form](path));
		this.updateShareUrl();
		return true;
	},
	'createChat': function(form,path,title,left,top,width,height){
		if(!this.chatSource[form]) return false;
		var obj={
			'type': 'chat',
			'value': [
				form,
				path,
				title,
				left? left:0,
				top? top:0,
				width? width:400,
				height? height:600
			]
		};
		this._createWindow(obj,this.objList.push(obj)-1,title,this.chatSource[form](path));
		this.updateShareUrl();
		return true;
	},
	'createIFrame': function(url,title,left,top,width,height){
		var obj={
			'type': 'iframe',
			'value': [
				url,
				title,
				left? left:0,
				top? top:0,
				width? width:400,
				height? height:600
			]
		};
		this._createWindow(obj,this.objList.push(obj)-1,title,$.tag('iframe',{
			'src': url,
			'style': {
				'width': '100%',
				'height': '100%',
				'background': '#FFF'
			}
		}));
		this.updateShareUrl();
	},
	'updateBackground': function(data){
		if(/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/.test(data)){
			$().style.background=data;
		}else{
			$().style.background='url('+data+')';
		}
		this.objList.push({
			'type': 'bg',
			'value': [data]
		});
		this.updateShareUrl();
	},
	'updateShareUrl': function(){
		$('seting_url').value=location.origin+location.pathname+'#'+this.objList.reduce(function(r,v){
			return r+(r.length? '&':'')+v.type+'='+v.value.reduce(function(r,v){
				return r+(r.length? '|':'')+encodeURIComponent(v);
			},'');
		},'');
	}
};

addEventListener('load',function(){
	var settingWindow=new VirtualWindow('setting_window',0,0,300);
	settingWindow.close();
	$('setting').addEventListener('click',function(){
		settingWindow.open();
		settingWindow.toTop();
	});
	$('setting_createVideo').addEventListener('submit',function(e){
		e.preventDefault();
		var url=e.target.querySelector('[name=url]').value.match(/^(http(s)?:\/\/)?([a-zA-Z0-9-]+\.)?([a-zA-Z0-9-]+)(\.[a-zA-Z0-9-]+)+\/(.+)/);
		e.target.querySelector('[name=url]').value='';
		if(!g8v.createVideo(url[4],url[6],url[4])) alert('網址格式錯誤或不支援的格式！');
	});
	$('setting_createChat').addEventListener('submit',function(e){
		e.preventDefault();
		var url=e.target.querySelector('[name=url]').value.match(/^(http(s)?:\/\/)?([a-zA-Z0-9-]+\.)?([a-zA-Z0-9-]+)(\.[a-zA-Z0-9-]+)+\/(.+)/);
		e.target.querySelector('[name=url]').value='';
		if(!g8v.createChat(url[4],url[6],url[4])) alert('網址格式錯誤或不支援的格式！');
	});
	$('setting_createIFrame').addEventListener('submit',function(e){
		e.preventDefault();
		g8v.createIFrame(e.target.querySelector('[name=url]').value,'頁面');
		e.target.querySelector('[name=url]').value='';
	});
	$('setting_updateBackground').addEventListener('submit',function(e){
		e.preventDefault();
		g8v.updateBackground(e.target.querySelector('[name=data]').value);
		e.target.querySelector('[name=data]').value='';
	});
	$('seting_url').addEventListener('click',function(){this.select();});
	//網址格式
	location.hash.substring(1,location.hash.length).split('&').reduce(function(r,v){
		var s=v.indexOf('=');
		r.push({
			'type': v.substring(0,s),
			'value': v.substring(s+1,v.length).split('|').reduce(function(r,v){
				r.push(decodeURIComponent(v));
				return r;
			},[])
		});
		return r;
	},[]).forEach(function(data){
		console.log('[load]type='+data.type+',value='+data.value.toString())
		switch(data.type){
			case 'video':
				if(!this.createVideo.apply(this,data.value)) alert('網址格式錯誤或不支援的格式！');
			break;
			case 'chat':
				if(!this.createChat.apply(this,data.value)) alert('網址格式錯誤或不支援的格式！');
			break;
			case 'iframe':
				this.createIFrame.apply(this,data.value);
			break;
			case 'bg':
				this.updateBackground.apply(this,data.value);
			break;
		}
	},g8v);
});
addEventListener('hashchange',location.reload.bind(location));