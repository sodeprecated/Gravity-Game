 var __planets = [];
 var __planets_buf = [];
 var objectPlayer = {};
 var defaultParams = {};
 var level_json = {};
 var pregame = true;
 var mousePressed = false;
 var setting_velocity = false;
 let canvas;
 let touchPlanet;
 let changePlanet;
 let modal_set_obj = {
 	mass: 100,
 	radius: 50,
 	velocity: {x:0,y:0},
 	depend: null
 };
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
};
var succes_level = false;

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

function checkMouseCollisions(x,y){
	mousePos = createVector(x,y);
	var Collision = null;
	__planets.forEach(function(element){
		let pos2 = createVector(element.x,element.y);
		if(mousePos.dist(pos2) <= element.radius)
		{
			Collision = element;
			return;
		}
	});
	return Collision;
}







function add_planet(e){
	if(__planets.length >= 6){
		alert("Too much planets");
		return;
	}
	var object = e.toElement;
	var new_planet = defaultParams;
	new_planet.imagePath = object.src;
	new_planet.image = loadImage(new_planet.imagePath);
	__planets.push(new planet(new_planet));
	succes_level = false;
}

function make_shop(array){
	var place = document.getElementById("planets");
	array.forEach(function(element){
		var div = document.createElement("div");
		div.setAttribute("class","redactor-aside-planets-item");
		var img = document.createElement("img");
		img.setAttribute("src",element);
		img.setAttribute("onclick","add_planet(event)");

		div.appendChild(img);
		place.appendChild(div);
	});
}


function load(name){
	let url = "https://mrdanikus.github.io/meme/" + name + ".json";
	var request = new XMLHttpRequest();
	request.open('GET', url,false);
	//request.responseType = 'json';
	try{
		request.send();
	} catch(error){
		alert(error);
	}
	return request;
	
}



function preload(){
	var json = JSON.parse(load("manifest").response);
	make_shop(json["image-planet"]);
	defaultParams = { 	
		mass: 100,
	 	x: (windowWidth)/2,
	 	y: windowHeight/2,
	 	radius: 50,
	 	velocity: createVector(0,0),
	 	rotation: 0,
	 	rotationSpeed: 1,
	 	depend: null,
	 	visited: false,
	 	imagePath: "",
	 	image: null
 	}


}

function setup(){
 	angleMode(DEGREES);
	canvas = createCanvas(windowWidth, windowHeight);
	canvas.canvas.addEventListener("click",onclick_canvas,false);
	canvas.canvas.setAttribute("class","noselect");
	document.getElementById("saved").addEventListener("transitionend", updateTransition, true);


}

function draw(){
	console.log(__planets);
	background('#F1F1F6');
 	if(pregame){
 		draw_pregame();
 	}
 	else{
 		draw_game();
 	}
}


