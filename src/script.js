/*
	 trying to do it old fasion way with out objects
 */

// datastructures
/* audioMap:
	 	keys - file#id
		values - lists of:
			list with index:
				0 - url of file
				1 - start of clip
				2 - end of clip
 */
audioMap={};
/* textMap:
	 keys - file#id
	 value - the text displayed for the id
	 */
textMap={};
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
	ajax=getAjax();
	ajax.open("GET",src,false);
	ajax.send(null);
	return ajax.responseText
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
	loadNCC();
}
function play(id){
	if (id==undefined){
		AUDIOPLAYER.play();
		return;
	}
	loadID(id);
	log("start playing id:%s",id);
}
function loadID(id){	
	var a=audioMap[d];
	AUDIOPLAYER.src=a[0];
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
		document.body.innerText=smilText;
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
					DaisyDlite.progressBar.message.innerText="Recived "+recived+" of "+max+" Smil Files";
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
