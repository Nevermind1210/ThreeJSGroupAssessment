import * as THREE from 'three'
import {FlyControls} from 'three/examples/jsm/controls/FlyControls.js'
import {ImprovedNoise} from 'three/examples/jsm/math/ImprovedNoise.js'
import * as dat from 'lil-gui'
import {Color} from 'three'
import {Sky} from 'three/examples/jsm/objects/Sky.js'

// Debug

//const loader = new GLTFLoader();

const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//scene.fog = new THREE.FogExp2(FogController.Colour, FogController.Intensity); //White fog
//scene.fog = new THREE.Fog(0x1B1B1B, 10, 15); //Black fog




///////////////////Start Trees creation///////////////
var treeCount = 500;
var minRadius = 0.1;
var maxRadius = 0.4;
var minHeight = 1.5;
var maxHeight = 2;
var minSize = 0.01;
var maxSize = 1;
var areaSize = 160;

/////////Tree Textures////////
var stumpTxtLoader = new THREE.TextureLoader();
var colorMap = stumpTxtLoader.load('stumpTexture/Wood_Bark_006_basecolor.jpg');
var NormalMap = stumpTxtLoader.load('stumpTexture/Wood_Bark_006_normal.jpg');
var RoughnessMap = stumpTxtLoader.load('stumpTexture/Wood_Bark_006_roughness.jpg');
var AOMap = stumpTxtLoader.load('stumpTexture/Wood_Bark_006_ambientOcclusion.jpg');
var HeightMap = stumpTxtLoader.load('stumpTexture/Wood_Bark_006_height.png');
var Dmap = stumpTxtLoader.load('stumpTexture/Wood_Bark_006_Displacement.jpg');


var woodMat = new THREE.MeshStandardMaterial({
  map : colorMap,
  normalMap : NormalMap,
  roughnessMap: RoughnessMap,
  aoMap: AOMap,
  displacementMap : Dmap,
  displacementScale : 0.5,
  bumpMap : HeightMap,
  bumpScale : 2
});

///////////Leaves Textures////////
var leavesTxtLoader = new THREE.TextureLoader();
var LcolorMap = leavesTxtLoader.load('leavesTexture/Stylized_Leaves_002_basecolor.jpg');
var LNormalMap = leavesTxtLoader.load('leavesTexture/Stylized_Leaves_002_normal.jpg');
var LRoughnessMap = leavesTxtLoader.load('leavesTexture/Stylized_Leaves_002_roughness.jpg');
var LAOMap = leavesTxtLoader.load('leavesTexture/Stylized_Leaves_002_ambientOcclusion.jpg');
var LHeightMap = leavesTxtLoader.load('leavesTexture/Stylized_Leaves_002_height.png');
var LDMap = leavesTxtLoader.load('leavesTexture/Stylized_Leaves_Displacement.jpg');

var leavesMat = new THREE.MeshStandardMaterial({
  map : LcolorMap,
  normalMap : LNormalMap,
  roughnessMap : LRoughnessMap,
  aoMap : LAOMap,
  bumpMap : LHeightMap,
  bumpScale : 1.3
});
//  var coneMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// var stumpMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });

