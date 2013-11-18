var camera, scene, renderer;
//var geometry, material, mesh;
var mouseX = 0, mouseY = 0, particles = [];
var fps = 30;

function onMouseMove(event)
{
	mouseX = event.clientX;
	mouseY = event.clientY;
}

function particleRender( context )
{
 
	// we get passed a reference to the canvas context
	context.beginPath();
	// and we just have to draw our shape at 0,0 - in this
	// case an arc from 0 to 2Pi radians or 360º - a full circle!
	context.arc( 0, 0, 1, 0,  Math.PI * 2, true );
	context.fill();
}

function makeParticles()
{
	var particle, material; 
 
	// we're going to move from z position -1000 (far away) 
	// to 1000 (where the camera is) and add a random particle at every pos. 
	for ( var zpos= -1000; zpos < 1000; zpos += 40 )
	{
 
		// we make a particle material and pass through the 
		// colour and custom particle render function we defined. 
		material = new THREE.ParticleCanvasMaterial( { color: (Math.random() * 0xffffff), program: particleRender } );
		//material = new THREE.ParticleCanvasMaterial( { color: 0, program: particleRender } );
		// make the particle
		particle = new THREE.Particle(material);
 
		// give it a random x and y position between -500 and 500
		particle.position.x = Math.random() * 1000 - 500;
		particle.position.y = Math.random() * 1000 - 500;
 
		// set its z position
		particle.position.z = zpos;
 
		// scale it up a bit
		particle.scale.x = particle.scale.y = 10;
 
		// add it to the scene
		scene.add( particle );
 
		// and to the array of particles. 
		particles.push(particle); 
	}
}

function updateParticles()
{
	// iterate through every particle
	var limit = 1000;
	var xBias = (window.innerWidth / 2) - mouseX;
	for(var i=0; i < particles.length; i++)
	{
 		particle = particles[i]; 
 
		// and move it forward dependent on the mouseY position. 
		particle.position.z +=  (mouseY * 0.1) + 10;
		// if the particle is too close move it to the back

		if ((particle.position.z > limit) || (particle.position.x > limit) || (particle.position.x < -limit))
		{
			particle.position.z -= 2000; //push the particle back
			particle.position.x = Math.random() * limit - (limit / 2);
		}
 	}
}

function init() {
    camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 4000);
    camera.position.z = 1000;

    scene = new THREE.Scene();
	scene.add(camera);

    renderer = new THREE.CanvasRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

	// EVENTS
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });

	makeParticles();
 
	// add the mouse move listener
	document.addEventListener( 'mousemove', onMouseMove, false );

    animate();
}

function animate()
{
	setTimeout(function()
	{
        requestAnimationFrame(animate);
		updateParticles();
		renderer.render(scene, camera);
    }, 1000 / fps);
}