//urls
if(!$){
	function $(){
		return document.getElementById.apply(document,arguments)
	}
}

if(!window.basePath)basePath="../media/";//sets but dossent over write
function loadConstants (){
	TEXTDISPLAY=document.getElementById("textDisplay");
	TOCDISPLAY=document.getElementById("tocDisplay")
	PROGRESSDISPLAY=document.getElementById("progressDisplay");
	PROGRESS=document.getElementById("progress");
	AUDIOPLAYER=document.getElementById("audioPlayer");
	TITLE=$("title");
	CREATOR=$("creator");
	TOTALTIME=$("totalTime");
	SPEED=$('speed');
	VOLUME=$('volume');
	initAudioElementCallbacks();

}

function initAudioElementCallbacks(){
	AUDIOPLAYER.addEventListener("timeupdate",function(){
		var node = playlist.currentNode;
		var end = Number(node.getAttribute("data-stop"));
		if(Number(AUDIOPLAYER.currentTime) >= Number(end)){
			skip();
		}
		//log("time:"+ AUDIOPLAYER.currentTime + " end:" + end);
	});
	AUDIOPLAYER.addEventListener("playing",function(){
		var node = playlist.currentNode;
		var start = Number(node.getAttribute("data-start"));
		AUDIOPLAYER.currentTime = start;
		AUDIOPLAYER.playbackRate = SPEED.value;

	});
}

//functions

