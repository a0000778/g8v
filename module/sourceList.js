(function(){
	var sourceList={
		'load': function(form,title,left,top,width,height){
			var obj=g8v.createObj(
				'sourceList',
				[form],
				title? title:'來源清單',
				left? left:0,
				top? top:0,
				width? width:400,
				height? height:600
			);
			var content=$.tag('div',{
				'textContent': 'Loading...',
				'style': {
					'backgroundColor': '#FFF',
					'width': '100%',
					'height': '100%',
					'paddingTop': '25px',
					'overflowY': 'scroll'
				}
			});
			new Ajax('get','https://ethercalc.org/_/'+form+'/csv').on('load',function(){
				content.innerHTML='';
				content.$add(this.result().csvToArray({'rSep':'\n'}).reduce(function(r,i){
					if(i[0].charAt(0)=='#') return r;
					if(i[1]=='page') i[1]='iframe';//兼容舊版
					var mod=g8v.module[i[1]];
					if(!(mod && mod.loadData)) return r;
					//簡化變數
					var data=i[2];
					var li=$.tag('li',{'textContent':i[0]});
					li.addEventListener('click',function(){
						if(!mod.loadData(data)) alert('資料來源不被支援或格式有誤！');
					});
					//清理變數
					i=undefined;
					delete i;
					return r.$add(li,null,true);
				},$.tag('ul')));
			}).send();
			g8v.createWindow(obj,title,content);
			g8v.updateShareUrl();
			return obj;
		},
		'loadData': function(data){
			return this.load(data);
		}
	};
	var form=$.tag('form')
		.$add(document.createTextNode('新增來源清單：'),null,true)
		.$add('input',{'type':'input','name':'code','placeholder':'輸入 EtherCalc 代碼'},null,true)
		.$add('input',{'type':'submit','value':'新增'},null,true)
	;
	form.addEventListener('submit',function(e){
		e.preventDefault();
		var code=e.target.querySelector('[name=code]');
		if(sourceList.loadData(code.value)===false) alert('網址格式錯誤或不支援的格式！');
		code.value='';
	});
	g8v.module.config.addItem(form);
	g8v.module.sourceList=sourceList;
})();