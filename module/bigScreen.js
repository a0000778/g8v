(function(){
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
	});
	VW.content=VW.obj.$add('div',{
		'style': {
			'width': '100%',
			'height': '100%'
		}
	});
	g8v.windowOption.push(function(){
		return $.tag('span',{
			'textContent': '大',
			'addEventListener': ['click',function(e){
				VW.content.innerHTML='';
				VW.content.$add(e.target.parentNode.parentNode.children[2].cloneNode(true));
				VW.open();
				VW.toTop();
			}]
		});
	});
	g8v.module.bigScreen={
		'load': function(){
			
		}
	}
})();