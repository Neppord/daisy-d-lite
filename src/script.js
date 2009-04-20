DaisyDlite=new (
		function(){
			this.self=this;
			self=this;
			this.loadUI=(
					function (){
						self.load=document.getElementById("load");
						self.load=searchLocalDir;
						self.play=document.getElementById("play");
						self.play.onclick=play;
						self.stop=document.getElementById("stop");
						self.stop.onclick=stop;
						self.skip=document.getElementById("skip");
						self.forward=document.getElementById("forward");
						self.backwards=document.getElementById("backward");
						self.progressBar=document.getElementById("progressBar");
						self.progressBar.message=self.progressBar.getElementsByClassName("progressMessage")[0];
						self.progressBar.bar=self.progressBar.getElementsByClassName("progress")[0];
						self.progressBar.rest=(function (){this.bar.className=(this.bar.className.split(" ").filter( function (a) {return a!="resting" && a!="working";}).concat( ["resting"])).join(" ");});
						self.progressBar.work=(function (){this.bar.className=(this.bar.className.split(" ").filter( function (a) {return a!="resting" && a!="working";}).concat( ["working"])).join(" ");});
						self.progressBar.set=(function (value){
							if (value>="100%"){
								this.bar.style.width="100%";
								//this.rest();
								}else{
								this.bar.style.width=value;
								//this.work();
							}
						})
					}
				);
			})();
function getAjax(){
	return new XMLHttpRequest();
}
function searchLocalDir(e){
	DaisyDlite.progressBar.message.innerHTML="Trying to load local NCC file...";
	ajax=getAjax();
	ajax.onreadystatechange=function(){
		DaisyDlite.progressBar.set((100/4)*ajax.readyState+"%");
		if(ajax.readyState==4){
			rep=ajax.responseText;
			ncc=crunchNCC(rep);
			document.getElementById("toc").innerHTML=ncc;
			smiles=extraxtSmilUrls(rep);
			fetchSmils(smiles);
			DaisyDlite.progressBar.message.innerHTML="Sucessfully loaded Ncc";
		}
	};
	ajax.open("GET","NCC.html",true);
	ajax.send(null);

}
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
function crunchNCC(ncc){
	ncc=ncc.toLowerCase();
	ncc=ncc.match(/<body>((:?.|\n)*)<\/body>/)[0];
	ncc=ncc.replace(/<a(.*)href="(.*)#(.*)"(.*)>(.*)<\/a>/g,"<div $1onClick=\"play(\'$2\',\'$3\');\"$4>$5</div>")
	return ncc;
}
function play(smilFile,id){
	if (smilFile==undefined){
		DaisyDlite.current.play();
	}
	DaisyDlite.smilData=document.createDocumentFragment(DaisyDlite.buffer[smilFile]);	
	DaisyDlite.current=DaisyDlite.smilData.getElementById(id).getElementsByTagName("audio")[0]
	DaisyDlite.current.onhashchange=function (e){ alert(this.paused);}
	DaisyDlite.current.play()
	DaisyDlite.progressBar.message.innerHTML="Playing id "+id+" in file "+smilFile;
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
