import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {ImprovedNoise} from 'three/examples/jsm/math/ImprovedNoise.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'lil-gui'
import { Color } from 'three'

import { Sky } from 'three/examples/jsm/objects/Sky.js';

/**
 * Base
 */
// Debug
const loader = new GLTFLoader();
const gui = new dat.GUI();
const perlin = new ImprovedNoise();
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Textures
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particles/5.png')

//Models


loader.load('/assets/barrel.glb',
	// called when the resource is loaded
	function ( gltf ) {

		scene.add( gltf.scene );

		 

	})
/**
 * Particles
 */

// Geometry
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



//Material
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

// Points
const particles = new THREE.Points(partclesGeometry, particleMaterial)
scene.add(particles)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
//----------------------------------
window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

// Start Of the Sky code
let sky, sun;

initSky();
renderer.render(scene, camera)

function initSky(){

	// Add Sky
	sky = new Sky();
	sky.scale.setScalar(450000);
	scene.add(sky);

	sun = new THREE.Vector3();

	// Sky Variables
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

    // Below is the Pop-up Controls on the screen to do with the sky. This can be removed later:

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
// End Of Sky