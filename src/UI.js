function $(){
	return document.getElementById.apply(document,arguments);
}
function togleHide(elem){
	if(elem.constructor && elem.constructor.toString().slice(9,15)=="String"){
		elem=$(elem);
	}
	if(elem.style.display=='none'){
		elem.style.display=elem._display;
	}else{
		elem._display=elem.style.display;
		elem.style.display="none";
	}

}
