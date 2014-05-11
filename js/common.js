function $(select){
	return arguments.length? document.getElementById(select):document.body;
}
$.tag=function(tagname, conf){
	var ele=document.createElement(tagname);
	(function(obj,conf){
		for(var k in conf){
			if('function'===typeof obj[k]) obj[k].apply(obj,conf[k]);
			else if('object'===typeof conf[k]) arguments.callee(obj[k],conf[k]);
			else obj[k]=conf[k];
		}
	})(ele,conf);
	return ele;
}
HTMLElement.prototype.$add=function(){
	var at=0;
	var ele=('string'===typeof arguments[at])? $.tag(arguments[at++],arguments[at++]):arguments[at++];
	if(arguments[at]) this.insertBefore(ele,arguments[at]);
	else this.appendChild(ele);
	return (arguments[++at]? this:ele);
}
HTMLElement.prototype.$del=function (returnParent){
	this.parentNode.removeChild(this);
	return (returnParent? this.parentNode:this);
}
HTMLElement.prototype.$attr=function(key, value){
	if(key.charAt(0)!='-'){
		if(arguments.length==1) return this.getAttribute(key);
		else this.setAttribute(key, value);
	}else this.removeAttribute(key.substring(1,key.length));
	return this;
}

if(!HTMLCollection.prototype.forEach) HTMLCollection.prototype.forEach=Array.prototype.forEach;
if(!NamedNodeMap.prototype.forEach) NamedNodeMap.prototype.forEach=Array.prototype.forEach;
if(!NodeList.prototype.forEach) NodeList.prototype.forEach=Array.prototype.forEach;
