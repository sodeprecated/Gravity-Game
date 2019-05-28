

var arrayofplanets = [];
var maxForce = 3000, minForce = 500, curForce = 500,accelerationForce = 20;
var objectPlayer = {};// Imported
var defeatTime = 5;
var defeatWork = false;
let startTime;
let curTime;

var _G = 6.67*100;
var notVisitedStyle = "col-auto task-item notVisited";
var visitedStyle = "col-auto task-item visited";
var task = {
	complete:false,
	planets: []
};// Constant


function getSearch()
{
	 if(window.location.search !== ''){
	  var data = window.location.search.replace('?','');
	  var pairs = data.split('&');
	  var tmp = []
	  var search = {};
	   
	  for (var i=0; i < pairs.length; i++){  
	   	tmp = pairs[i].split('=')
	   	search[tmp[0]] = tmp[1];
	  }
	
	  return search;
	 } else { 
	  return {};
	 }
}



function success(){
	var box = document.createElement("div");
	var text = document.createElement("p");
	box.setAttribute("class","success noselect");
	text.innerText = "YOU WIN";
	box.appendChild(text);
	var menu = document.createElement("div");
	menu.innerHTML = "<a href='index.html'>HOME</a><br><a href='#' onclick='location.reload();'>RESTART</a>";
	menu.setAttribute("class","menu noselect");
	document.body.appendChild(box);
	noLoop();
	var opac = 0;
	var interval = setInterval(function(){
		
		opac+=0.01;
		box.style.opacity = opac;
		if(opac > 1.4){
			clearInterval(interval);
			box.appendChild(menu);
		}
	},30);
}
function defeat(box){
	var opac = 0.7;
	var interval2 = setInterval(function(){
	var menu = document.createElement("div");
	menu.innerHTML = "<a href='index.html'>HOME</a><br><a href='#' onclick='location.reload();'>RESTART</a>";
	menu.setAttribute("class","menu noselect");
	
	opac+=0.01;
	box.style.opacity = opac;
	if(opac > 1.4)
	{
		clearInterval(interval2);
		box.appendChild(menu);
	}
	},40);
}

function defeatIn(){
	var box = document.createElement("div");
	var text = document.createElement("p");
	box.setAttribute("class","defeatIn noselect");
	text.innerText = "DEFEAT IN " + defeatTime;
	box.appendChild(text);
	document.body.appendChild(box);

	var interval = setInterval(function() {
 	 	defeatTime--;

 	 	if(!(objectPlayer.x > windowWidth || objectPlayer.x < 0 || objectPlayer.y > windowHeight || objectPlayer.y < 0)){
			clearInterval(interval);
			defeatTime = 5;
			document.body.removeChild(box);
			defeatWork = false;
		}
 	 	text.innerHTML = "DEFEAT IN " + defeatTime;
 	 	if(defeatTime <= -1){
 	 		clearInterval(interval);
 	 		text.innerHTML = "DEFEATED";
 	 		noLoop();
 	 		defeat(box);
 	 	}
	}, 1000);
	
}


class planet{
	constructor(params){
		this.mass = params.mass;
		this.x = params.x;
		this.y = params.y;
		this.radius = params.radius;
		this.force = createVector(0,0);
		this.velocity = params.velocity;
		this.acceleration = createVector(0,0);
		this.rotation = params.rotation;
		this.rotationSpeed = params.rotationSpeed;
		this.depend = params.depend;
		this.visited = params.visited;
		this.imagePath = params.imagePath;
		this.image = loadImage(this.imagePath);

	}
	display(){
		push();
		noStroke();
		translate(this.x,this.y);
		rotate(this.rotation);
		image(this.image,-this.radius,-this.radius,2*this.radius,2*this.radius);
		pop();
	}
	checkCollisions(){
		var buf = this;
		var Collision = null;
		let pos1 = createVector(this.x,this.y);
		__planets.forEach(function(element){
			
			if(buf !== element){
				let pos2 = createVector(element.x,element.y);
				if(pos1.dist(pos2) <= buf.radius + element.radius)
				{
					Collision = __planets.indexOf(element);
					return;
				}
			}
		});
	return Collision;
	}
}


