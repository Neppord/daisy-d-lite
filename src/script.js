if(!$){
	function $(){
		return document.getElementById.apply(document,arguments)
	}
}
// datastructures
/*
	 smils a dict of the smils with key of the url
	 and value as indexDict and smilLists
	 */
smils={};
/* smilList:
	 Audio Element
			list with index:
				0 - "audio"
				1 - url of file
				2 - start of clip
				3 - end of clip
	Text Element:
			List with index:
				0 - "text"
				1 - the text
	indexDict:
		key id in the paired smile valus are indexes in the smil List for that tags content 
 */
/*
	 htmls a dict of the html documents with key of the url
	 and value as id->text mapping
	 */
htmls={};
smil=[{},[]];//fixme: refactor to a better name, this is the current smil.
index=0;
if(!window.basePath)basePath="media/";//sets but dossent over write
// Constants

function loadConstants (){
	TEXTDISPLAY=document.getElementById("textDisplay");
	TOCDISPLAY=document.getElementById("tocDisplay")
	PROGRESSDISPLAY=document.getElementById("progressDisplay");
	PROGRESS=document.getElementById("progress");
	AUDIOPLAYER=document.getElementById("audioPlayer");
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
function loadTOC(){
	var toc = document.createElement("ol");
	toc.setAttribute("data-level","base");
	var current = toc;
	var levels = ["h1","h2","h3","h4","h5","h6","span"];
	var doc = loadSyncDoc(basePath+"ncc.html");	
	var walker = document.createTreeWalker(
			doc,
			NodeFilter.SHOW_ALL,
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
			this.src=((this.parentNode.getElementsByTagName("ol")[0].style.display=="none")?"Images/closed.png":"Images/open.png");
	}
	while(walker.nextNode()){
		while(levels.indexOf(current.getAttribute("data-level"))>=levels.indexOf(walker.currentNode.parentNode.tagName)){
			current=current.parentNode.parentNode;
		}
		var li=document.createElement("li");
		var ol=document.createElement("ol");
		var a=document.createElement("a");
		var span=document.createElement("img");
		span.onclick=hideSub;
		span.style.width="15px";
		span.style.height="15px";
		span.src="Images/closed.png"
		li.appendChild(span);
		ol.setAttribute("data-level",walker.currentNode.parentNode.tagName);
		togleHide(ol);
		a.textContent=walker.currentNode.textContent;
		a.setAttribute("data-file",walker.currentNode.getAttribute("href").split("#")[0])
		a.setAttribute("data-id",walker.currentNode.getAttribute("href").split("#")[1])
		a.onclick=playThis;
		li.appendChild(a);
		li.appendChild(ol);
		current.appendChild(li);
		current=ol;
	}
	TOCDISPLAY.innerHTML="";
	TOCDISPLAY.appendChild(toc);
}
function loadSmil(){
	var toc=TOCDISPLAY.childNodes[0];
	log("smils")
	walker=document.createTreeWalker(
			toc,
			NodeFilter.SHOW_ALL,
			function (node){
				if(node.hasAttribute("data-file")){
					return NodeFilter.FILTER_ACCEPT;
				}
				return NodeFilter.FILTER_SKIP;
			},
			false
			);
	while(walker.nextNode()){
		var doc= loadSyncDoc(basePath+walker.currentNode.getAttribute("data-file"));
		var w=document.createTreeWalker(
				doc,
				NodeFilter.SHOW_ALL,
				function (node){
					if(node.getAttribute("id") ||node.tagName=="audio" || node.tagName=="text"){
						return NodeFilter.FILTER_ACCEPT;
					}
					return NodeFilter.FILTER_SKIP;
				},
				false);
		while(w.nextNode() && w.currentNode.getAttribute("id")!=walker.currentNode.getAttribute("data-id")){}
		while(w.currentNode){
			if(w.currentNode.getAttribute("id")!=walker.nextNode().getAttribute("data-id")){
				walker.previousNode();
			}
			switch(w.currentNode.tagName){
				case "audio":{
					var li=document.createElement("li");
					li.setAttribute("data-type",w.currentNode.tagName);
					li.setAttribute("data-src",basePath+w.currentNode.getAttribute("src"));
					li.setAttribute("data-start",w.currentNode.getAttribute("clip-begin").split("npt=")[1].split("s")[0]);
					li.setAttribute("data-stop",w.currentNode.getAttribute("clip-end").split("npt=")[1].split("s")[0]);
					walker.currentNode.nextSibling.appendChild(li);
				};break
				case "text":{
					var li=document.createElement("li");
					li.setAttribute("data-type",w.currentNode.tagName);
					li.setAttribute("data-src",basePath+w.getAttribute("src").split("#")[0])
					li.setAttribute("data-id",w.getAttribute("src").split("#")[1])
					walker.currentNode.nextSibling.appendChild(li);
				};break
			}
		w.nextNode();
		}
	}
}
function loadNCCTest(){
	var doc= loadSyncDoc(basePath+"ncc.html");
	var a=new Array();
	var walker = document.createTreeWalker(
			doc,
			NodeFilter.SHOW_ALL,
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
	while(walker.nextNode()){
		//FIXME problem if href is "somthing#somthin#somting"
		var l=walker.currentNode.getAttribute("href").split("#");
		l[l.length]=walker.currentNode.parentNode.tagName;
		l[l.length]=walker.currentNode.textContent;//should it be HTML?
		a[a.length]=l;
	}
	return a;
}
function loadSmileTest(nccList){
	var smilHash={};
	var htmlHash={};
	var smil;
	var index;
	for(i in nccList){
		if(nccList[i][0] in smilHash){
		//=hash[nccList[i][0]];
		}else{
			var doc=loadSyncDoc(basePath+nccList[i][0]);
			var walker=document.createTreeWalker(
					doc,
					NodeFilter.SHOW_ELEMENT,
					function(node){
						if(node.getAttribute("id")){
							return NodeFilter.FILTER_ACCEPT;
						}
						switch(node.tagName.toLowerCase){
							case "text": return NodeFilter.FILTER_ACCEPT;break;
							case "audio":return NodeFilter.FILTER_ACCEPT;break;
						}
						return NodeFilter.FILTER_SKIP;
					},
					false
					);
			smil=[];
			index={};
			while(walker.nextNode()){
				if(walker.currentNode.getAttribute("id")){
					index[walker.currentNode.getAttribute("id")]=smil.length;
				}
				if(walker.currentNode.tagName.toLowerCase()=="audio"){
					smil[smil.length]=[
						"audio",
						basePath+walker.currentNode.getAttribute("src"),
						new Number(walker.currentNode.getAttribute("clip-begin").split("npt=")[1].split("s")[0]),
						new Number(walker.currentNode.getAttribute("clip-end").split("npt=")[1].split("s")[0]),
					];
				}else if(walker.currentNode.tagName.toLowerCase()=="text"){
					var text=basePath+walker.currentNode.getAttribute("src").split("#")[0];
					if(!(text in htmlHash)){
						var html={};
						var doc=loadSyncDoc(text);
						var w=document.createTreeWalker(
								doc,
								NodeFilter.SHOW_ELEMENT,
								function(node){
									if(node.getAttribute("id")){
										return NodeFilter.FILTER_ACCEPT;
									}else{
										return NodeFilter.FILTER_SKIP;
									}
								},
								false
								);
						while(w.nextNode()){
							html[w.currentNode.getAttribute("id")]=w.currentNode.textContent;
						}
						htmlHash[text]=html;
					}
					smil[smil.length]=[
						"text",
						text,
						walker.currentNode.getAttribute("src").split("#")[1],
					];
				}
			}
			smilHash[nccList[i][0]]=[index,smil];
		}
	}
	return [smilHash,htmlHash];
}
function loadTest(){
	var nccList=loadNCCTest();
	var tmp=loadSmileTest(nccList);
	return [nccList,tmp[0],tmp[1]];
}
function setProgress(width){
PROGRESS.style.width=width;
}
function setProgressMsg(s){
	PROGRESSDISPLAY.innerHTML=String(s);
}
function loadNCC(){
	setProgressMsg("Loading Ncc..");
	setProgress("0%");
	var file=loadSyncFile(basePath+"ncc.html")	
	setProgress("25%");
	file=file.replace(/(?:.|\n)*<body>((?:.|\n)*)<\/body>(?:.|\n)*/gim,"$1");
	setProgress("50%");
	file=file.replace(
			/<a(.*)href=("?'?)(.*\#.*)\2(.*)>(.*)<\/a>/g,
			"<span $1onClick=\"play(\'$3\')\;\"$4>$5<\/span>"
			);
	setProgress("75%");
	TOCDISPLAY.innerHTML=file;
	setProgress("100%");
	setProgressMsg("Ncc Loaded");
}
//function bindings
function load(){
	//return loadAll();
	var a=loadTest();
	//fillTOC(a[0]);
	loadTOC();
	smils=a[1];
	htmls=a[2];
	if($("state")){$("state").setAttribute("data-state","on");}
}
function play(file,id){
	if($("state")){$("state").setAttribute("data-state","playing");}
	if (id==undefined && file==undefined){
		index-=1;
		skip();
		return;
	}
	loadID(file,id);
}
function skip(){
	if(AUDIOPLAYER.timeOut)clearTimeout(AUDIOPLAYER.timeOut);
	AUDIOPLAYER.pause();
	index=index+1;
	var smilList=smil[1];
	if(smilList[index][0]=="text"){
		loadText(smilList,5);
		index=index+1;
		loadAudio(smilList);
	}else if (smilList[index][0]="audio"){
		loadAudio(smilList);
	}
	AUDIOPLAYER.play();
}
function stop(){
	if(AUDIOPLAYER.timeOut)clearTimeout(AUDIOPLAYER.timeOut);
	AUDIOPLAYER.pause();
	if($("state")){$("state").setAttribute("data-state","on");}
}
function loadText(smilList,width){
		function f(e,i,a){
			return (e[0]=='text')?e.concat(i==index):undefined;
		}
		function m(e,i,a){
				var alpha=1-Math.abs((i/a.length-0.5))*2;//Fix me: wrong opacity in begining and end of smil
				return (e[3])?"<strong>"+htmls[e[1]][e[2]]+"</strong>":"<font color='rgba(0,0,0,"+alpha*1+")'>"+htmls[e[1]][e[2]]+"</font>";
		}
		var a=smilList.map(f);
		a=a.filter(function (e){return e});
		if(width){
			var I;
			a.forEach(function (e,i,a){if(e[3]==true)I=i});
			a=a.slice(Math.max(new Number(I)-width,0),Math.min(new Number(I)+width+1,a.length));
		}
		var text=a.map(m).join("<br>");
		TEXTDISPLAY.innerHTML=text;//htmls[smilList[index][1]][smilList[index][2]]
}
function loadAudio(smilList){
			if(AUDIOPLAYER.timeOut)clearTimeout(AUDIOPLAYER.timeOut);
			function wait(){
				AUDIOPLAYER.pause();
				if(AUDIOPLAYER.readyState==4){
					log("readyState==4");
					AUDIOPLAYER.currentTime=smilList[index][2];
					AUDIOPLAYER.play();
					if(AUDIOPLAYER.timeOut)clearTimeout(AUDIOPLAYER.timeOut);
					AUDIOPLAYER.timeOut=setTimeout(skip,(smilList[index][3]-smilList[index][2])*1000);
				}
				else{
					log("readyState=="+AUDIOPLAYER.readyState+" i.e. not 4");
					AUDIOPLAYER.pause();
				}
			}
			AUDIOPLAYER.src=smilList[index][1];
			if(AUDIOPLAYER.src!=AUDIOPLAYER.currentSrc)AUDIOPLAYER.load();
			AUDIOPLAYER.pause();
			AUDIOPLAYER.onload=wait;
			try{
				wait();
			}catch(err){}
}
function loadID(file,id){	
	smil=smils[file];
	var indexDict=smil[0];
	var smilList=smil[1];
	index=indexDict[id];
	if(smilList[index][0]=="text"){
		loadText(smilList,5);
		index=index+1;
		loadAudio(smilList);
	}else if (smilList[index][0]="audio"){
		loadAudio(smilList);
	}
	if($("state")){$("state").setAttribute("data-state","playing");}
}
window.addEventListener("keypress",function (e){
			e=e || window.event;
			if(e.altKey || e.ctrlKey || e.shiftKey){
				return;
			}
			switch(String.fromCharCode(e.keyCode || e.charCode)){
				case "l":load();break;
				case "p":play();break;
				case "s":skip();break;
				case "f":forward();break;
				case "b":backward();break;
			}
		},false);

