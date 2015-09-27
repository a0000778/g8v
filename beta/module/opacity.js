'use strict';
/*
	G8V Opacity Module by a0000778
	MIT License
*/
{
	const levels=[1,0.7,0.4,0.1,0];
	const levelsReverse=levels.slice().reverse();
	
	g8v.loading('opacity');
	g8v.windowOption.push(function(item){
		let ele=$.tag('li',{
			'className': 'ion-contrast',
			'title': '視窗透明度'
		});
		ele.addEventListener('click',function(e){
			e.preventDefault();
			let opacityItem=getOpacityItem(item);
			let opacity;
			for(opacity of levels){
				if(opacityItem.opacity>opacity){
					opacityItem.opacity=opacity;
					break;
				}
			}
			if(opacity) return;
			else opacityItem.delete();
		});
		ele.addEventListener('contextmenu',function(e){
			e.preventDefault();
			let opacityItem=getOpacityItem(item);
			let opacity;
			for(opacity of levelsReverse){
				if(opacityItem.opacity<opacity){
					opacityItem.opacity=opacity;
					break;
				}
			}
			if(opacity!==1) return;
			else opacityItem.delete();
		});
		return ele;
	});
	g8v.module.set('opacity',{
		'append': function(item,args){
			new OpacityItem(item).opacity=args[0];
		}
	});
	g8v.loaded('opacity');
	
	function OpacityItem(item){
		g8v.AppendItem.call(this,'opacity',[1]);
		Object.defineProperty(this,'opacity',{
			'get': () => Number.parseFloat(this.contentItem.content.style.opacity),
			'set': (value) => {
				this.contentItem.content.style.opacity=this.args[0]=value;
				this.emit('updateShareUrl');
			}
		});
		
		this.append(item);
		this.opacity=1;
	}
	OpacityItem.prototype.__proto__=g8v.AppendItem.prototype;
	OpacityItem.prototype._delete=function(){
		this.opacity=1;
	}
	function getOpacityItem(item){
		let appendItem=item.findAppend('opacity');
		if(appendItem.length)
			return appendItem[0];
		return new OpacityItem(item);
	}
}