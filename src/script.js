function getAjax(){
	return new XMLHttpRequest();
}
function searchLocalDir(e){
	document.getElementById('loadingMessage').innerText="Trying to load local NCC file...";
	ajax=getAjax();
	ajax.onreadystatechange=function(){
		document.getElementById("loadingBar").style.width=(100/4)*ajax.readyState+"%";
		if(ajax.readyState==4){
			ncc=crunchNCC(ajax.responseText);
			document.getElementById("toc").innerHTML=ncc;
			smiles=extraxtSmilUrls(ncc);
			fetchSimels(smiles);
			document.getElementById("loadingMessage").innerText="Sucessfully loaded Ncc";
		}
	};
	ajax.open("GET","NCC.html",true);
	ajax.send(null);

}
function fetchSimels(){
	return;
	}
function crunchNCC(ncc){
	ncc=ncc.toLowerCase();
	ncc=ncc.match(/<body>((:?.|\n)*)<\/body>/)[0];
	ncc=ncc.replace(/<a(.*)href=".*#(.*)"(.*)>(.*)<\/a>/g,"<div $1onClick=\"play(\'$2\');\"$3>$4</div>")
	return ncc;
}
function play(id){
	document.getElementById('loadingMessage').innerText="Playing id "+id;
}
function crunchSMIL(smil){
	smil=smil.toLowerCase();
	smil=smil.replace(/clip-begin=/g,"start=");
	smil=smil.replace(/clip-end=/g,"end=");
	smil=smil.replace(/npt=(\d+\.\d*)s/g,'$1')
	return smil;
}

function extraxtSmilUrls(ncc){
	return [];
}
addEventListener("load",searchLocalDir,false);
