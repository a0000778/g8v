/***************************************
taskStep v0.2 by a0000778
MIT License
非同步工作步驟
***************************************/
function taskStep(callback){
	this.taskReturn=[];
	this.taskCount=0;
	this.taskEnd=0;
	this.callbackFunc=callback? callback:null;
}
taskStep.prototype.spawnCallback=function(id){
	var taskReturn=this.taskReturn;
	var me=this;
	this.taskCount++;
	if(id != undefined)
		taskReturn[id]=null;
	else
		var id=taskReturn.push(null)-1;
	return function(){
		taskReturn[id]=arguments;
		me.taskEnd++;
		me.checkDone();
	}
}
taskStep.prototype.callback=function(callback){
	this.callbackFunc=callback;
	return callback;
}
taskStep.prototype.checkDone=function(){
	if(!this.taskCount) return;
	if(this.taskCount<=this.taskEnd)
		this.callbackFunc(this.taskReturn);
}
