(function(){
	var getAppendData=function(obj){
		var append=obj.append;
		var i=-1;
		var max=append.length
		while((++i)<max){
			if(append[i].module==='opacity')
				return append[i];
		}
		var opacityObj={'module': 'opacity','args':[1]}
		append.push(opacityObj);
		return opacityObj;
	}
	g8v.windowOption.push(function(obj){
		return $.tag('span',{
			'textContent': '透',
			'addEventListener': ['click',function(){
				var opacityData=getAppendData(obj);
				var opacity=opacityData.args[0];
				if(opacity>=1) obj.vw.obj.style.opacity=opacityData.args[0]=0.7;
				else if(opacity>=0.7) obj.vw.obj.style.opacity=opacityData.args[0]=0.4;
				else if(opacity>=0.4) obj.vw.obj.style.opacity=opacityData.args[0]=0.1;
				else{
					obj.vw.obj.style.opacity='1';
					obj.append.splice(obj.append.indexOf(opacityData),1);
				}
				g8v.updateShareUrl();
			}]
		});
	});
	g8v.module.opacity={
		'append': function(obj,value){
			value=parseFloat(value,10);
			getAppendData(obj).args[0]=value;
			obj.vw.obj.style.opacity=value;
			g8v.updateShareUrl();
		}
	}
})();