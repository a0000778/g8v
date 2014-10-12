(function(){
	var appendData={
		'module': 'bigScreen',
		'args': [0,0,800,600]
	}
	var nowObj=null;
	var windowObj=$().$add('div',{
		'className': 'window'
	});
	windowObj.$add('div',{'className':'vw_bar','textContent':'大畫面'});
	windowObj.$add('div',{'className':'vw_option'})
		.$add('span',{'className':'vw_hide','textContent':'X'})
	;
	var VW=new VirtualWindow(windowObj,0,0,800,600)
		.close()
		.on('close',function(){
			VW.content.innerHTML='';
		})
		.on('move',function(){
			appendData.args[0]=this.posX;
			appendData.args[1]=this.posY;
			g8v.updateShareUrl();
		})
		.on('resize',function(){
			appendData.args[2]=this.width;
			appendData.args[3]=this.height;
			g8v.updateShareUrl();
		})
	;
	VW.content=VW.obj.$add('div',{
		'style': {
			'width': '100%',
			'height': '100%'
		}
	});
	g8v.windowOption.push(function(obj){
		return $.tag('span',{
			'textContent': '大',
			'addEventListener': ['click',function(){
				bigScreen.append(obj);
			}]
		});
	});
	var bigScreen=g8v.module.bigScreen={
		'append': function(obj,left,top,width,height){
			if(nowObj)
				nowObj.append.splice(nowObj.append.indexOf(appendData),1);
			nowObj=obj;
			left=left!==undefined? left:appendData.args[0];
			top=top!==undefined? top:appendData.args[1];
			width=width!==undefined? width:appendData.args[2];
			height=height!==undefined? height:appendData.args[3];
			nowObj.append.push(appendData);
			VW.content.innerHTML='';
			VW.content.$add(nowObj.vw.obj.children[2].cloneNode(true));
			VW.open().moveTo(left,top).resize(width,height).toTop();
			g8v.updateShareUrl();
		}
	}
})();