function CreateTrees()
{
for (let i = 0; i < treeCount; i++)
{
  const height = Math.random() * (maxHeight - minHeight) + minHeight;
  const width =  Math.random() * (maxSize - minSize) + minSize;
  const radius = Math.random() * (maxRadius - minRadius) + minRadius;

  var xAxis = (Math.random() - 0.5) * areaSize;
  var zAxis = (Math.random() - 0.5) * areaSize;

  // Create the cone geometry for the leaves
  var coneGeometry = new THREE.ConeGeometry(width+0.5, height+1, 170);
  var cone = new THREE.Mesh(coneGeometry, leavesMat);

  // Create the rectangle geometry for the stump
  var stumpGeometry = new THREE.CylinderGeometry(radius, radius, height);
  
  var stump = new THREE.Mesh(stumpGeometry, woodMat);

  // Position the objects
  var stumpHeight = stump.geometry.parameters.height;
  var leavesHeight = cone.geometry.parameters.height;
  var topCylinderPos = stump.position.y + stumpHeight/2;
  cone.position.y = topCylinderPos + leavesHeight /2;
  stump.position.y = 0;
  

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

///////////////End of Tree Creation//////////

//Textures
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particles/5.png')



//////////Lighting/////////
var ambientLight = new THREE.AmbientLight(new THREE.Color(1,1,0),1);

scene.add(ambientLight);



/* Particle Code starts here*/

// Particle Geometry
const partclesGeometry = new THREE.BufferGeometry()
const count = 10000;

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
particles.position.y = 80;
particles.position.x += 50;
particles.position.z += 30;
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
  //console.log(event.code);
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
    controls.update(1.5); //can also control the speed

    //Render
    renderer.render(scene, camera)

    //Call tick again on the next frame
    window.requestAnimationFrame(animate)
}

animate()

//Mirror Start

//Mirror End

/*Start of Fog Code*/

initFog()
renderer.render(scene, camera)

function initFog(){

  const FogController = {
    Colour: 0xDFE9F3,
    Intensity: 0.1
  };

  function ShowFog(){
    scene.fog = new THREE.FogExp2(FogController.Colour, FogController.Intensity); //White fog
  }

  const FogFolder = gui.addFolder('Fog');
  FogFolder.addColor(FogController, 'Colour').listen().onChange(ShowFog);
	FogFolder.add(FogController, 'Intensity', 0.0, 1, 0.001).onChange(ShowFog);
  FogFolder.open();

  ShowFog()

}

/*End of Fog code*/

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
  //console.log("Added Sky");

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
    //console.log("Start ShowSky");
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
    //console.log("Render Sky");
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

let PlaneGeometry, PlaneMaterial, Plane;
let grassTxtLoader = new THREE.TextureLoader()
let GColorMap = grassTxtLoader.load('grassTexture/Grass.jpg');
let GHeightMap  = grassTxtLoader.load('grassTexture/BumpGrass.jpg');
let GDMap = grassTxtLoader.load('grassTexture/GrassDis.jpg');


initLand();
renderer.render(scene, camera)

function initLand(){

let step = 10; //controls the height of bumps// less = more height, more = less height bumps
  //Add Noise
  const perlin = new ImprovedNoise();

  //Land Variables
  const LandController = {
    step: 20,
    Colour: 0x32a852 
  };
  let grassMat = new THREE.MeshStandardMaterial({
    map: GColorMap,
    bumpMap : GHeightMap,
    bumpScale : 2, 
    displacementMap : GDMap,
    displacementScale : 0.3,
    color: LandController.Colour, 
    side: THREE.DoubleSide 
  });

//This creates the land by calling the other functions below
//function ShowLand(){ 
  for(let z = -5; z <= 5; z ++){
	  for(let x = -5; x <= 5; x++){ // controls the length of the terrain
      const red = 50 / 255;
      const green = 168 / 255;
      const blue = 82 / 255;
  	  let plane = createPlane(step, new THREE.Color(red, green, blue));
      // Below makes the plane a random colour. If you are testing this, comment the plane above first.
      //let plane = createPlane(step, Math.random() * 0x7f7f7f + 0x7f7f7f);
      setNoise(plane.geometry, new THREE.Vector2(x, z), 4, 3); //controls how frequent the bumps are
      plane.geometry.rotateX(Math.PI * 0.5);
      plane.position.set(x, 0, z).multiplyScalar(step);
      scene.add(plane);
    }
  }

  

  function createPlane(){
  // Plane Geometry
  PlaneGeometry = new THREE.PlaneGeometry(LandController.step, LandController.step, 100, 100);
  // Plane Material
  
  PlaneMaterial = new THREE.MeshBasicMaterial({color: LandController.Colour, side: THREE.DoubleSide});
  // Plane Mesh
  Plane = new THREE.Mesh(PlaneGeometry, grassMat);
  return Plane;
  }

  
  
  

  //Sets the curves of the land
  function setNoise(geometry, uvShift, multiplier, amplitude){
    let pos = geometry.attributes.position;
    let uv = geometry.attributes.uv;
    let vec2 = new THREE.Vector2();
    for(let i = 0; i < pos.count; i++){
      vec2.fromBufferAttribute(uv, i).add(uvShift).multiplyScalar(multiplier);
      pos.setZ(i, perlin.noise(vec2.x , vec2.y*2, 10) * amplitude);
    }
  }

  //Shows the land on scene
  function ShowLand(){ 
    for(let z = -4; z <= 4; z ++){
      for(let x = -4; x <= 4; x++){
        let Plane = createPlane();
  
        // Below makes the plane a random colour. If you are testing this, comment the plane above first.
        //let plane = createPlane(LandController.step, Math.random() * 0x7f7f7f + 0x7f7f7f);
        
        //Plane.geometry = new THREE.PlaneGeometry(LandController.step, LandController.step, 100, 100);
        //Plane.material = new THREE.MeshBasicMaterial({color: LandController.Colour, side: THREE.DoubleSide});
  
        setNoise(Plane.geometry, new THREE.Vector2(x, z), 2, 3);
        Plane.geometry.rotateX(Math.PI * 0.5);
        Plane.position.set(x, 0, z).multiplyScalar(LandController.step);
        scene.add(Plane)
        //console.log("Added");
      }
    }
    renderer.render(scene, camera);
    //console.log("Rendered")
  }

  // Below is the Pop-up Controls on the screen to do with the land. This can be removed if not wanted:
  //Warning: this adds new planes instead of changing the original plane, It may start to lag over time.

  const LandFolder = gui.addFolder('Land');
  LandFolder.add(LandController, 'step', 0, 50, 1).onChange(ShowLand);
  LandFolder.addColor(LandController, 'Colour').listen().onChange(ShowLand);
  LandFolder.open(); 

  ShowLand();

}
   
/*End Of Land code*/

/*Start of Cloud code*/

// Create a cloud material
var cloudTexture = new THREE.TextureLoader().load('cloud1.png');
var cloudMaterial = new THREE.MeshBasicMaterial({ map: cloudTexture, transparent: true });
cloudMaterial.fog = false;
cloudMaterial.opacity = 0.5;

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