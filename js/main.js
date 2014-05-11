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
		'youtube': function(path){
			var id=path.match(/(\?|&)v=([a-zA-Z0-9_-]+)/)[2];
			return $.tag('iframe',{
				'src': 'http://www.youtube.com/embed/'+id,
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
		'youtube': function(path){
			
		}
	},
	
	'_createWindow': function(obj,objId,title,content){
		$().$add('div',{
			'id': 'window_'+this.windowList.length,
			'className': 'window'
		}).$add('div',{
			'className': 'vw_bar',
			'textContent': title
		},null,true).$add('div',{
			'className': 'vw_close',
			'textContent': 'X'
		},null,true).$add(content);
		var vw=new VirtualWindow(
			'window_'+this.windowList.length,
			obj.value[4],
			obj.value[3],
			obj.value[5],
			obj.value[6]
		);
		vw.on('move',function(){
			obj.value[3]=this.posX;
			obj.value[4]=this.posY;
			g8v.updateShareUrl();
		});
		vw.on('resize',function(){
			obj.value[5]=this.width;
			obj.value[6]=this.height;
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
	'updateBackground': function(data){
		if(/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/){
			$().style.background=data;
		}else{
			$().style.background='url('+data+')';
		}
	},
	'updateShareUrl': function(){
		$('seting_url').value=location.href.substring(0,location.href.indexOf('#'))+'#'+this.objList.reduce(function(r,v){
			return r+(r.length? '&':'')+v.type+'='+v.value.reduce(function(r,v){
				return r+(r.length? ':':'')+v;
			},'');
		},'');
	}
};

addEventListener('load',function(){
	var settingWindow=new VirtualWindow('setting_window',0,0);
	settingWindow.close();
	$('setting').addEventListener('click',function(){
		settingWindow.open();
		settingWindow.toTop();
	});
	$('setting_createVideo').addEventListener('submit',function(e){
		e.preventDefault();
		var url=e.target.querySelector('[name=url]').value.match(/^(http(s)?:\/\/)?[a-zA-Z0-9-]*\.([a-zA-Z0-9-]+)(\.[a-zA-Z0-9-]+)+\/(.+)/);
		e.target.querySelector('[name=url]').value='';
		if(!g8v.createVideo(url[3],url[5],url[3])) alert('網址格式錯誤或不支援的格式！');
	});
	$('setting_createChat').addEventListener('submit',function(e){
		e.preventDefault();
		var url=e.target.querySelector('[name=url]').value.match(/^(http(s)?:\/\/)?[a-zA-Z0-9-]*\.([a-zA-Z0-9-]+)(\.[a-zA-Z0-9-]+)+\/.+)/);
		e.target.querySelector('[name=url]').value='';
		if(!g8v.createChat(url[3],url[5],url[3])) alert('網址格式錯誤或不支援的格式！');
	});
	//網址格式
	location.hash.substring(1,location.hash.length).split('&').reduce(function(r,v){
		var s=v.indexOf('=');
		r.push({
			'type': v.substring(0,s),
			'value': v.substring(s+1,v.length).split(':')
		});
		return r;
	},[]).forEach(function(data){
		switch(data.type){
			case 'video':
				if(!this.createVideo.apply(this,data.value)) alert('網址格式錯誤或不支援的格式！')
			break;
			case 'chat':
				if(!this.createChat.apply(this,data.value)) alert('網址格式錯誤或不支援的格式！');
			break;
		}
	},g8v);
});
addEventListener('hashchange',location.reload.bind(location));