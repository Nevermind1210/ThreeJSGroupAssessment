import * as THREE from 'three'
import {FlyControls} from 'three/examples/jsm/controls/FlyControls.js'
import {ImprovedNoise} from 'three/examples/jsm/math/ImprovedNoise.js'
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js'
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader.js'
import * as dat from 'lil-gui'
import {Color} from 'three'
import {Sky} from 'three/examples/jsm/objects/Sky.js'

// Debug

//const loader = new GLTFLoader();
const loader = new MTLLoader();
const objloader = new OBJLoader();
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//Fog Code 
scene.fog = new THREE.FogExp2(0xDFE9F3, 0.1); //White fog
//scene.fog = new THREE.Fog(0x1B1B1B, 10, 15); //Black fog

//Trees creation
var treeCount = 100;
var minHeight = 1;
var maxHeight = 2.5;
var minSize = 0.1;
var maxSize = 1;
var areaSize = 50;
function CreateTrees()
{
for (let i = 0; i < treeCount; i++)
{
  const height = Math.random() * (maxHeight - minHeight) + minHeight;
   const width =  Math.random() * (maxSize - minSize) + minSize;
  var xAxis = (Math.random() - 0.5) * areaSize;
  var zAxis = (Math.random() - 0.5) * areaSize;

  // Create the cone geometry for the leaves
  var coneGeometry = new THREE.ConeGeometry(width+0.5, height+1, 10);
  var coneMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  var cone = new THREE.Mesh(coneGeometry, coneMaterial);

  // Create the rectangle geometry for the stump
  var stumpGeometry = new THREE.BoxGeometry(width -1, height, width-1);
  var stumpMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
  var stump = new THREE.Mesh(stumpGeometry, stumpMaterial);

  // Position the objects
  cone.position.y = 2; // Place the cone directly on top of the stump
  stump.position.y = 0.5; // Move the stump to half of its height

  // Create a group to hold both objects
  var tree = new THREE.Group();
  tree.add(cone);
  tree.add(stump);
  tree.position.x = xAxis;
  tree.position.z = zAxis;
  tree.position.y += 1;
  // Add the tree to the scene
  scene.add(tree);

}
}
CreateTrees();


//Textures
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particles/5.png')



//////////Lighting/////////
var ambientLight = new THREE.AmbientLight(new THREE.Color(1,1,1),5);

scene.add(ambientLight);
//'src/buger.glb'
objloader.setPath('assets/Mesh/');
loader.setPath('assets/Mesh/');
var mesh = null;
loader.load('Basiccampingtents.mtl',
	// called when the resource is loaded
  function ( geometry) {
    geometry.preload();
    objloader.setMaterials(geometry);    
    objloader.load('Basiccampingtents.obj', function(object) {
      scene.add(object);
    });
		
	});

/* Particle Code starts here*/

// Particle Geometry
const partclesGeometry = new THREE.BufferGeometry()
const count = 20000;

const positions = new Float32Array(count * 3) // Times by 3 reason
// each postion is composed of 3 values (x y z)

const colors = new Float32Array(count * 3)

for (let i = 0; i < count * 3; i++) // Times by 3 for same reason above
{
    positions[i] = (Math.random() - 0.5) * 100 // have a random value between -05 and +0.5
    colors[i] = Math.random() // Random colours weeeee
}

partclesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
partclesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

//Particle Material
const particleMaterial = new THREE.PointsMaterial({
    size: 0.1,
    sizeAttenuation: true,
    //color : 'purple',
    map: particleTexture,
    transparent : true,
    alphaMap: particleTexture,
    alphaTest : 0.01,
    depthWrite : false,
    blending : THREE.AdditiveBlending,
    vertexColors : true

})

//Particle Points
const particles = new THREE.Points(partclesGeometry, particleMaterial)
particles.position.y +=3;
scene.add(particles)

/*End of Particle code*/

//Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

//Resize Function
window.addEventListener('resize', () =>
{
    //Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    //Update camera
    camera.aspect = sizes.width / sizes.height
    camera.fov = 1000;
    camera.updateProjectionMatrix()

    //Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

//Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
camera.position.y += 5
scene.add(camera)

//Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//Controls
const controls = new FlyControls(camera, canvas)
controls.movementSpeed = 0.05;
controls.lookSpeed = 20;
//controls.autoForward = true;

//Button controls:

// W - Move Forwards
// S - Move Backwards
// A - Move Left
// D - Move Right
// Q - Rotate Anti-Clockwise
// E - Rotate Clockwise
// R - Move Up
// F - Move Down
// Z - Reset Camera
// Space - Lock point of view

//Check if any other buttons are pushed
window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);

let spaceKeyPressed = false;

function onKeyDown(event) {
  console.log(event.code);
  //Freeze looking moevment
  if (event.code === 'Space') {
    spaceKeyPressed = true;
    controls.rollSpeed = 0;
  }
  //Reset camera to look straight
  if (event.code === 'KeyZ'){
    camera.lookAt(0,camera.position.y,0);
  }
}

function onKeyUp(event) {
  //Unfreeze looking moevment
  if (event.code === 'Space') {
    spaceKeyPressed = false;
    controls.rollSpeed = 0.005;
  }
}

//Animate
const clock = new THREE.Clock()

const animate = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Update controls
    controls.update(1);

    //Render
    renderer.render(scene, camera)

    //Call tick again on the next frame
    window.requestAnimationFrame(animate)
}

