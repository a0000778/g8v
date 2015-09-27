'use strict';
/*
	G8V Chat Module for Firefox by a0000778
	MIT License
	* 解決不支援 block functions 問題
*/
{
	let source=new Map();
	
	let load=function(sourceName,data,title,left,top,width,height){
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
			console.error('[chat] 不支援的來源類型: %s',sourceName);
			return false;
		}
		let item=new g8v.WindowItem(
			'chat',
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
	let loadData=function(data){
		return load(undefined,data);
	}
	
	g8v.loading('chat');
	g8v.module.set('chat',{
		'source': source,
		'load': load,
		'loadData': loadData
	});
	g8v.onLoad('sourceList',() => g8v.module.get('sourceList').sourceIcon.set('chat','ion-ios-chatboxes'));
	g8v.onLoad('g8v',() => {
		let inputEle=$.tag('input',{'type':'input','name':'url','placeholder':'直播網址、IRC...'});
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
			'className':'ion-ios-chatboxes',
			'title':'新增聊天'
		});
		control.$add(form,undefined,true);
		g8v.addControlTop(control);
		g8v.loaded('chat');
	});
}
g8v.module.get('chat').source
	.set('irc',function(url){
		let data=url.match(/^irc(s)?:(?:\/\/?)?([^:\/]+)(?::(\d+))?(?:(?:\/)([^\?]*)(?:(?:\?)(.*))?)?$/);
		if(!data) return false;
		return $.tag('iframe',{
			'src': 'https://kiwiirc.com/client/'+encodeURIComponent(data[0])+'?nick=test_?',
			'style': {
				'width': '100%',
				'height': '100%',
				'background': '#FFF'
			}
		});
	})
	.set('livehouse',function(url,unCheckDomain){
		let data=url.match(/^(https?:\/\/livehouse\.in\/)?channel\/([a-zA-Z0-9_-]+)/);
		if(!data || !(data[1] || unCheckDomain)) return false;
		return $.tag('iframe',{
			'src': 'https://livehouse.in/embed/channel/'+data[2],
			'allowfullscreen': 'true',
			'style': {
				'width': '100%',
				'height': '100%'
			}
		});
	})
	.set('twitch',function(url,unCheckDomain){
		let data=url.match(/^(http:\/\/(?:www\.)?twitch\.tv\/)?([a-zA-Z0-9_-]+)/);
		if(!data || !(data[1] || unCheckDomain)) return false;
		return $.tag('iframe',{
			'src': 'http://www.twitch.tv/'+data[2]+'/chat',
			'allowfullscreen': 'true',
			'style': {
				'width': '100%',
				'height': '100%'
			}
		});
	})
	.set('ustream',function(url,unCheckDomain){
		let data=url.match(/^(https?:\/\/(?:www.)?ustream.tv\/)?((?:(channel|recorded)\/)?((?:[-+_~.\d\w]|%[a-fA-F\d]{2})+))/);
		if(!data || !(data[1] || unCheckDomain)) return false;
		let tag=$.tag('iframe',{
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
	})
;