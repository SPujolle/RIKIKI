var sep = " | ";
var title = [];
var url = [];
var toolTip = [];
var navLink =[] ;

var main_menu ;
var centralW ;
var leftCol;
var bottomNaviArea ;
var W ;
function setWindowLayout(){
	main_menu = document.createElement("DIV");	
	document.body.appendChild(main_menu);
	W = document.createElement("DIV");
	W.className = "box";
		document.body.appendChild(W);

	centralW = document.createElement("DIV");
		centralW.className="cent";
	
	leftCol = document.createElement("DIV");	
		leftCol.className = "leftC";

	footer = document.createElement("DIV");
		footer.className = "footer";
		footer.innerHTML = "<<  cheaply powered by RIKIKI >>";
		
	bottomNaviArea = document.createElement("DIV");	
		bottomNaviArea.className = "bottomNaviArea";
		
		W.appendChild(leftCol);
		W.appendChild(centralW);
		
		document.body.appendChild(footer);
}
function UrlNav(i){
	var Get = '#?NAME=' +  encodeURIComponent( navLink[i]) + '&INDEX=' + i ;
	return Get ;
}

function genLink(i){
	
	var A = '<A href="' + UrlNav(i) + '"';   
	A +=  'title="' +  toolTip[i]  +'" '  +   '>' ;
	A += title[i].replace(/\|/g,'');
	A += '</A>'
	return A ;
}

function leftColCont(N,C){
			leftCol.innerHTML = "<b>" +title[N] + "</b><br>";
		var i = N+1;
		if (i < title.length){
			while (title[i][0]=='|' ){	
				if(i != C){
				leftCol.innerHTML += "<li>"+genLink(i) + "<br>" ;
				}else{
					leftCol.innerHTML += "-- "+genLink(i) + " --<br>" ;
				}
				i++
			}	
		}
}

function fillLeftCol(N){	
	if(title[N][0]!='|'){ 
		leftColCont(N);
	}else{
		var i = N ;
		while(title[i][0]=='|'){
			i--;
		}
		leftColCont(i,N);
	}
}
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function bottomNaviLinks(i){
		bottomNaviArea.innerHTML = "";
		
		if (i!=0){
			if(title[i][0] == '|'){
				var P = document.createElement("A");	
				P.href = UrlNav(i-1) ; 
				P.text = "<-- precedent";
				bottomNaviArea.appendChild(P);
			}
		}
		bottomNaviArea.innerHTML += "   =   ";

		if (i < (title.length -1)){
			if(title[i+1][0] == '|'){			
				var N = document.createElement("A");	
				N.href = UrlNav(i+1); 
				N.text = "next -->";
				bottomNaviArea.appendChild(N);
			}
		}
		var links = bottomNaviArea.getElementsByTagName("a");
		if(links.length != 0){
			centralW.appendChild(bottomNaviArea);
		}
}
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function writeContent(extType, content , N){
			if (extType =="htm" || extType =="html"){
				centralW.innerHTML = content ;
			}else if(extType=="md"){	
				var conv = new showdown.Converter();
				centralW.innerHTML =  conv.makeHtml( content ) ;
			}else{
				centralW.innerHTML = "<h3>File \""+ url[N] +"\" format not allowed</h3>" ;
			}
			var links = centralW.getElementsByTagName("a");
			// add target =_blank to all links
			for(var i=0, max=links.length; i < max; i++) {
				var LIENS = links[i].href.split('#')[0]
				var LOCAL = window.location.href.split('#')[0]
				console.log("LIENS LOCAL : "+ ((LIENS == LOCAL) ? "Local" : "Externe"))
				if(LIENS != LOCAL) links[i].setAttribute('target', '_blank');
			}
			bottomNaviLinks(N);
}