animate()

//Mirror Start

//Mirror End

/*Sky code starts here*/

let sky, sun;

initSky();
renderer.render(scene, camera)

function initSky(){

	//Add Sky
	sky = new Sky();
	sky.scale.setScalar(450000);
	scene.add(sky);

	sun = new THREE.Vector3();

	//Sky Variables
	const SkyController = {
		turbidity: 10,
		rayleigh: 3,
		mieCoefficient: 0.005,
		mieDirectionalG: 0.7,
		elevation: 2,
		azimuth: 180,
		exposure: renderer.toneMappingExposure
	};

	function ShowSky(){
    //Update the sky variables to the scene
		const uniforms = sky.material.uniforms;
		uniforms['turbidity'].value = SkyController.turbidity;
		uniforms['rayleigh'].value = SkyController.rayleigh;
		uniforms['mieCoefficient'].value = SkyController.mieCoefficient;
		uniforms['mieDirectionalG'].value = SkyController.mieDirectionalG;

		const polarAngle = THREE.MathUtils.degToRad( 90 - SkyController.elevation );
		const equatorAngle = THREE.MathUtils.degToRad( SkyController.azimuth );

		sun.setFromSphericalCoords(1, polarAngle, equatorAngle);

		uniforms['sunPosition'].value.copy(sun);

		renderer.toneMappingExposure = SkyController.exposure;
		renderer.render(scene, camera);
	}

  // Below is the Pop-up Controls on the screen to do with the sky. This can be removed if not wanted:

  const SkyFolder = gui.addFolder('Sky');
	SkyFolder.add(SkyController, 'turbidity', 0.0, 20.0, 0.1).onChange(ShowSky);
	SkyFolder.add(SkyController, 'rayleigh', 0.0, 4, 0.001).onChange(ShowSky);
	SkyFolder.add(SkyController, 'mieCoefficient', 0.0, 0.1, 0.001).onChange(ShowSky);
	SkyFolder.add(SkyController, 'mieDirectionalG', 0.0, 1, 0.001).onChange(ShowSky);
	SkyFolder.add(SkyController, 'elevation', 0, 90, 0.1).onChange(ShowSky);
	SkyFolder.add(SkyController, 'azimuth', - 180, 180, 0.1).onChange(ShowSky);
	SkyFolder.add(SkyController, 'exposure', 0, 1, 0.0001).onChange(ShowSky);
  SkyFolder.open();

  //Above is the Pop-up Controls for the sky

	ShowSky();

}

/*End Of Sky code*/

/*Land code starts here*/

//THREE.BufferGeometry.prototype.toQuads = ToQuads;

const perlin = new ImprovedNoise();

//"step" affects the gradient of the land
//Smaller step gives more mountains
//Larger step gives more flat land

//let step = 10;
const red = 50 / 255;
const green = 168 / 255;
const blue = 82 / 255;

let PlaneGeometry, PlaneMaterial, Plane;

const LandController = {
  step: 10,
  Colour: 0x32a852
};

//This creates the land by calling the other functions below
function ShowLand(){ 
  for(let z = -4; z <= 4; z ++){
	  for(let x = -4; x <= 4; x++){
  	  let plane = createPlane(LandController.step, LandController.Colour);
      // Below makes the plane a random colour. If you are testing this, comment the plane above first.
      //let plane = createPlane(step, Math.random() * 0x7f7f7f + 0x7f7f7f);
      setNoise(plane.geometry, new THREE.Vector2(x, z), 2, 3);
      plane.geometry.rotateX(Math.PI * 0.5);
      plane.position.set(x, 0, z).multiplyScalar(LandController.step);
      scene.add(plane);
    }
  }
}

