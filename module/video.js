'use strict';
/*
	G8V Video Module by a0000778
	MIT License
*/
{
	let source=new Map();
	
	g8v.loading('video');
	g8v.module.set('video',{
		'source': source,
		'load': load,
		'loadData': loadData
	});
	g8v.onLoad('sourceList',() => g8v.module.get('sourceList').sourceIcon.set('video','ion-social-youtube'));
	g8v.onLoad('g8v',() => {
		let inputEle=$.tag('input',{'type':'input','name':'url','placeholder':'直播、串流網址...'});
		let form=$.tag('form')
			.$add(inputEle,undefined,true)
			.$add('button',{'type':'submit','className':'ion-android-add','title':'新增'},undefined,true)
		;
		form.addEventListener('submit',function(e){
			e.preventDefault();
			if(loadData(inputEle.value)===false) alert('網址格式錯誤或不支援的格式！');
			form.reset();
		});
		let control=$.tag('li',{
			'className':'ion-social-youtube',
			'title':'新增畫面'
		});
		control.$add(form,undefined,true);
		g8v.addControlTop(control);
		g8v.loaded('video');
	});
	
	function load(sourceName,data,title,left,top,width,height){
		let content;
		if(!sourceName){
			for(let sourceLoad of source){
				if(content=sourceLoad[1](data)){
					sourceName=sourceLoad[0];
					break;
				}
			}
			if(!content) return false;
		}else if(source.has(sourceName) && (content=source.get(sourceName)(data,true))){
		}else{
			console.error('[video] 不支援的來源類型: %s',sourceName);
			return false;
		}
		let item=new g8v.WindowItem(
			'video',
			[sourceName,data],
			title? title:sourceName,
			content,
			left? left:0,
			top? top:0,
			width? width:800,
			height? height:600
		);
		return item;
	}
	function loadData(data){
		return load(undefined,data);
	}
}
g8v.module.get('video').source
	.set('livehouse',function(url,unCheckDomain){
		//let data=url.match(/^(https?:\/\/livehouse\.in\/)?channel\/([a-zA-Z0-9_-]+)(?:\/records\/([a-zA-Z0-9_-]{20}))$/);
		let data=url.match(/^(https?:\/\/livehouse\.in\/)?channel\/([a-zA-Z0-9_-]+)$/);
		if(!data || !(data[1] || unCheckDomain)) return false;
		return $.tag('iframe',{
			'src': 'https://livehouse.in/embed/channel/'+data[2]+'/video',
			'allowfullscreen': 'true',
			'style': {
				'width': '100%',
				'height': '100%'
			}
		});
	})
	.set('twitch',function(url,unCheckDomain){
		let data=url.match(/^(http:\/\/(?:www\.)?twitch\.tv\/)?([a-zA-Z0-9_-]+)(?:\/[bc]\/(\d+))/);
		if(!data || !(data[1] || unCheckDomain)) return false;
		if(data[3]){
			let content=$.tag('object',{
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
	})
	.set('ustream',function(url,unCheckDomain){
		let data=url.match(/^(https?:\/\/(?:www.)?ustream.tv\/)?((?:(channel|recorded)\/)?((?:[-+_~.\d\w]|%[a-fA-F\d]{2})+))/);
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
		let tag=$.tag('iframe',{
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
	})
	.set('youtube',function(url,unCheckDomain){
		if(!(unCheckDomain || /^https?:\/\/(?:www.)?youtube.com\/(watch|playlist|c)/.test(url))) return false;
		let id=url.match(/(?:\?|&)v=([a-zA-Z0-9_-]+)(?:&|#|$)/);
		let list=url.match(/(?:\?|&)list=([a-zA-Z0-9_-]+)(?:&|#|$)/);
		let c=url.match(/\/(c\/[a-zA-Z0-9_-]+\/live)(?:\/|\?|#|$)/);
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
			let tag=$.tag('iframe',{
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
	})
;
{
	const protocolList=['http','https','ftp','rtmp'];
	const typeList={
		'flv': 'video/x-flv',
		'mkv': 'video/x-matroska',
		'mp4': 'video/mp4',
		'mov': 'video/mp4',
		'ogv': 'video/ogg',
		'webm': 'video/webm',
		'3gpp': 'video/3gpp',
		'm3u8': 'application/x-mpegurl'
	};
	let video=$.tag('video');
	function getType(url){
		let ext=url.match(/^.+\.([a-zA-Z0-9]+)(?:$|\?(?:.+)?)/);
		let type=ext && typeList[ext[1]];
		let protocol=url.substring(0,url.indexOf('://'));
		if(!protocol || protocolList.indexOf(protocol.toLowerCase())===-1) return null;
		if(protocol=='rtmp')
			return (type && type.replace('video/','rtmp/')) || 'rtmp';
		return type;
	}
	g8v.module.get('video').source.set('url',function(url){
		let type=getType(url);
		let ele
		if(video.canPlayType(type)=='probably'){
			ele=$.tag('video',{
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
			let args={
				'src': url,
				'autoPlay': true,
				'plugin_hls': 'plugin/flashls/flashlsOSMF.swf'
			};
			let argsArray=[];
			for(var key in args)
				argsArray.push(encodeURIComponent(key)+'='+encodeURIComponent(args[key]));
			ele=$.tag('object',{
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
		}else
			return false;
		return ele;
	});
}