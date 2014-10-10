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
		var titleObj=windowObj.$add('div',{'className': 'vw_bar'}).$add(document.createTextNode(title? title:obj.title));
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
		obj.vw=vw;
		vw=undefined;
		delete vw;
		return obj.vw;
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
	
	/* Fix Overflow Window */
	g8v.fixOverflow=(function(){
		var vw=new VirtualWindow($('overflow_confirm'),0,0,400,300).close();
		var select=$('overflow_action');
		var browser=$('overflow_browser');
		var getRange=function(){
			return g8v.objList.reduce(function(result,obj){
				if(obj.width && obj.height && obj.posX!=undefined && obj.posY!=undefined){
					if(result.startX>obj.posX) result.startX=obj.posX;
					if(result.startY>obj.posY) result.startY=obj.posY;
					var endX=obj.posX+obj.width;
					var endY=obj.posY+obj.height;
					if(result.endX<endX) result.endX=endX;
					if(result.endY<endY) result.endY=endY;
				}
				return result;
			},{
				'startX': 0,
				'startY': 0,
				'endX': 0,
				'endY': 0
			});
		}
		var check=function(){
			var range=getRange();
			if(range.endX>innerWidth || range.endY>innerHeight){
				//推薦處理方法
				var width=range.endX-range.startX;
				var height=range.endY-range.startY;
				//瀏覽器過小，放大即可解決問題
				browser.style.display=(screen.width>=width && screen.height>=height)? '':'none';
				if(width<=innerWidth && height<=innerHeight){
					//自動搬移：實際區塊小於畫面大小
					select.value='move';
				}else if(height/width<innerHeight/innerWidth*1.2){
					//移動到可視範圍：單螢幕顯示多螢幕來源
					select.value='moveInDisplay';
				}else{
					//自動縮放：解析度問題，縮放處理
					select.value='resize';
				}
				vw.open().moveTo(
					Math.floor((innerWidth-400)/2),
					Math.floor((innerHeight-300)/2)
				).toTop();
			}else{
				vw.close();
			}
		}
		return function(action){
			if(!action){
				check();
				return;
			}
			switch(action){
				case 'move'://自動搬移
					var range=getRange();
					var width=range.endX-range.startX;
					var height=range.endY-range.startY;
					if(width<=innerWidth && height<=innerHeight){
						var x=range.startX-((innerWidth-width)/2);
						var y=range.startY-((innerHeight-height)/2);
						this.objList.forEach(function(obj){
							if(!obj.vw) return;
							obj.vw.moveTo(obj.posX-x,obj.posY-y);
						});
						delete x,y;
					}
					delete range,width,height;
				break;
				case 'moveInDisplay'://移動到可視範圍
					var nextPosX=30;
					var nextPosY=30;
					this.objList.forEach(function(obj){
						if(!obj.vw) return;
						//30為拖拉條區塊約略高度，100為視窗功能區塊寬度
						if(
							obj.posX+30>innerWidth || obj.posX+obj.width<100 ||
							obj.posY+30>innerHeight || obj.posY<-15
						){
							obj.vw.moveTo(nextPosX,nextPosY).toTop();
							if(nextPosY+130<=innerHeight){
								nextPosY+=100;
							}else{
								nextPosX+=200;
								nextPosY=30;
							}
						}
					});
					delete nextPosX,nextPosY;
				break;
				case 'resize'://自動縮放
					var range=getRange();
					var resizeX=innerWidth/range.endX;
					var resizeY=innerHeight/range.endY;
					var resize=(resizeX<=resizeY)? resizeX:resizeY;
					this.objList.forEach(function(obj){
						if(!obj.vw) return;
						obj.vw.moveTo(
							Math.floor(obj.posX*resize),
							Math.floor(obj.posY*resize)
						);
						obj.vw.resize(
							Math.floor(obj.width*resize),
							Math.floor(obj.height*resize)
						);
					});
					delete resizeX,resizeY,resize,range;
				break;
			}
			vw.close();
		};
	})();
	$('overflow_do').addEventListener('click',function(){
		g8v.fixOverflow($('overflow_action').value);
	});
	addEventListener('resize',function(){ g8v.fixOverflow(); });
	
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
		g8v.fixOverflow();
	});
});