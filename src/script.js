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
			fecthSmiles(smiles);
		}
	};
	ajax.open("GET","NCC.html",true);
	ajax.send(null);

}
function fetchSimels(){
	return;
	}
function crunchNCC(ncc){
	return ncc;
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
