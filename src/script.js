import * as THREE from 'three'
import {FlyControls} from 'three/examples/jsm/controls/FlyControls.js'
import {ImprovedNoise} from 'three/examples/jsm/math/ImprovedNoise.js'
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js'
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader.js'
import * as dat from 'lil-gui'
import {Color} from 'three'
import {Sky} from 'three/examples/jsm/objects/Sky.js';

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
// scene.fog = new THREE.FogExp2(0xcccccc, 2);

//Textures
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particles/5.png')

//Models
var bogGeom = new THREE.BoxGeometry()
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
const count = 5000

const positions = new Float32Array(count * 3) // Times by 3 reason
// each postion is composed of 3 values (x y z)

const colors = new Float32Array(count * 3)

for (let i = 0; i < count * 3; i++) // Times by 3 for same reason above
{
    positions[i] = (Math.random() - 0.5) * 10 // have a random value between -05 and +0.5
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
scene.add(particles)

/*End of Particle code*/

//Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

//Resize
window.addEventListener('resize', () =>
{
    //Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    //Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    //Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

//Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

//Controls
const controls = new FlyControls(camera, canvas)
controls.movementSpeed = 0.1;
controls.lookSpeed = 10;
//controls.autoForward = true;

//Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//Animate
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Update controls
    controls.update(0.5);

    //Render
    renderer.render(scene, camera)

    //Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

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
	const effectController = {
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
		uniforms['turbidity'].value = effectController.turbidity;
		uniforms['rayleigh'].value = effectController.rayleigh;
		uniforms['mieCoefficient'].value = effectController.mieCoefficient;
		uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;

		const polarAngle = THREE.MathUtils.degToRad( 90 - effectController.elevation );
		const equatorAngle = THREE.MathUtils.degToRad( effectController.azimuth );

		sun.setFromSphericalCoords(1, polarAngle, equatorAngle);

		uniforms['sunPosition'].value.copy(sun);

		renderer.toneMappingExposure = effectController.exposure;
		renderer.render(scene, camera);
	}

  // Below is the Pop-up Controls on the screen to do with the sky. This can be removed if not wanted:

	gui.add(effectController, 'turbidity', 0.0, 20.0, 0.1).onChange(ShowSky);
	gui.add(effectController, 'rayleigh', 0.0, 4, 0.001).onChange(ShowSky);
	gui.add(effectController, 'mieCoefficient', 0.0, 0.1, 0.001).onChange(ShowSky);
	gui.add(effectController, 'mieDirectionalG', 0.0, 1, 0.001).onChange(ShowSky);
	gui.add(effectController, 'elevation', 0, 90, 0.1).onChange(ShowSky);
	gui.add(effectController, 'azimuth', - 180, 180, 0.1).onChange(ShowSky);
	gui.add(effectController, 'exposure', 0, 1, 0.0001).onChange(ShowSky);

  //Above is the Pop-up Controls for the sky

	ShowSky();

}

/*End Of Sky code*/

/*Land code starts here*/

THREE.BufferGeometry.prototype.toQuads = ToQuads;

const perlin = new ImprovedNoise();

//"step" affects the gradient of the land
//Smaller step gives more mountains
//Larger step gives more flat land

let step = 10;

// const LandGradient = {
//   step: 10
// };

//This creates the land by calling the other functions below
//function ShowLand(){ 
  for(let z = -4; z <= 4; z ++){
	  for(let x = -4; x <= 4; x++){
      const red = 50 / 255;
      const green = 168 / 255;
      const blue = 82 / 255;
  	  let plane = createPlane(step, new THREE.Color(red, green, blue));
      // Below makes the plane a random colour. If you are testing this, comment the plane above first.
      //let plane = createPlane(step, Math.random() * 0x7f7f7f + 0x7f7f7f);
      setNoise(plane.geometry, new THREE.Vector2(x, z), 2, 3);
      plane.geometry.rotateX(Math.PI * 0.5);
      plane.position.set(x, 0, z).multiplyScalar(step);
      scene.add(plane);
    }
  }
//}

//This function creates the plane that will be the land in the scene
function createPlane(step, color){ 
  var geometry = new THREE.PlaneGeometry(step, step, 100, 100)/*.toQuads()*/;

  //This section makes the plane geometry curved
  var vertices = Math.abs(geometry.attributes.position.array);
  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];
    const distanceFromCenter = Math.abs(vertex.x);
    const curveAmount = Math.sin(distanceFromCenter * 0.5) * 0.5;
    vertex.z = curveAmount;
  }

  let material = new THREE.MeshBasicMaterial({color: color, side: THREE.DoubleSide});
  let plane = new THREE.Mesh(geometry, material);
  return plane;
}

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
function ToQuads() {
	let g = this;
  let p = g.parameters;
  let segmentsX = (g.type == "TorusBufferGeometry" ? p.tubularSegments : p.radialSegments) || p.widthSegments || p.thetaSegments || (p.points.length - 1) || 1;
  let segmentsY = (g.type == "TorusBufferGeometry" ? p.radialSegments : p.tubularSegments) || p.heightSegments || p.phiSegments || p.segments || 1;
  let indices = [];
  for (let i = 0; i < segmentsY + 1; i++) {
    let index11 = 0;
    let index12 = 0;
    for (let j = 0; j < segmentsX; j++) {
      index11 = (segmentsX + 1) * i + j;
      index12 = index11 + 1;
      let index21 = index11;
      let index22 = index11 + (segmentsX + 1);
      indices.push(index11, index12);
      if (index22 < ((segmentsX + 1) * (segmentsY + 1) - 1)) {
        indices.push(index21, index22);
      }
    }
    if ((index12 + segmentsX + 1) <= ((segmentsX + 1) * (segmentsY + 1) - 1)) {
      indices.push(index12, index12 + segmentsX + 1);
    }
  }
  g.setIndex(indices);
  return g;
}

//gui.add(LandGradient, 'step', 0, 100, 1).onChange(ShowLand);

/*End Of Land code*/
