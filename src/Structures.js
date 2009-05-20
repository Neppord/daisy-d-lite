function Node(next){
	this.next=next;;
}
function BarekadeNode(){
	this.prototype=new Node();
}
function BockmarkNode(){
	this.prototype=new Node();
	this.name=name;
	this.note=note;
}
function WokerNode(){
  this.prototype=new Node();
}
function TextNode(text){
	this.prototype=new Node();
	this.text=text;
}
function AudioNode(src,start,stop){
	this.prototype=new Node();
	this.src=src;
	this.start=start;
	this.stop=stop;
}
function DBock(url){
	
}