function draw_game(){

background('#F1F1F6');


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

function success(){
	var box = document.createElement("div");
	var text = document.createElement("p");
	box.setAttribute("class","success noselect");
	text.innerText = "YOU WIN";
	box.appendChild(text);
	document.body.appendChild(box);
	noLoop();
	var opac = 0;
	var interval = setInterval(function(){
		
		opac+=0.01;
		box.style.opacity = opac;
		if(opac > 1.4){
			clearInterval(interval);
			loop();
			visible();
			Object.assign(__planets,__planets_buf);
			document.getElementById("task").style.display = "none";
			document.getElementById("task").innerHTML = "";
			document.body.removeChild(box);
			__planets.forEach(function(element){
				element.visited = false;
			});
			pregame = true;
		}
	},30);
	succes_level = true;
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



function draw_pregame(){
	if(setting_velocity){
		drawVelocity(changePlanet);
	}

 	if(mouseIsPressed && touchPlanet == null){
		touchPlanet = checkMouseCollisions(mouseX,mouseY);
		succes_level = false;
	}else if(!mouseIsPressed){
		touchPlanet = null;
	}
	if(touchPlanet != null){
			touchPlanet.x = mouseX;
			touchPlanet.y = mouseY;
	}
 	__planets.forEach(function(element){
		element.display();
	});



}

function make_modal(){
	document.getElementById('planet-image').src = changePlanet.imagePath;
	 	var modal = document.getElementById("set_planet");
	 	modal.style.display = "block";
	 	var place = document.getElementById("set_dropdown");
	 	place.innerHTML = "<li class='dropdown-item' id='none' onclick='choose_menuitem(this)'><img class='dropdown-image' src='https://mrdanikus.github.io/meme/none.png'></li>"
	 	var i = 0;
	 	__planets.forEach(function(element){
	 		if(element != changePlanet)
	 		{
		 		var div = document.createElement("li");
		 		
		 		div.setAttribute("id",i);
		 		div.setAttribute("onmouseover","over_menuitem(this);");
		 		div.setAttribute("onmouseleave","leave_menuitem(this);");
		 		div.setAttribute("onclick","choose_menuitem(this);");
				div.setAttribute("class","dropdown-item");
		 		var img = document.createElement("img");
		 		img.src = (element.imagePath);
		 		if(changePlanet.depend == i)
		 			img.setAttribute("class","dropdown-image choosed");
		 		else
		 			img.setAttribute("class","dropdown-image");
		 		div.appendChild(img);
		 		place.appendChild(div);
	 		}
	 		i++;
	 	});	
}


async function makeTask(array) {
	task.complete = false;
	//console.log(array);
	task.planets = array;
	var place = document.getElementById('task');
	place.style.display = "inline-block";
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
			img.setAttribute("src","assets/confirm.png");
		}
		
		member.appendChild(img);
		//console.log(member);
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
			member.setAttribute("src","assets/confirm.png");
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



function doubleClicked(){
 	changePlanet = checkMouseCollisions(mouseX,mouseY);
 	if(changePlanet != null && pregame)
 	{
 		make_modal();
 	}else{
 		close_set();
 	}
}

function set_velocity(){
	setting_velocity = true;
}


function drawVelocity(planet){
	var vec = createVector(mouseX-planet.x,mouseY-planet.y);
	drawVector(planet.x,planet.y,vec);
}

function drawVector(x,y,vec){
	push();
	strokeWeight(2);
	stroke('#03A66A');
	line(x,y,vec.x+x,vec.y+y);
	pop();
}

function onclick_canvas(){
	
	if(setting_velocity){
		setting_velocity = false;
		changePlanet.velocity = createVector((mouseX-changePlanet.x)*10,(mouseY - changePlanet.y)*10);
		show_saved();
		succes_level = false;
	}
}




function over_menuitem(obj){
	
	__planets[+obj.id].radius+=10;
}
function leave_menuitem(obj){
	
	__planets[+obj.id].radius-=10;
}
function choose_menuitem(obj){
	changePlanet.depend = (obj.id == 'none' ? null:+obj.id);
	make_modal();
	succes_level = false;
	show_saved();
	//console.log(changePlanet.depend);
}

function mass_set(obj){
	changePlanet.mass = +obj.value;
	succes_level = false;
}
function radius_set(obj){
	changePlanet.radius = +obj.value;
	succes_level = false;
}

function show_saved(){
	//document.getElementById("saved").style.display = "block";
	
	document.getElementById("saved").style.display = "block";
	setTimeout(function(){
		document.getElementById("saved").style.opacity = 1;
	},10);
	
	

}
function updateTransition(){
		document.getElementById("saved").style.opacity = 0;
	setTimeout(function(){
		document.getElementById("saved").style.display = "none";
	},10);

	
}

function save_planet(){
	var modal = document.getElementById("set_planet");
 	close_set();
 	show_saved();
 	//TODO modal object
}

function play(){
	console.log(__planets);
	if(__planets.length <= 1){
		alert("Add more planets!");
		return;
	}
	
	invisible();
	
	objectPlayer = {	
		mass: 30,
		x: __planets[0].x,
		y: __planets[0].y,
		radius: 20,    
		force: createVector(0,0),
		velocity: createVector(0,0),
		acceleration: createVector(0,0),
		connected: 0,
		rotationDelt: 0,
		rotation: 0,
		image:loadImage("https://mrdanikus.github.io/meme/rocket.png")
	};
	if(objectPlayer.connected != null)
		__planets[objectPlayer.connected].visited = true;
	Object.assign(__planets_buf,__planets);
	
	makeTask(__planets);
	//console.log(__planets);
	pregame = false;

}

function invisible(){
	document.getElementById("main-button-container").style.display = "none";
	document.getElementsByTagName("main")[0].style.display = "none";
}
function visible(){
	document.getElementById("main-button-container").style.display = "block";
	document.getElementsByTagName("main")[0].style.display = "block";
}


function close_set(){
	document.getElementById("set_planet").style.display = "none";
	setting_velocity = false;
	changePlanet = null;
}

function keyReleased() {
if (keyCode === 32 && !pregame) {
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


function windowResized(){
	resizeCanvas(windowWidth, windowHeight);
}