function log(){
	//This Function is convinient for loging events to the console in fire bug and the element inspector
	window.console&& window.console.log.apply(window.console,arguments);
}
function getAjax(){
	//this Function is used so that we can extract the Ajax cretion for difernet brower from the app code
	return new XMLHttpRequest();
}
function loadSyncFile(src){
	var ajax=getAjax();
	ajax.open("GET",src,false);
	ajax.send(null);
	return ajax.responseText
}
function loadSyncDoc(src){
	var ajax=getAjax();
	ajax.open("GET",src,false);
	ajax.send(null);
	return ajax.responseXML || (new DOMParser()).parseFromString(ajax.responseText,"text/xml");
}
function gotoURL(){
	if(location.hash){
		load();
		loadID(/file=([^&]*)/(location.hash)[1],/id=([^&]*)/(location.hash)[1])
	}
}
function loadTOC(){
	var toc = document.createElement("ol");
	toc.setAttribute("data-level","base");
	var current = toc;
	var levels = ["h1","h2","h3","h4","h5","h6","span"];
	var doc = loadSyncDoc(basePath+"ncc.html");	
	if(!doc){
		alert("Error: the ncc.html file could not be found.");
	}
	//setting info field;
	var title=doc.querySelector("[name='dc:title']");
	if(title)TITLE.innerText=title.getAttribute("content");

	var creator=doc.querySelector("[name='dc:creator']");
	if(creator)CREATOR.innerText=creator.getAttribute("content");

	var time=doc.querySelector("[name='ncc:totalTime']");
	if(time)TOTALTIME.innerText=time.getAttribute("content");
	var walker = document.createTreeWalker(
			doc,
			NodeFilter.SHOW_ELEMENT,
			function (node){
				if(node.tagName=="a"){
					switch(node.parentNode.tagName){
						case "h1":return NodeFilter.FILTER_ACCEPT;break;
						case "h2":return NodeFilter.FILTER_ACCEPT;break;
						case "h3":return NodeFilter.FILTER_ACCEPT;break;
						case "h4":return NodeFilter.FILTER_ACCEPT;break;
						case "h5":return NodeFilter.FILTER_ACCEPT;break;
						case "h6":return NodeFilter.FILTER_ACCEPT;break;
						case "span":return NodeFilter.FILTER_ACCEPT;break;
					}
				}
				return NodeFilter.FILTER_SKIP;
			},
			false
			);
	function playThis(){
		play(this.getAttribute("data-file"),this.getAttribute("data-id"));
	}
	function hideSub(){
			togleHide(this.parentNode.getElementsByTagName("ol")[0]);
			this.src=((this.parentNode.getElementsByTagName("ol")[0].style.display=="none")?this.closed_src:this.open_src);
	}
	while(walker.nextNode()){
		while(levels.indexOf(current.getAttribute("data-level"))>=levels.indexOf(walker.currentNode.parentNode.tagName)){
			current=current.parentNode.parentNode;
		}
		var li=document.createElement("li");
		var ol=document.createElement("ol");
		var a=document.createElement("a");
		var img=document.createElement("img");
		img.onclick=hideSub;
		img.style.width="15px";
		img.style.height="15px";
		var src;
		img.open_src= src="Images/open.png";
		img.closed_src= src="Images/closed.png";
		img.src=img.open_src;
		li.appendChild(img);
		ol.setAttribute("data-level",walker.currentNode.parentNode.tagName);
		a.textContent=walker.currentNode.textContent;
		a.setAttribute("data-file",walker.currentNode.getAttribute("href").split("#")[0])
		a.setAttribute("data-id",walker.currentNode.getAttribute("href").split("#")[1])
		a.onclick=playThis;
		li.appendChild(a);
		li.appendChild(ol);
		img.onclick();
		current.appendChild(li);
		current=ol;
	}
	TOCDISPLAY.innerHTML="";
	TOCDISPLAY.appendChild(toc);
}
function loadSmil(){
	var toc=TOCDISPLAY.childNodes[0];
	walker=document.createTreeWalker(
			toc,
			NodeFilter.SHOW_ALL,
			function (node){
				if(node.hasAttribute && node.hasAttribute("data-file")){
					return NodeFilter.FILTER_ACCEPT;
				}
				return NodeFilter.FILTER_SKIP;
			},
			false
			);
	while(walker.nextNode()){
		log("starting with:"+walker.currentNode.getAttribute("data-file"));
		var doc= loadSyncDoc(basePath+walker.currentNode.getAttribute("data-file"));
		var w=document.createTreeWalker(
				doc,
				NodeFilter.SHOW_ALL,
				function (node){
					if(node.getAttribute && node.getAttribute("id") ||node.tagName=="audio" || node.tagName=="text"){
						return NodeFilter.FILTER_ACCEPT;
					}
					return NodeFilter.FILTER_SKIP;
				},
				false);
		var next=walker.nextNode();
		var child=false;
		next && walker.previousNode();
		if(walker.currentNode.nextSibling.contains){
			if(next && walker.currentNode.nextSibling.contains(next.parentNode)){
				child=true;
			}
		}else{
			if(next && walker.currentNode.nextSibling.innerHTML.indexOf(next.parentNode.innerHTML)){
				child=true;
			}
		}
		while(w.nextNode() && w.currentNode.getAttribute("id")!=walker.currentNode.getAttribute("data-id")){}
		do{
			if(next && w.currentNode.getAttribute("id")==next.getAttribute("data-id")){
				walker.nextNode();
				next=walker.nextNode();
				next && walker.previousNode();
				if(next && walker.currentNode.nextSibling.contains(next.parentNode)){
					child=true;
				}else{
					child=false;
				}
			}
			switch(w.currentNode.tagName){
				case "audio":{
					var li=document.createElement("li");
					li.setAttribute("data-type",w.currentNode.tagName);
					li.setAttribute("data-src",basePath+w.currentNode.getAttribute("src"));
					li.setAttribute("data-start",w.currentNode.getAttribute("clip-begin").split("npt=")[1].split("s")[0]);
					li.setAttribute("data-stop",w.currentNode.getAttribute("clip-end").split("npt=")[1].split("s")[0]);
					if(child){//FIXME: takes to much time checking for relation
						walker.currentNode.nextSibling.insertBefore(li,next.parentNode);
					}else{
						walker.currentNode.nextSibling.insertBefore(li);
					}
				};break
				case "text":{
					var li=document.createElement("li");
					li.setAttribute("data-type",w.currentNode.tagName);
					li.setAttribute("data-src",basePath+w.currentNode.getAttribute("src").split("#")[0])
					li.setAttribute("data-id",w.currentNode.getAttribute("src").split("#")[1])
					if(child){//FIXME: takes to much time checking for relation
						walker.currentNode.nextSibling.insertBefore(li,next.parentNode);
					}else{
						walker.currentNode.nextSibling.insertBefore(li);
					}
				};break
			}
		}while(w.nextNode())
	}
	window.playlist=document.createTreeWalker(TOCDISPLAY,NodeFilter.SHOW_ELEMENT,
			function (node){
				if(node.tagName.toLowerCase()=="li" && node.hasAttribute("data-type")){
					return NodeFilter.FILTER_ACCEPT;
				}
				else{
					return NodeFilter.FILTER_SKIP;
				}
			}
			,false);
	playlist.nextNode();
}
function incertText(){
	var list=TOCDISPLAY.querySelectorAll("[data-type=text]");
	var checkList=[];
	for(var i=0 ;i<list.length;i++){
		if(checkList.indexOf(list[i].getAttribute("data-src"))!=-1){
			continue;
		}
		checkList.push(list[i].getAttribute("data-src"));
		var doc=loadSyncDoc(list[i].getAttribute("data-src"));
		var miniList=TOCDISPLAY.querySelectorAll("[data-src='"+list[i].getAttribute("data-src")+"']");
		for(var p=0;p<miniList.length ;p++ ){
			//log(doc.getElementById(miniList[p].getAttribute("data-id")));
			miniList[p].innerText=doc.getElementById(miniList[p].getAttribute("data-id")).innerText;
		}
	}
}
function load(){
	loadTOC();
	if($("state")){$("state").setAttribute("title","play");}
	loadSmil();
	incertText();
}
function play(file,id){
	if($("state")){$("state").setAttribute("title","pause");}
	if (id==undefined && file==undefined){
		prevPlaylist()
		skip();
		return;
	}
	loadID(file,id);
}
function skip(){
	if(AUDIOPLAYER.timeOut)clearTimeout(AUDIOPLAYER.timeOut);
	AUDIOPLAYER.pause();
	nextPlaylist();
	while(playlist.currentNode.getAttribute("data-type")=="text"){
		loadText();
		nextPlaylist();
		loadAudio();
	}
	if (playlist.currentNode.getAttribute("data-type")=="audio"){
		loadAudio();
	}
	AUDIOPLAYER.play();
	AUDIOPLAYER.playbackRate=SPEED.value;
	var id=playlist.currentNode.parentElement.previousSibling.getAttribute("data-id");
	var file=playlist.currentNode.parentElement.previousSibling.getAttribute("data-file");
	location.hash="id="+id+"&file="+file;
}
function forward(){
	if($("level").innerText=="skip"){
		skip();
		return;
	}
	var l=["h1","h2","h3","h4","h5","h6","span"];
	var i=l.indexOf($("level").innerText);
	var w =document.createTreeWalker(TOCDISPLAY,
			NodeFilter.SHOW_ELEMENT,
			function(node){
				if(node.getAttribute("data-level")){
					return NodeFilter.FILTER_ACCEPT;
				}else{
					return NodeFilter.FILTER_SKIP;
				}
			},false);
	w.currentNode=playlist.currentNode;
	while(l.indexOf(w.nextNode().getAttribute("data-level"))>i){}
	setPlayList(w.currentNode);
	if($("state") && $("state").getAttribute("title")=="pause"){
		play();	
	}
	/*
	playlist.currentNode=w.currentNode;
	playlist.previousNode();
	skip();
	*/
}
function backward(){
	if($("level").innerText=="skip"){
		prevPlaylist();
		prevPlaylist();
		prevPlaylist();
		skip();
		return;
	}
	var l=["h1","h2","h3","h4","h5","h6","span"];
	var i=l.indexOf($("level").innerText);
	var w =document.createTreeWalker(TOCDISPLAY,
			NodeFilter.SHOW_ELEMENT,
			function(node){
				if(node.getAttribute("data-level")){
					return NodeFilter.FILTER_ACCEPT;
				}else{
					return NodeFilter.FILTER_SKIP;
				}
			},false);
	w.currentNode=playlist.currentNode;
	w.previousNode();
	while(l.indexOf(w.previousNode().getAttribute("data-level"))>i){}
	setPlayList(w.currentNode);
	if($("state") && $("state").getAttribute("title")=="pause"){
		play();	
	}
	/*
	playlist.currentNode=w.currentNode;
	playlist.previousNode();
	skip();
	*/
}
function up(){
	var l=["h1","h2","h3","h4","h5","h6","span","skip"];
	var i=l.indexOf($("level").innerText);
	if(i>0)i--;
	if(l[i]=='skip'){
		$("level").innerText=l[i];
		return
	}
	while(i>0 && !TOCDISPLAY.querySelector("[data-level="+l[i]+"]") ){
		i--;
	}
	$("level").innerText=l[i];
}
function down(){
	var l=["h1","h2","h3","h4","h5","h6","span","skip"];
	var i=l.indexOf($("level").innerText);
	if(i<(l.length-1))i++;
	if(l[i]=='skip'){
		$("level").innerText=l[i];
		return
	}
	while(i<(l.length-1) && !TOCDISPLAY.querySelector("[data-level="+l[i]+"]") ){
		i++;
	}
	$("level").innerText=l[i];

}
function stop(){
	if(AUDIOPLAYER.timeOut)clearTimeout(AUDIOPLAYER.timeOut);
	AUDIOPLAYER.pause();
	if($("state")){$("state").setAttribute("title","play");}
}
function loadText(smilList,width){
	if(!width)width=10
	var walker=document.createTreeWalker(TOCDISPLAY,
			NodeFilter.SHOW_ELEMENT,
			function(node){
				if(node.getAttribute("data-type")=="text"){
					return NodeFilter.FILTER_ACCEPT;
				}else{
					return NodeFilter.FILTER_SKIP;
				}
			},
			false
			);
	walker.currentNode=playlist.currentNode;
	var i=0;
	var text="";
	while(walker.previousNode()){
			i--;
			if(-width>=i){
				break
			}
		}
	for(var c=walker.currentNode;i<width;i++){
		if(!c) break
		if(i==0){
			text+="<strong>"+c.innerText+"</strong><br />";
		}else{
			text+="<font color='rgba(0,0,0,"+(1-1/width*Math.abs(i)).toString()+")'>"+c.innerText+"</font><br />";
		}
		c=walker.nextNode();

	}
	TEXTDISPLAY.innerHTML=text;
}
function loadAudio(){
	var node=playlist.currentNode;
	function wait(){
		AUDIOPLAYER.pause();
		if(AUDIOPLAYER.readyState==4){
			AUDIOPLAYER.play();
		}else{
			AUDIOPLAYER.pause();
		}
	}
	AUDIOPLAYER.src=node.getAttribute("data-src")
	if(AUDIOPLAYER.src!=AUDIOPLAYER.currentSrc && AUDIOPLAYER.load){
		AUDIOPLAYER.load();
	}
	AUDIOPLAYER.pause();
	AUDIOPLAYER.onload=wait;
	try{
		wait();
	}catch(err){}
}
function loadID(file,id){	
	location.hash="id="+id+"&file="+file;
	setPlayList(TOCDISPLAY.querySelector("[data-id='"+id+"'][data-file='"+file+"']"));
	while(playlist.currentNode.getAttribute("data-type")=="text"){
		loadText();
		nextPlaylist();
	}
	if (playlist.currentNode.getAttribute("data-type")=="audio"){
		loadAudio();
	}
	if($("state")){$("state").setAttribute("title","pause");}
}
function markCurrent(){
	if(document.getElementsByClassName("marked").length){
		var list=document.getElementsByClassName("marked");
		while(list.item()!=null){
			list.item().style.background="";
			list.item().style.border="";
			list.item().className=list.item().className.replace(/\s*marked\s*/," ").replace(/^\s+/,"");
		}
	}

	var tmp=playlist.currentNode;
	while(tmp.getAttribute("data-level")!="base"){ 
		if(tmp.tagName.toLowerCase()=="li"){
			tmp.style.background="rgba(255,204,153,0.3)";
			tmp.style.border="solid rgba(204,255,153,0.5)";
			tmp.className=(tmp.className+" marked").replace(/^\s+/,"");
		}
		tmp=tmp.parentElement;
	}
}

