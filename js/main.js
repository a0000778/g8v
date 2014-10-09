var g8v={
	'objList': [],
	'module': {},
	'bgLayer': 0,
	'windowOption': [
		function(){
			return $.tag('span',{
				'className': 'vw_close',
				'textContent': 'X'
			});
		},
		function(obj){
			return $.tag('span',{
				'textContent': '標',
				'addEventListener': ['click',function(e){
					var newtitle=prompt('請輸入新標題',obj.title);
					if(newtitle===null) return;
					obj.title=newtitle;
					e.target.parentNode.parentNode.getElementsByClassName('vw_bar')[0].textContent=newtitle;
					g8v.updateShareUrl();
				}]
			});
		},
		function(){
			return $.tag('span',{
				'className': 'vw_opacity',
				'textContent': '透'
			});
		}
	],
	'loadModule': function(module,onload){
		if(onload) $().$add('script',{'src': 'module/'+module+'.js'}).addEventListener('load',onload);
		else $().$add('script',{'src': 'module/'+module+'.js'});
	},
	'createWindow': function(obj,title,content,option){
		var windowObj=$().$add('div',{
			'className': 'window'
		});
		var titleObj=windowObj.$add('div',{'className': 'vw_bar'}).$add(document.createTextNode(title));
		windowObj.$add(
			g8v.windowOption.reduceRight(
				function(r,f){
					return r.$add(f(obj),null,true);
				},
				$.tag('div',{
					'className': 'vw_option'
				})
			)
			,null,true
		).$add(content);
		var vw=new VirtualWindow(
			windowObj,
			obj.posX,
			obj.posY,
			obj.width,
			obj.height
		);
		vw.on('move',function(){
			obj.posX=this.posX;
			obj.posY=this.posY;
			g8v.updateShareUrl();
		});
		vw.on('resize',function(){
			obj.width=this.width;
			obj.height=this.height;
			g8v.updateShareUrl();
		});
		vw.on('close',function(){
			this.objList.splice(this.objList.indexOf(obj));
			g8v.updateShareUrl();
		}.bind(this));
		return vw;
	},
	'createObj': function(module,args,title,posX,posY,width,height){
		var data={
			'module': module,
			'args': args
		};
		if(title && width && height && posX!=undefined && posY!=undefined){
			data.title=title
			data.width=parseInt(width,10);
			data.height=parseInt(height,10);
			data.posX=parseInt(posX,10);
			data.posY=parseInt(posY,10);
		}
		this.objList.push(data);
		return data;
	},
	'updateShareUrl': function(){
		$('seting_url').value=location.origin+location.pathname+'#'+this.objList.reduce(function(r,v){
			return r+
				(r.length? '&':'')+v.module+'='+v.args.reduce(function(r,v){
					return r+(r.length? '|':'')+encodeURIComponent(v);
				},'')+
				(
					(v.title && v.width && v.height && v.posX!=undefined && v.posY!=undefined)?
					'|'+encodeURIComponent(v.title)+'|'+v.posX+'|'+v.posY+'|'+v.width+'|'+v.height:''
				);
		},'');
	}
};
addEventListener('load',function(){
	/* Module ConfigWindow */
	(function(){
		var configVW=$('setting_window');
		var configVWObj=new VirtualWindow(configVW,0,0,350).close();
		var addItemBefore=configVW.childNodes[4];
		$('setting').addEventListener('click',function(){
			configVWObj.open();
			if(configVW.scrollWidth)
				configVWObj.resize(
					Math.ceil(configVW.scrollWidth/10)*10+10,
					Math.ceil(configVW.scrollHeight/10)*10+10
				);
			configVWObj.toTop();
		});
		g8v.module.config={
			'window': configVWObj,
			'addItem': function(htmlObj){
				if(configVW.scrollWidth)
					configVWObj.resize(
						Math.ceil(configVW.scrollWidth/10)*10+10,
						Math.ceil(configVW.scrollHeight/10)*10+10
					);
				return configVW.$add(htmlObj,addItemBefore);
			}
		};
	})();
	$('seting_url').addEventListener('click',function(){this.select();});
	
	/* Load Module*/
	var loadStep=new taskStep();
	['video','chat','iframe','sourceList','bg','bigScreen'].forEach(function(module){
		this.loadModule(module,loadStep.spawnCallback());
	},g8v);
	
	/* Load data */
	loadStep.callback(function(){
		location.hash.length>1 && location.hash.substring(1,location.hash.length).split('&').reduce(function(r,v){
			var s=v.indexOf('=');
			r.push({
				'module': v.substring(0,s),
				'args': v.substring(s+1,v.length).split('|').reduce(function(r,v){
					r.push(decodeURIComponent(v));
					return r;
				},[])
			});
			return r;
		},[]).forEach(function(data){
			console.log('[load]module=%s,args=%s',data.module,data.args.toString())
			if(this.module[data.module])
				this.module[data.module].load.apply(this.module[data.module],data.args);
			else
				console.error('[load]module %s 不存在',data.module)
		},g8v);
	});
});