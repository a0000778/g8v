/*
全域函數庫 - DOM函式庫(片段) by a0000778
*/
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
HTMLElement.prototype.$replace=function(){
	var ele=('string'===typeof arguments[0]? $.tag(arguments.shift(),arguments.shift()):arguments.shift());
	this.parentNode.replaceChild(ele,this);
	return (arguments[0]? this.parentNode:this);
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

function randstr(len,type){
	var re='';
	var str='';
	var type=type? type:7;
	if(type &  1) str+='0123456789';
	if(type &  2) str+='abcdefghijklmnopqrstuvwxyz';
	if(type &  4) str+='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	if(type &  8) str+='`~!@#$%^&*()-=_+[]{};\':",.\\/<>?';
	if(type & 16) str+=' ';
	while(re.length<len)
		re+=str.charAt(Math.floor(Math.random()*str.length));
	return re;
}

function Ajax(method, url, data, option){
	this.xhr=new XMLHttpRequest();
	this.method=method.toUpperCase();
	this.url=url;
	this.data=data? data:null;
	var option=option? option:{};
	this.option={
		'async': option.hasOwnProperty('async')? option.async:true,
		'auth': option.hasOwnProperty('auth')? {
			'user': option.auth.hasOwnProperty('user')? option.auth.user:null,
			'pass': option.auth.hasOwnProperty('pass')? option.auth.pass:null
		}:{},
		'formData': option.hasOwnProperty('formData')? option.formData:true
	};
}
Ajax.prototype.setHeader=function(header,value){
	this.xhr.setRequestHeader(header,value);
	return this;
}
Ajax.prototype.on=function(eventName,func){
	this.xhr.addEventListener(eventName,func.bind(this));
	return this;
}
Ajax.prototype.send=function(){
	if(this.method=='GET' || !this.option.formData){
		var data='';
		var s='';
		for(k in this.data){
			if('object'==typeof this.data[k]){
				data+=s+this.data[k].reduce(function(r,v){
					r.r+=r.s+r.k+'='+encodeURIComponent(v);
					r.s='&';
				},{'r':'','s':'','k':k+'[]'}).r;
			}else{
				data+=s+k+'='+encodeURIComponent(this.data[k]);
			}
			s='&';
		}
	}else{
		var data=new FormData();
		for(k in this.data){
			if('object'==typeof this.data[k]){
				this.data[k].forEach(function(k,v){
					this.append(k+'[]',v);
				}.bind(data,k));
			}else{
				data.append(k,this.data[k]);
			}
		}
	}
	this.xhr.open(
		this.method,
		this.url+(this.method=='GET'? (this.url.indexOf('?')>=0? '&':'?')+data:''),
		this.option.async,
		this.option.auth.user,
		this.option.auth.pass
	);
	this.xhr.send(this.method=='GET'? null:data);
	return this;
}
Ajax.prototype.abort=function(){
	this.xhr.abort();
	return this;
}
Ajax.prototype.result=function(forceText){
	if(this.xhr.readyState!==4) return null;
	return forceText? this.xhr.responseText:this.xhr.response;
}
Ajax.prototype.resultHeader=function(select){
	if(this.xhr.readyState!==4) return null;
	if(select) return this.xhr.getResponseHeader(select);
	else return this.xhr.getAllResponseHeaders().split('\n').reduce(function(r,v){
		if(!v.length) return r;
		var s=v.indexOf(':');
		r[v.substring(0,s)]=v.substring(s+2,v.length);
		return r;
	},{});
}
function ajaxget(url,data){
	return new Ajax('GET',url,data,{'async': false}).send().result();
}
function ajaxpost(url,data){
	return new Ajax('POST',url,data,{'async': false}).send().result();
}