function prevPlaylist(){
	playlist.previousNode();
	markCurrent();
	return playlist.currentNode;
}

function nextPlaylist(){
	playlist.nextNode();
	markCurrent();
	return playlist.currentNode;

}

function setPlayList(elem){
	playlist.currentNode=elem;
	playlist.previousNode();
	if(playlist.currentNode!=elem){
		playlist.nextNode();
	}
	markCurrent();
	return playlist.currentNode;
}

/*
*Event handling, should be moved to a seperate js file, mabey UI?
*/
window.addEventListener("keypress",function (e){
			e=e || window.event;
			if(e.altKey || e.ctrlKey || e.shiftKey){
				return;
			}
			switch(String.fromCharCode(e.keyCode || e.charCode)){
				case "l":load();break;
				case "p":play();break;
				case " ":switch($("state").getAttribute("title")){
					case "play":play();break;
					case "on":load();break;
					case "pause":stop();break;
					}break;
				case "s":skip();break;
				case "f":forward();break;
				case "b":backward();break;
			}
		},false);
window.addEventListener("keyup",function (e){
			e=e || window.event;
			if(e.altKey || e.ctrlKey || e.shiftKey){
				return;
			}
			switch(e.keyCode || e.charCode){
				case 39://right
				forward();break;
				case 40://down
				down();$('level').focus();break;
				case 38://up
				up();$('level').focus();break;
				case 37://left
				backward();break;
			}
		},false);

