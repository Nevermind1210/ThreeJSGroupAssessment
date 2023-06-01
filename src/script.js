import * as THREE from 'three'
import {FlyControls} from 'three/examples/jsm/controls/FlyControls.js'
import {ImprovedNoise} from 'three/examples/jsm/math/ImprovedNoise.js'
import * as dat from 'lil-gui'
import {Color} from 'three'
import {Sky} from 'three/examples/jsm/objects/Sky.js'
import {Reflector} from 'three/examples/jsm/objects/Reflector.js'

// Debug

//const loader = new GLTFLoader();

const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//////////Lighting/////////
var ambientLight = new THREE.AmbientLight(new THREE.Color(1,1,0),1);

scene.add(ambientLight);

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
// X - Speed Up
// Space - Lock point of view

//Check if any other buttons are pushed
window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);

let spaceKeyPressed = false;
var MoveSpeed = 0.1;
controls.movementSpeed = MoveSpeed;

console.log(MoveSpeed);
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
  //Speed up Movement
  if (event.code === 'KeyX' && MoveSpeed < 0.3){
    spaceKeyPressed = true;
    MoveSpeed += 0.1;
    console.log(MoveSpeed);
    controls.movementSpeed = MoveSpeed;
    
  }
  //If any other button is pressed instead:
  else {
    MoveSpeed = 0.1;
    console.log(MoveSpeed);
    controls.movementSpeed = MoveSpeed;
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

/*Start of Particles code*/

initParticles();
renderer.render(scene, camera);

function initParticles(){

  //List of particles which keeps track of how many particles are loaded on scene
  var particlelist = [];

  //Particle Texture
  const particleTexture = new THREE.TextureLoader().load('/textures/particles/5.png')

  //Particle Geometry
  const partclesGeometry = new THREE.BufferGeometry()

  //Particle Variables
  const ParticleController = {
    count: 30000
  }

  //Removes particles from scene
  function RemoveParticles(){
    for (var i = 0; i < particlelist.length; i++){
      scene.remove(particlelist[i]);
    }
    particlelist = [];
  }

  //Adds the particles on scene
  function AddParticles(){
    const positions = new Float32Array(ParticleController.count * 3) // Times by 3 reason
    // each postion is composed of 3 values (x y z)

    const colors = new Float32Array(ParticleController.count * 3)

    for (let i = 0; i < ParticleController.count * 3; i++) // Times by 3 for same reason above
    {
      positions[i] = (Math.random() - 0.5) * 200 // have a random value between -05 and +0.5
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
    const particles = new THREE.Points(partclesGeometry, particleMaterial);
    particles.position.y = 150;
    scene.add(particles);
    particlelist.push(particles);
  }

  //Below is the GUI controls for the particles
  //The RemoveParticles and AddParticles functions prevent the scene from duplicating and keeping old particles

  const ParticleFolder = gui.addFolder('Particles');
  ParticleFolder.add(ParticleController, 'count', 0,100000,1).onChange(function(){
    RemoveParticles();  //First Remove old particles
    AddParticles();     //Then add new particles
  })

  AddParticles();

}

/*End of Particles code*/

/*Start of Fog Code*/

initFog()
renderer.render(scene, camera)

function initFog(){

  //Fog Variables
  const FogController = {
    Colour: 0xDFE9F3,
    Intensity: 0.1
  };

  //Show the fog on scene
  function ShowFog(){
    scene.fog = new THREE.FogExp2(FogController.Colour, FogController.Intensity); //White fog
  }

  //Below is the GUI Controls for the fog
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

  // Below is the Pop-up Controls on the screen to do with the sky.

  const SkyFolder = gui.addFolder('Sky');
	SkyFolder.add(SkyController, 'turbidity', 0.0, 20.0, 0.1).onChange(ShowSky);
	SkyFolder.add(SkyController, 'rayleigh', 0.0, 4, 0.001).onChange(ShowSky);
	SkyFolder.add(SkyController, 'mieCoefficient', 0.0, 0.1, 0.001).onChange(ShowSky);
	SkyFolder.add(SkyController, 'mieDirectionalG', 0.0, 1, 0.001).onChange(ShowSky);
	SkyFolder.add(SkyController, 'elevation', 0, 90, 0.1).onChange(ShowSky);
	SkyFolder.add(SkyController, 'azimuth', - 180, 180, 0.1).onChange(ShowSky);
	SkyFolder.add(SkyController, 'exposure', 0, 1, 0.0001).onChange(ShowSky);
  SkyFolder.open();

	ShowSky();

}

/*End Of Sky code*/

/*Land code starts here*/

//Land Textures:
let grassTxtLoader = new THREE.TextureLoader()
let GColorMap = grassTxtLoader.load('grassTexture/Grass.jpg');
let GHeightMap  = grassTxtLoader.load('grassTexture/BumpGrass.jpg');
let GDMap = grassTxtLoader.load('grassTexture/GrassDis.jpg');

initLand();
renderer.render(scene, camera)

function initLand(){

  //Add Noise
  const perlin = new ImprovedNoise();

  //This List keeps track of the planes that make up the land
  var landlist = [];

  //Land Variables
  const LandController = {
    step: 20,
    Colour: 0x32a852 
  };

  //The "Step" controls the height of bumps but it also changes the width of the plane
  //Less Step = More height and less width
  //More Step = Less height and more width
  //Something like this:
  //E.G: If step = 1, Then height = 9 and width = 1;
  //E.G: If step = 9, Then height = 1 and width = 9;

  //This creates the plane
  function createPlane(){
  let PlaneGeometry = new THREE.PlaneGeometry(LandController.step, LandController.step, 100, 100);
  let grassMat = new THREE.MeshStandardMaterial({
    map: GColorMap,
    bumpMap : GHeightMap,
    bumpScale : 2, 
    displacementMap : GDMap,
    displacementScale : 0.01, //This scale may reveal holes in the ground, if its a high number
    color: LandController.Colour, 
    side: THREE.DoubleSide 
  });

  let plane = new THREE.Mesh(PlaneGeometry, grassMat);
  return plane;
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

  //Removes the old plane
  function RemoveLand(){
    for (var i = 0; i < landlist.length; i++){
      scene.remove(landlist[i]);
    }
    landlist = [];
  }

  //Adds the land on scene
  function AddLand(){ 
    for(let z = -5; z <= 5; z ++){
      for(let x = -5; x <= 5; x++){
        var Plane = createPlane();
        setNoise(Plane.geometry, new THREE.Vector2(x, z), 4, 3);
        Plane.geometry.rotateX(Math.PI * 0.5);
        Plane.position.set(x, 0, z).multiplyScalar(LandController.step);
        scene.add(Plane)
        landlist.push(Plane)
      }
    }
    renderer.render(scene, camera);
  }

  // Below is the Pop-up Controls on the screen to do with the land. This can be removed if not wanted:
  //The RemoveLand and AddLand functions prevent the scene from duplicating and keeping old planes

  const LandFolder = gui.addFolder('Land');
  LandFolder.add(LandController, 'step', 0, 50, 1).onChange(function(){
    RemoveLand(); //First Remove the old land
    AddLand();    //Then add the new land based
  });
  LandFolder.addColor(LandController, 'Colour').listen().onChange(function(){
    RemoveLand(); //First Remove the old land
    AddLand();    //Then add the new land based
  });
  LandFolder.open(); 

  AddLand();

}
   
/*End Of Land code*/

/*Start of Cloud code*/

initCloud();
renderer.render(scene, camera);

function initCloud(){

  //This List keeps track of the amount of clouds
  var cloudlist = [];

  //Cloud Texture
  var cloudTexture = new THREE.TextureLoader().load('cloud1.png');

  //Cloud Variables
  const CloudController = {
    Amount: 100
  }

  //Removes old clouds
  function RemoveCloud(){
    for (var i = 0; i < cloudlist.length; i++){
      scene.remove(cloudlist[i]);
    }
    cloudlist = [];
  }

  //Adds new clouds
  function AddCloud(){

    // Cloud Material
    var cloudMaterial = new THREE.MeshBasicMaterial({map: cloudTexture, transparent: true, side: THREE.DoubleSide});
    cloudMaterial.fog = false;
    cloudMaterial.opacity = 0.5;

    // Create the needed amount of clouds
    for (var i = 0; i < CloudController.Amount; i++) {

      // Cloud geometry with random width and height
      var randomWidth = Math.random() * 10 + 5; // Random width between 5 and 15
      var randomHeight = Math.random() * 10 + 5; // Random height between 5 and 15
      var cloudGeometry = new THREE.PlaneGeometry(randomWidth, randomHeight);

      var cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);

      // Set random positions in the sky
      cloudMesh.position.x = THREE.MathUtils.randFloat(-300, 300) - 50;
      cloudMesh.position.y = Math.random() * 0 + 30;
      cloudMesh.position.z = THREE.MathUtils.randFloat(-300, 300) - 50;
      cloudMesh.rotation.x = Math.PI / 2;
      cloudMesh.rotation.z = Math.random() * Math.PI * 2;

      var randomScale = Math.random() * 2 + 1; // Randomise the range of scale
      cloudMesh.scale.set(randomScale, randomScale, randomScale);

      scene.add(cloudMesh);
      cloudlist.push(cloudMesh);
    }
    renderer.render(scene, camera);
  }

  //Below is the GUI Controls for the clouds
  //The RemoveCloud and AddCloud functions prevent the scene from duplicating and keeping old clouds

  const CloudFolder = gui.addFolder('Cloud');
  CloudFolder.add(CloudController, 'Amount', 0, 1000, 1).onChange(function(){
    RemoveCloud();  //Remove old clouds first
    AddCloud();     //Then add new cloulds on the amount
  });
  CloudFolder.open(); 

  AddCloud();
}

/*End of Cloud Code*/

/*Start of Tree Code*/

initTree();
renderer.render(scene, camera);

function initTree(){

  //Tree Variables
  const TreeController = {
    treeCount: 500,
    minRadius: 0.2,
    maxRadius: 0.4,
    minHeight: 1.5,
    maxHeight: 5,
    minSize: 0.3,
    maxSize: 1,
    areaSize: 200
  }

  //This list keeps track of the trees that are loaded on the scene
  var treelist = [];

  //Wood Textures
  var stumpTxtLoader = new THREE.TextureLoader();
  var colorMap = stumpTxtLoader.load('stumpTexture/Wood_Bark_006_basecolor.jpg');
  var NormalMap = stumpTxtLoader.load('stumpTexture/Wood_Bark_006_normal.jpg');
  var RoughnessMap = stumpTxtLoader.load('stumpTexture/Wood_Bark_006_roughness.jpg');
  var AOMap = stumpTxtLoader.load('stumpTexture/Wood_Bark_006_ambientOcclusion.jpg');
  var HeightMap = stumpTxtLoader.load('stumpTexture/Wood_Bark_006_height.png');
  var Dmap = stumpTxtLoader.load('stumpTexture/Wood_Bark_006_Displacement.jpg');

  //Wood Material
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

  //Leaves Textures
  var leavesTxtLoader = new THREE.TextureLoader();
  var LcolorMap = leavesTxtLoader.load('leavesTexture/Stylized_Leaves_002_basecolor.jpg');
  var LNormalMap = leavesTxtLoader.load('leavesTexture/Stylized_Leaves_002_normal.jpg');
  var LRoughnessMap = leavesTxtLoader.load('leavesTexture/Stylized_Leaves_002_roughness.jpg');
  var LAOMap = leavesTxtLoader.load('leavesTexture/Stylized_Leaves_002_ambientOcclusion.jpg');
  var LHeightMap = leavesTxtLoader.load('leavesTexture/Stylized_Leaves_002_height.png');
  var LDMap = leavesTxtLoader.load('leavesTexture/Stylized_Leaves_Displacement.jpg');

  //Leaves Material
  var leavesMat = new THREE.MeshStandardMaterial({
    map : LcolorMap,
    normalMap : LNormalMap,
    roughnessMap : LRoughnessMap,
    aoMap : LAOMap,
    bumpMap : LHeightMap,
    bumpScale : 1.3
  });


  //Removes old trees from the scene
  function RemoveTrees(){
    for (var i = 0; i < treelist.length; i++){
      scene.remove(treelist[i]);
    }
    treelist = [];
  }

  //Creates and adds trees onto the scene
  function CreateTrees(){
    for (let i = 0; i < TreeController.treeCount; i++){
      const height = Math.random() * (TreeController.maxHeight - TreeController.minHeight) + TreeController.minHeight;
      const width =  Math.random() * (TreeController.maxSize - TreeController.minSize) + TreeController.minSize;
      const radius = Math.random() * (TreeController.maxRadius - TreeController.minRadius) + TreeController.minRadius;

      var xAxis = (Math.random() - 0.5) * TreeController.areaSize;
      var zAxis = (Math.random() - 0.5) * TreeController.areaSize;

      // Create the cone geometry for the leaves
      var coneGeometry = new THREE.ConeGeometry(radius + 1, height+1, 170);
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
      treelist.push(tree);
    }
  }

  //Below is the GUI controls for the trees
  //The RemoveTrees and CreateTrees functions prevent the scene from duplicating and keeping old trees

  const TreeFolder = gui.addFolder('Trees');
  TreeFolder.add(TreeController, 'treeCount', 0, 1000, 1).onChange(function(){
    RemoveTrees();
    CreateTrees();
  })
  TreeFolder.add(TreeController, 'minRadius', 0.05, 0.15, 0.001).onChange(function(){
    RemoveTrees();
    CreateTrees();
  })
  TreeFolder.add(TreeController, 'maxRadius', 0.35, 0.45, 0.001).onChange(function(){
    RemoveTrees();
    CreateTrees();
  })
  TreeFolder.add(TreeController, 'minHeight', 1.25, 1.75, 0.01).onChange(function(){
    RemoveTrees();
    CreateTrees();
  })
  TreeFolder.add(TreeController, 'maxHeight', 1.75, 2.25, 0.01).onChange(function(){
    RemoveTrees();
    CreateTrees();
  })
  TreeFolder.add(TreeController, 'minSize', 0.0075, 0.0125, 0.001).onChange(function(){
    RemoveTrees();
    CreateTrees();
  })
  TreeFolder.add(TreeController, 'maxSize', 0.75, 1.25, 0.001).onChange(function(){
    RemoveTrees();
    CreateTrees();
  })
  TreeFolder.add(TreeController, 'areaSize', 0, 300, 1).onChange(function(){
    RemoveTrees();
    CreateTrees();
  })

  CreateTrees();

}

/*End Of Tree Code*/

/*Start of Mirror Code*/

//Uncomment below to spawn one mirror in the scene, It may lag the scene though

initMirror()
renderer.render(scene, camera);




function initMirror(){
  
  var backRot = Math.PI;
  var leftRot = Math.PI/2;
  var rightRot = Math.PI * 1.5;
  
  

  function AddMirror(Rotate, xPos, zPos){
    var MirrorGeometry = new THREE.PlaneGeometry(220,100);
    var Mirror = new Reflector(MirrorGeometry, 
      {
      
       clipBias: 0.003,
       textureWidth: window.innerWidth * window.devicePixelRatio,
       textureHeight: window.innerHeight * window.devicePixelRatio,
       color: 0x889999
     } );
     
     Mirror.position.y = 0;
     Mirror.position.x = xPos;
     Mirror.position.z = zPos;
     Mirror.rotation.y = Rotate;
     scene.add( Mirror );
  }

  AddMirror(backRot, 0, 110);
  AddMirror(leftRot, -110, 0);
  // AddMirror(rightRot, 110, 0);
  // AddMirror(rightRot, rightPos, 0);
}

/*End of Mirror Code*/