function createArrayFromJSON(json){
	var createdArray = [];
	var jsonConvert = JSON.parse(json.response);
	var planetData = jsonConvert["planets"];
	planetData.forEach(function(element){
		var buf = {};
		buf.mass = element.mass;
		buf.x = element.x;
		buf.y = element.y;
		buf.radius = element.radius;
		buf.force = createVector(element.force.x,element.force.y);
		buf.velocity = createVector(element.velocity.x,element.velocity.y);
		buf.acceleration = createVector(element.acceleration.x,element.acceleration.y);
		buf.rotation = element.rotation;
		buf.rotationSpeed = element.rotationSpeed;
		buf.depend = element.depend;
		buf.visited = element.visited;
		buf.imagePath = element.image;
		console.log(buf);
		createdArray.push(new planet(buf));
	});
	return createdArray;
}

function createPlayerFromJSON(json){
	var createdArray = [];
	var jsonConvert = JSON.parse(json.response);
	var element = jsonConvert["player"];
	
	
	var buf = {};
	buf.mass = element.mass;
	buf.x = element.x;
	buf.y = element.y;
	buf.radius = element.radius;
	buf.force = createVector(element.force.x,element.force.y);
	buf.velocity = createVector(element.velocity.x,element.velocity.y);
	buf.acceleration = createVector(element.acceleration.x,element.acceleration.y);
	buf.rotationDelt = element.rotationDelt;
	buf.connected = element.connected;
	buf.rotation = element.rotation;
	buf.image = loadImage(element.image);


	return buf;
}



var waitForResponse = 0;

async function load(name){
	let url = "https://mrdanikus.github.io/meme/" + name + ".json";
	var request = new XMLHttpRequest();
	request.open('GET', url,false);
	//request.responseType = 'json';

	try{
		request.send();
	} catch(error){
		alert(error);
	}
	__planets = createArrayFromJSON(request);
	objectPlayer = createPlayerFromJSON(request);
}

function preload(){
	var search = getSearch();
	
	load(search.level);

}

var __planets = [];
function setup(){

	startTime = millis();
	
	angleMode(DEGREES);
	createCanvas(windowWidth, windowHeight);
	
	if(objectPlayer.connected != null)
		__planets[objectPlayer.connected].visited = true;
	
	makeTask(__planets);
}



async function makeTask(array) {
	
	task.planets = array;
	var place = document.getElementById('task');
	var row = document.createElement('div');
	row.setAttribute("class","row text-center align-items-center justify-content-center");
	task.planets.forEach(function(element){
		var member = document.createElement('div');
		member.setAttribute("class","col-auto task-item");
		var img = document.createElement('img');
		
		img.setAttribute("class","task-img");
		img.setAttribute("id","task-img-"+task.planets.indexOf(element));
		if(!element.visited){
			img.setAttribute("src",element.imagePath);
		}
		else{
			img.setAttribute("src","https://mrdanikus.github.io/meme/confirm.png");
		}
		
		member.appendChild(img);
		console.log(member);
		row.appendChild(member);
	});
	place.appendChild(row);
	place.style.marginLeft = -(place.offsetWidth/2) + 'px';
}
function updateTask() {
	let completed = 0;
	
	task.planets.forEach(function(element){
		var member = document.getElementById("task-img-"+task.planets.indexOf(element));
		if(element.visited){
			member.setAttribute("src","https://mrdanikus.github.io/meme/confirm.png");
			completed++;
		}
	});
	if(completed == task.planets.length)
	{
		task.complete = true;
		var result = success();
	}
}


