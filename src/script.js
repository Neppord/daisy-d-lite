/*
	 trying to do it old fasion way with out objects
 */


// datastructures
/*
	 smils a dict of the smils with key of the url
	 and value as indexDict and smilLists
	 */
smils={}
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
basePath="media/";

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
	return ajax.responseXML
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
						new Number(walker.currentNode.getAttribute("clip-begin").split("npt=")[1]),
						new Number(walker.currentNode.getAttribute("clip-end").split("npt=")[1]),
					];
				}else if(walker.currentNode.tagName.toLowerCase()=="text"){
					var text=basePath+walker.currentNode.getAttribute("src").split("#")[0];
					if(!(text in htmlHash)){
						var html={};
						var doc=loadSyncDoc(text);
						log(doc);
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
function fillTOC(nccList){
	var table=document.createElement("table");
	var tbody=document.createElement("tbody");
	table.appendChild(tbody);
	var stack=[];
	for(i in nccList){
		var row=document.createElement("tr");
		(function(){
			var tmp=i;
			row.onclick=function (){log("onclick:");play(nccList[tmp][0],nccList[tmp][1]);}
		})();
		var id=document.createElement("td");
		id.textContent=nccList[i][1];
		var tag=document.createElement("td");
		tag.textContent=nccList[i][2];
		var text=document.createElement("td");
		text.textContent=nccList[i][3];
		row.appendChild(tag);
		row.appendChild(id);
		row.appendChild(text);
		tbody.appendChild(row);
	}
	TOCDISPLAY.innerHTML="";
	TOCDISPLAY.appendChild(table);
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
	var a=loadTest();
	fillTOC(a[0]);
	smils=a[1];
	htmls=a[2];
}
function play(file,id){
	if (id==undefined && file==undefined){
		AUDIOPLAYER.play();
		return;
	}
	loadID(file,id);
	log("start playing id:%s",id);
}
function skip(){
	AUDIOPLAYER.pause();
	index=index+1;
	var smilList=smil[1];
	if(smilList[index][0]=="text"){
		var text=smilList.map(function (e,i,a){return (e[0]=='text')?((i==index)?"<strong>"+htmls[e[1]][e[2]]+"</strong>":htmls[e[1]][e[2]]):undefined}).join(" ");
		TEXTDISPLAY.innerHTML=text;//htmls[smilList[index][1]][smilList[index][2]]
		index=index+1;
		AUDIOPLAYER.src=smilList[index][1];
	}else if (smilList[index][0]="audio"){
		AUDIOPLAYER.src=smilList[index][1];
	}
	AUDIOPLAYER.play();
}
function loadID(file,id){	
	AUDIOPLAYER.pause();
	smil=smils[file];
	var indexDict=smil[0];
	var smilList=smil[1];
	index=indexDict[id];
	if(smilList[index][0]=="text"){
		var text=smilList.map(function (e,i,a){return (e[0]=='text')?((i==index)?"<strong>"+htmls[e[1]][e[2]]+"</strong>":htmls[e[1]][e[2]]):undefined}).join(" ");
		TEXTDISPLAY.innerHTML=text;//htmls[smilList[index][1]][smilList[index][2]]
		index=index+1;
		AUDIOPLAYER.src=smilList[index][1];
	}else if (smilList[index][0]="audio"){
		AUDIOPLAYER.src=smilList[index][1];
	}
	AUDIOPLAYER.play();
}
window.addEventListener("keypress",function (e){
			e=e || window.event;
			if(e.altKey || e.ctrlKey || e.shiftKey){
				return;
			}
			switch(String.fromCharCode(e.keyCode || e.charCode)){
				case "l":load();break;
				case "p":play();break;
			}
		},false);


//----- more old code----------
function ajaxFeed(func,url){
	ajax=new XMLHttpRequest();
	ajax.open("GET",url,false);// not asyncronus
	log("fetching file: %s",url)
	ajax.send(null);
	log("calling %s with %s content",[new String(func), url]);
	return func(ajax.responseText);
}
Book=function (){}
Book.prototype={
	addSmil:function (smilUrl){
		ajaxFeed(this._addSmil,smilUrl);
	},
	_addSmil:function (smilText){
		document.body.textContent=smilText;
	}
}

//----------------------old Code-------------------------
function fetchSmils(smiles){
	max=smiles.length
	DaisyDlite.smiles=smiles;
	recived=0;
	DaisyDlite.progressBar.set("0%");
	DaisyDlite.progressBar.message.innerHTML="Start Loading Smil Files..";
	DaisyDlite.buffer={};
	if(smiles==null || smiles==[]){
		alert("error");
		return;
	}
	for(i in smiles){
		ajax=getAjax();
		name=smiles[i]
		function onreadystatechange(){
			if(ajax.readyState==4){
				DaisyDlite.buffer[name]=ajax.responseText;
				recived+=1;
				DaisyDlite.progressBar.set((100/max)*recived+"%");
				if(recived=max){
					DaisyDlite.progressBar.message.innerHTML="Recived all Smil Files crunching data...";
					for(x in document.buffer){
						DaisyDlite.buffer[x]=crunchSMIL(DaisyDlite.buffer[x]);
					}
					DaisyDlite.progressBar.message.innerHTML="Done crunching you can now Play";
					DaisyDlite.number=recived;

				}
				else{
					DaisyDlite.progressBar.message.textContent="Recived "+recived+" of "+max+" Smil Files";
				}
			}
		}
		ajax.onreadystatechange=onreadystatechange;
		ajax.open("GET",smiles[i],false);
		ajax.send(null);
		//bar.style.width=100/max*(i+1)+"%";
	}
	}

function stop(){
	DaisyDlite.current.pause();
}
function crunchSMIL(smil){
	smil=smil.toLowerCase();
	smil=smil.replace(/clip-begin=/g,"start=");
	smil=smil.replace(/clip-end=/g,"end=");
	smil=smil.replace(/npt=(\d+\.\d)\d*s*/g,'$1')
	return smil;
}

function extraxtSmilUrls(ncc){
	document.ncc=ncc;
	ret=ncc.match(/\w*.smil/g);
	ret=ret.filter(function (a,i,t){return t.indexOf(a)==i;});
	return ret!=null?ret:[];
}
//addEventListener("load",searchLocalDir,false);
