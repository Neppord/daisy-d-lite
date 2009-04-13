function getAjax(){
	return new XMLHttpRequest();
}
function searchLocalDir(e){
	document.getElementById('loadingMessage').innerText="Trying to load local NCC file...";
	ajax=getAjax();
	ajax.onreadystatechange=function(){
		document.getElementById("loadingBar").style.width=(100/4)*ajax.readyState+"%";
		if(ajax.readyState==4){
			rep=ajax.responseText;
			ncc=crunchNCC(rep);
			document.getElementById("toc").innerHTML=ncc;
			smiles=extraxtSmilUrls(rep);
			fetchSmils(smiles);
			document.getElementById("loadingMessage").innerText="Sucessfully loaded Ncc";
		}
	};
	ajax.open("GET","NCC.html",true);
	ajax.send(null);

}
function fetchSmils(smiles){
	max=smiles.length
	document.smiles=smiles;
	recived=0;
	bar=document.getElementById("loadingBar");
	message=document.getElementById("loadingMessage");
	smilData=document.getElementById("smilData");
	smilData.innerHTML="";
	bar.style.width="0%";
	message.innerText="Start Loading Smil Files..";
	buffer={};
	if(smiles==null || smiles==[]){
		alert("error");
		return;
	}
	for(i in smiles){
		ajax=getAjax();
		name=smiles[i]
		function onreadystatechange(){
			if(ajax.readyState==4){
				buffer[name]=ajax.responseText;
				recived+=1;
				bar.style.width=(100/max)*recived+"%";
				if(recived=max){
					document.buffer=buffer;	
					message.innerText="Recived all Smil Files crunching data...";
					for(x in document.buffer){
						document.buffer[x]=crunchSMIL(document.buffer[x]);
					}
					message.innerText="Done crunching you can now Play";
					document.number=recived;

				}
				else{
					message.innerText="Recived "+recived+" of "+max+" Smil Files";
				}
			}
		}
		ajax.onreadystatechange=onreadystatechange;
		ajax.open("GET",smiles[i],false);
		ajax.send(null);
		//bar.style.width=100/max*(i+1)+"%";
	}
	}
function crunchNCC(ncc){
	ncc=ncc.toLowerCase();
	ncc=ncc.match(/<body>((:?.|\n)*)<\/body>/)[0];
	ncc=ncc.replace(/<a(.*)href="(.*)#(.*)"(.*)>(.*)<\/a>/g,"<div $1onClick=\"play(\'$2\',\'$3\');\"$4>$5</div>")
	return ncc;
}
function play(smilFile,id){
	document.getElementById("smilData").innerHTML=document.buffer[smilFile];	
	document.current=document.getElementById(id).getElementsByTagName("audio")[0]
	document.current.onhashchange=function (e){ alert(this.paused);}
	document.current.play()
	document.getElementById('loadingMessage').innerText="Playing id "+id+" in file "+smilFile;
}
function stop(){
	document.current.pause();
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