//Force object1 affect object2
function _force(obj1,obj2) {
	let pos1 = createVector(obj1.x,obj1.y);
	let pos2 = createVector(obj2.x,obj2.y);
	var f = _G * obj1.mass * obj2.mass / (pos1.dist(pos2)*pos1.dist(pos2));

	pos1.y-=pos2.y;
	pos1.x-=pos2.x;
	

	let some = createVector(10000,0);
	var angle = some.angleBetween(pos1);
	if(pos1.y < 0)
		angle = 360-angle;
	let vector = createVector(f*cos(angle),f*sin(angle));


	return vector;
}

function drawVector(x,y,vec){
	push();
	strokeWeight(2);
	stroke('#03A66A');
	line(x,y,vec.x+x,vec.y+y);
	pop();
}

function drawPlayerOnPlanet(player,planet){
	push()
	noStroke();
	translate(planet.x + (planet.radius + player.radius)*cos(planet.rotation+player.rotationDelt),planet.y + (planet.radius + player.radius)*sin(planet.rotation+player.rotationDelt));
	rotate(90+player.rotation);
	image(player.image,-player.radius,-player.radius,player.radius*2,player.radius*2);
	pop();
}
function drawPlayer(player) {
	push();
	let some = createVector(10000,0);
	var angle = some.angleBetween(player.velocity);
	if(player.velocity.y < 0)
		angle = 360-angle;
	translate(player.x,player.y);
	rotate(90+angle);
	image(player.image,-player.radius, -player.radius,2*player.radius,2*player.radius);
	pop();
}

function getRotationDelt(player) {
	let planet = __planets[player.connected];
	let pos1 = createVector(player.x,player.y);
	let pos2 = createVector(10000,0);
	pos1.x -= planet.x;
	pos1.y -= planet.y;
	var angle = pos2.angleBetween(pos1);
	var planetangle = planet.rotation%360;
	if(pos1.y < 0)
		angle = 360 - angle;
	return angle - planetangle;
}



function PlayerCollision(player) {
	var Collision = null;
	let pos1 = createVector(player.x,player.y);
	__planets.forEach(function(element){
		let pos2 = createVector(element.x,element.y);
		if(pos1.dist(pos2) <= player.radius + element.radius)
		{

			Collision = __planets.indexOf(element);
			return;
		}
	});
	return Collision;
}