//This function creates the plane that will be the land in the scene
function createPlane(step, color){ 
  PlaneGeometry = new THREE.PlaneGeometry(step, step, 100, 100)/*.toQuads()*/;

  //This section makes the plane geometry curved
  var vertices = Math.abs(PlaneGeometry.attributes.position.array);
  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];
    const distanceFromCenter = Math.abs(vertex.x);
    const curveAmount = Math.sin(distanceFromCenter * 0.5) * 0.5;
    vertex.z = curveAmount;
  }

  //This creates the plane's material
  PlaneMaterial = new THREE.MeshBasicMaterial({color: color, side: THREE.DoubleSide});
  PlaneMaterial.fog = true;
  PlaneMaterial.transparent = false;
  Plane = new THREE.Mesh(PlaneGeometry, PlaneMaterial);
  return Plane;
}

//This function is supposed to update the land without duplicating it, but its not working though...
// function UpdateLand(){
//   scene.remove(Plane);
//   PlaneGeometry.width = LandController.step;
//   PlaneGeometry.height = LandController.step;
//   PlaneMaterial.color = LandController.Colour;
//   var NewPlane = new THREE.Mesh(PlaneGeometry, PlaneMaterial);
//   scene.add(NewPlane);
//   Plane = NewPlane;
// }

//This function sets the curve and hills of the land
function setNoise(g, uvShift, multiplier, amplitude){
	let pos = g.attributes.position;
  let uv = g.attributes.uv;
  let vec2 = new THREE.Vector2();
  for(let i = 0; i < pos.count; i++){
    vec2.fromBufferAttribute(uv, i).add(uvShift).multiplyScalar(multiplier);
    pos.setZ(i, perlin.noise(vec2.x , vec2.y*2, 10) * amplitude);
  }
}

//This function makes the plane geometry into a quadrant.
//If this function is called on though, it makes the plane appear more like triangles.
//So that is it is not called upon.
// function ToQuads() {
// 	let g = this;
//   let p = g.parameters;
//   let segmentsX = (g.type == "TorusBufferGeometry" ? p.tubularSegments : p.radialSegments) || p.widthSegments || p.thetaSegments || (p.points.length - 1) || 1;
//   let segmentsY = (g.type == "TorusBufferGeometry" ? p.radialSegments : p.tubularSegments) || p.heightSegments || p.phiSegments || p.segments || 1;
//   let indices = [];
//   for (let i = 0; i < segmentsY + 1; i++) {
//     let index11 = 0;
//     let index12 = 0;
//     for (let j = 0; j < segmentsX; j++) {
//       index11 = (segmentsX + 1) * i + j;
//       index12 = index11 + 1;
//       let index21 = index11;
//       let index22 = index11 + (segmentsX + 1);
//       indices.push(index11, index12);
//       if (index22 < ((segmentsX + 1) * (segmentsY + 1) - 1)) {
//         indices.push(index21, index22);
//       }
//     }
//     if ((index12 + segmentsX + 1) <= ((segmentsX + 1) * (segmentsY + 1) - 1)) {
//       indices.push(index12, index12 + segmentsX + 1);
//     }
//   }
//   g.setIndex(indices);
//   return g;
// }

ShowLand();

//To add the GUI for land, uncomment below:
//However this may mess up with trees and other stuff
//Warning: Might lag pretty hard because everytime you change these variables, it creates a new plane instead of updating the original plane.

// const LandFolder = gui.addFolder('Land');
// LandFolder.add(LandController, 'step', 0, 100, 1).onChange(ShowLand);
// LandFolder.addColor(LandController, 'Colour').listen().onChange(ShowLand);
// LandFolder.open();     

/*End Of Land code*/

/*Start of Cloud code*/

// Create a cloud material
var cloudTexture = new THREE.TextureLoader().load('cloud1.png');
var cloudMaterial = new THREE.MeshBasicMaterial({ map: cloudTexture, transparent: true });

// Create multiple cloud meshes and position them randomly in the sky
var numClouds = 100;
for (var i = 0; i < numClouds; i++) {

  // Create a cloud geometry with random width and height
  var randomWidth = Math.random() * 10 + 5; // Random width between 5 and 15
  var randomHeight = Math.random() * 10 + 5; // Random height between 5 and 15
  var cloudGeometry = new THREE.PlaneGeometry(randomWidth, randomHeight);

  var cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);

  // Set random positions in the sky
  cloudMesh.position.x = Math.random() * 300 - 50;
  cloudMesh.position.y = Math.random() * 0 + 50;
  cloudMesh.position.z = Math.random() * 300 - 50;
  cloudMesh.rotation.x = Math.PI / 2;

  var randomScale = Math.random() * 2 + 1; // Randomise the range of scale
  cloudMesh.scale.set(randomScale, randomScale, randomScale);

  scene.add(cloudMesh);
}

/*End of Cloud code*/