'use strict';
/*
	G8V Source List Module by a0000778
	MIT License
*/
{
	let sourceIcon=new Map();
	
	g8v.loading('sourceList');
	g8v.module.set('sourceList',{
		'load': load,
		'loadData': loadData,
		'sourceIcon': sourceIcon
	});
	g8v.onLoad('g8v',function(){
		let inputEle=$.tag('input',{'type':'input','name':'code','placeholder':'輸入 EtherCalc 代碼'});
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
			'className':'ion-ios-list',
			'title':'新增頁面'
		});
		control.$add(form,undefined,true);
		g8v.addControlTop(control);
		g8v.loaded('sourceList');
	});
	
	function load(form,title,left,top,width,height){
		let content=$.tag('div',{
			'textContent': 'Loading...',
			'style': {
				'backgroundColor': '#FFF',
				'width': '100%',
				'height': '100%',
				'paddingTop': '25px',
				'overflowY': 'scroll'
			}
		});
		let vw=new g8v.WindowItem(
			'sourceList',
			[form],
			title || '來源清單',
			content,
			left || 0,
			top || 0,
			width || 400,
			height || 600
		);
		new Ajax('get','https://ethercalc.org/_/'+form+'/csv').on('load',function(){
			content.innerHTML='';
			content.$add(this.result().csvToArray({'rSep':'\n'}).reduce(function(r,i){
				if(i[0].charAt(0)=='#') return r;
				if(i[1]=='page') i[1]='iframe';//兼容舊版
				let mod=g8v.module.get(i[1]);
				if(!(mod && mod.loadData)) return r;
				//簡化變數
				let data=i[2];
				let li=$.tag('li',{'textContent':i[0]});
				li.addEventListener('click',function(){
					if(!mod.loadData(data)) alert('資料來源不被支援或格式有誤！');
				});
				return r.$add(li,null,true);
			},$.tag('ul')));
		}).send();
	}
	function loadData(data){
		load(data);
	}
}