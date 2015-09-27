'use strict';
/*
	G8V Iframe Module by a0000778
	MIT License
*/
{
	g8v.loading('iframe');
	g8v.module.set('iframe',{
		'load': load,
		'loadData': loadData
	});
	g8v.onLoad('sourceList',() => g8v.module.get('sourceList').sourceIcon.set('iframe','ion-document-text'));
	g8v.onLoad('g8v',function(){
		let inputEle=$.tag('input',{'type':'input','name':'url','placeholder':'輸入目標頁面網址'});
		let form=$.tag('form')
			.$add(inputEle,undefined,true)
			.$add('button',{'type':'submit','className':'ion-android-add','title':'新增'},undefined,true)
		;
		form.addEventListener('submit',function(e){
			e.preventDefault();
			loadData(inputEle.value);
			form.reset();
		});
		let control=$.tag('li',{
			'className':'ion-document-text',
			'title':'新增頁面'
		});
		control.$add(form,undefined,true);
		g8v.addControlTop(control);
		g8v.loaded('iframe');
	});
	
	function load(url,title,left,top,width,height){
		new g8v.WindowItem(
			'iframe',
			[url],
			title || 'iframe',
			$.tag('iframe',{
				'src': url,
				'style': {
					'width': '100%',
					'height': '100%',
					'background': '#FFF',
					'border': 0
				}
			}),
			left || 0,
			top || 0,
			width || 400,
			height || 600
		);
	}
	function loadData(data){
		load(data);
	}
}