function fillCentral(i){	
	//remplissage du centralW
	var file = url[i]
	var xhttp2 = new XMLHttpRequest();
	var extType = file.split('.').pop();
	
	xhttp2.onreadystatechange = function() {
		if (this.readyState == 4 ) {
			if(this.status == 200){
				var content = xhttp2.responseText ;
				writeContent(extType, content, i);
			}else{
				writeContent("htm", "<h3>problem loading file \"" + file + "\" : server returned status = "+ this.status +" </h3> ", 0);
			}
		}
	}
	xhttp2.open("GET", file, true);
	xhttp2.send();

}

 // ==================================================== //
 // catch navigation event detect URL modif 
window.onpopstate = function(event) { 
	loadPageInGetUrl() ;
};
// ======================================================= //

function callPage( i){
				fillCentral(i);
				fillLeftCol(i);
}

function parseIndexTXT(lines){

	for(var i = 0; i < lines.length; i++){
		var line = lines[i];
		if(line[0] != '#' ){
			var fields = line.split(',');
			
			switch(fields.length)
			{
				case 0: break ;
				case 1: break;
				case 2 :
				toolTip.push("");
				case 3 :
				toolTip.push(fields[2].replace(/"/g,''));
				default :
				title.push(fields[0].replace(/"/g,''));
				url.push(fields[1]);	
				
				var N = title.length - 1; var j = N;
				while(title[j][0] == '|'){	j-- ;}	/* search father */		
				var U =   title[j]+ "/" +  title[N];// generate a more or less unique identifier	
				navLink.push( U);
			}	
		}	
	}
}
function tryGuessURL(Name, N){
	console.log("STRANGE URL");
	var bestGuess = -1 ;
	for(var i = 0 ; i < navLink.length - 1 ; i++){
		if(Name == navLink[i] ) {
			// Succes we foud a more or less correspondant page	
			bestGuess = i ;	
			console.log("SUCCES = " + i);
			return bestGuess ;		
		}
	}
	if(N >= 0   &&  Number.isInteger(N) ) {return N ;}
	return bestGuess ;
}



function loadPageInGetUrl(){
	// decode index number at end aof URL field
	queryString = document.location.hash;
	queryString =  queryString.replace(/[#\?]/g,'');	
	var searchParams = new URLSearchParams(queryString);
	var N = -1 ;
	var Name = "";
	if(searchParams.has("NAME")) var Name = searchParams.get("NAME");
	if(searchParams.has("INDEX") ) N = parseInt( searchParams.get("INDEX"));
	if(!searchParams.has("NAME")  && !searchParams.has("INDEX")){
		callPage(0); 
		return ;
	}
	
	if(Name !="" &&  N >= 0   &&  Number.isInteger(N) ){
		// may be a good URL
		if (Name == navLink[N]  && Number.isInteger(N) ){
			console.log("BONNE URL");
				callPage(N); 
				return ;
		}
	}
	bestGuess = tryGuessURL(Name, N)
	if(bestGuess != -1){
		callPage(bestGuess);
		alert ("You use a deprecated link.\nThe best match your search is : \n" + navLink[bestGuess]+"\nContinue ?"   );
	}else{
		writeContent("htm", "<h3>ERROR 404  : You use a broken link or the topic have been deleted </h3> ", 0);	
		fillLeftCol(0);
	}		
}
function mainMenu(){
	var xhttp = new XMLHttpRequest();
	// Cration du main menu
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			// Typical action to be performed when the document is ready:
			var lines = xhttp.responseText.split('\n');
			parseIndexTXT(lines);
	
			main_menu.innerHTML = "";
			for (var i = 0 ; i < title.length ; i++){
					//console.log("-> "+ title[i]);
				if(title[i][0] != '|'){
					var A = genLink(i);
					A += (i ==title.length -1 ?  ""   :sep)     ;
					main_menu.innerHTML += A;
				}
			}
			loadPageInGetUrl();		
		}
	};
	xhttp.open("GET", "index.txt", true);
	xhttp.send();

}

function fillWindow(){
		setWindowLayout();
		mainMenu();
}

