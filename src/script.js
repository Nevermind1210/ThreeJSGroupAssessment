import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { Color } from 'three'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particles/5.png')

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

partclesGeometry.setAttribute('position', new 
THREE.BufferAttribute(positions, 3)) 
partclesGeometry.setAttribute('color', new
THREE.BufferAttribute(colors, 3))
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