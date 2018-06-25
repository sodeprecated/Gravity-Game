"use strict"
function press() {

let incoming = document.getElementById("inp").value;

let outcoming;
for(let i = 0; i < incoming.length; i++)
{
	outcoming += String(incoming.charCodeAt(i));
}
outcoming = outcoming.slice(9,outcoming.length);
outcoming = +outcoming;
var l = outcoming.toString(2);
let out;
for(let j = 0; j < l.length; j++)
{
	if(+l[j] == 1)
		out+="0";
	else out+=")";
}
out = out.slice(9,out.length);
document.getElementById("out").value = out;
}
function press2(){
	let incoming = document.getElementById("inp2").value;

	let outcoming;
	for(let i = 0; i < incoming.length; i++)
	{
		if(incoming[i] == "0")
			outcoming += "1";
		else outcoming += "0";
	}

	outcoming = outcoming.slice(9,outcoming.length);
	

	document.getElementById("out2").value = outcoming;
}