function getAjax(){
	return new XMLHttpRequest();
}
function searchLocalDir(e){
	ajax=getAjax();
	ajax.onreadystatechange=function(){
		alert(ajax.readyState)
	};
	ajax.open("GET","NCC.html",true);
	ajax.send(null);

}
addEventListener("load",searchLocalDir,false);