function draw(){


background('#F1F1F6');
curTime = millis();


/*.CHECK DEFEAT */

if((objectPlayer.x > windowWidth || objectPlayer.x < 0 || objectPlayer.y > windowHeight || objectPlayer.y < 0) && !defeatWork){
	defeatWork = true;
	defeatIn();
}

/* DRAWING AND CALCULATING FORCES */

	__planets.forEach(function(element){
		element.display();
		element.force = createVector(0,0);
		
	});
	objectPlayer.force = createVector(0,0);

	if(keyIsDown(32) && objectPlayer.connected != null){

		curForce+=accelerationForce;
		if(curForce > maxForce)
			accelerationForce = 0;
		var planet = __planets[objectPlayer.connected];

		var r = planet.radius;
		var circleSpeed = planet.rotationSpeed*r*30;
		let circleVelocity = createVector(cos(planet.rotation + objectPlayer.rotationDelt + 90) * circleSpeed,sin(planet.rotation + objectPlayer.rotationDelt + 90) * circleSpeed);
		let vectorToDraw = createVector(cos(planet.rotation + objectPlayer.rotationDelt) * curForce,sin(planet.rotation + objectPlayer.rotationDelt) * curForce);
		
		drawVector(planet.x + (planet.radius + objectPlayer.radius)*cos(planet.rotation+objectPlayer.rotationDelt) , planet.y + (planet.radius + objectPlayer.radius)*sin(planet.rotation+objectPlayer.rotationDelt),p5.Vector.div(vectorToDraw,10));	
		
	}

	

	if(objectPlayer.connected != null){
		drawPlayerOnPlanet(objectPlayer,__planets[objectPlayer.connected]);
	}else{

		drawPlayer(objectPlayer);
		__planets.forEach(function(element){
			let f = _force(element,objectPlayer);
			objectPlayer.force.add(f);
		});
	}



  	for(var i = 0; i < __planets.length; i++){
  		if(__planets[i].depend != null){
  			let f = _force(__planets[__planets[i].depend],__planets[i]);
  			__planets[i].force.add(f);
  		}
  	}






/* CALCULATING VELOCITY AND ACCELERATION */
	__planets.forEach(function(element){
		element.acceleration = p5.Vector.div(element.force,element.mass);
	});

	__planets.forEach(function(element){
		element.velocity.add(element.acceleration);
	});
	if(objectPlayer.connected == null){
		objectPlayer.acceleration = p5.Vector.div(objectPlayer.force,objectPlayer.mass);
		objectPlayer.velocity.add(objectPlayer.acceleration);
	}else{
		objectPlayer.velocity = createVector(0,0);
		objectPlayer.acceleration = createVector(0,0);
	}

/* MOVING */
	__planets.forEach(function(element){

		element.rotation+=element.rotationSpeed;
		let pos = createVector(element.x,element.y);
		let oldpos = createVector(element.x,element.y);
		pos.add(p5.Vector.div(element.velocity,1000));
		element.x = pos.x;
		element.y = pos.y;
		if(element.checkCollisions() != null){

			element.x = oldpos.x;
			element.y = oldpos.y;
			element.velocity.div(-1.8);
			
		}
	});

	var prevuiosState = objectPlayer.connected;
	objectPlayer.connected = PlayerCollision(objectPlayer);
	if(prevuiosState != objectPlayer.connected && objectPlayer.connected != null){
		
		objectPlayer.rotationDelt = getRotationDelt(objectPlayer);
		__planets[objectPlayer.connected].visited = true;
		updateTask();
		//console.log(task);
	}

	if(objectPlayer.connected == null){
		let pos = createVector(objectPlayer.x,objectPlayer.y);
		pos.add(p5.Vector.div(objectPlayer.velocity,1000));
		objectPlayer.x = pos.x;
		objectPlayer.y = pos.y
	}else{
		let planet = __planets[objectPlayer.connected];
		objectPlayer.x = planet.x;
		objectPlayer.y = planet.y;
		objectPlayer.rotation = __planets[objectPlayer.connected].rotation + objectPlayer.rotationDelt;
	}




}



function keyReleased() {
if (keyCode === 32) {
	var planet = __planets[objectPlayer.connected];
	objectPlayer.x = planet.x + (planet.radius + objectPlayer.radius)*cos(planet.rotation+objectPlayer.rotationDelt);
	objectPlayer.y = planet.y + (planet.radius + objectPlayer.radius)*sin(planet.rotation+objectPlayer.rotationDelt);

	var r = __planets[objectPlayer.connected].radius;
	var circleSpeed = __planets[objectPlayer.connected].rotationSpeed*r*30;
	let circleVelocity = createVector(cos(planet.rotation + objectPlayer.rotationDelt + 90) * circleSpeed,sin(planet.rotation + objectPlayer.rotationDelt + 90) * circleSpeed);



	objectPlayer.velocity = createVector(cos(planet.rotation + objectPlayer.rotationDelt) * curForce,sin(planet.rotation + objectPlayer.rotationDelt) * curForce);
	objectPlayer.velocity.add(circleVelocity);

	objectPlayer.connected = null;
	let pos = createVector(objectPlayer.x,objectPlayer.y);
	pos.add(p5.Vector.div(objectPlayer.velocity,50));
	objectPlayer.x = pos.x;
	objectPlayer.y = pos.y;
	objectPlayer.rotationDelt = 0;
	curForce = minForce;
	accelerationForce = 20;
}
	return false;
}







window.onresize = function(){
	resizeCanvas(windowWidth, windowHeight);
}

