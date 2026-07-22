import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { STLLoader } from 'three/addons/loaders/STLLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

function fitCameraToObject(camera, object, controls) {
  const box = new THREE.Box3().setFromObject(object)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  const scale = 2 / maxDim
  object.scale.setScalar(scale)
  object.position.sub(center.multiplyScalar(scale))
  object.position.y -= (size.y * scale) / 2
}

function getModelExtension(url) {
  return url.split('.').pop().toLowerCase().split('?')[0]
}

function loadModel(url, scene) {
  const ext = getModelExtension(url)

  if (ext === 'glb' || ext === 'gltf') {
    return new Promise((resolve, reject) => {
      new GLTFLoader().load(url,
        (gltf) => {
          fitCameraToObject(null, gltf.scene, null)
          scene.add(gltf.scene)
          resolve(gltf.scene)
        },
        undefined,
        reject
      )
    })
  }

  if (ext === 'stl') {
    return new Promise((resolve, reject) => {
      new STLLoader().load(url,
        (geometry) => {
          const material = new THREE.MeshStandardMaterial({
            color: 0x6c5ce7,
            metalness: 0.3,
            roughness: 0.6,
          })
          const mesh = new THREE.Mesh(geometry, material)
          fitCameraToObject(null, mesh, null)
          scene.add(mesh)
          resolve(mesh)
        },
        undefined,
        reject
      )
    })
  }

  if (ext === 'obj') {
    return new Promise((resolve, reject) => {
      new OBJLoader().load(url,
        (obj) => {
          obj.traverse((child) => {
            if (child.isMesh) {
              child.material = new THREE.MeshStandardMaterial({
                color: 0x6c5ce7,
                metalness: 0.3,
                roughness: 0.6,
              })
            }
          })
          fitCameraToObject(null, obj, null)
          scene.add(obj)
          resolve(obj)
        },
        undefined,
        reject
      )
    })
  }

  return Promise.reject(new Error('Unsupported format'))
}

export default function ModelViewer({ url }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !url) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x12121a)

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 1, 3)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enablePan = false
    controls.minDistance = 1
    controls.maxDistance = 10
    controls.autoRotate = true
    controls.autoRotateSpeed = 2

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5)
    dirLight.position.set(5, 5, 5)
    scene.add(dirLight)

    const dirLight2 = new THREE.DirectionalLight(0x6c5ce7, 0.8)
    dirLight2.position.set(-3, 2, -3)
    scene.add(dirLight2)

    const pointLight = new THREE.PointLight(0x00cec9, 0.5)
    pointLight.position.set(0, 3, 0)
    scene.add(pointLight)

    const gridHelper = new THREE.GridHelper(10, 20, 0x2a2a3e, 0x1a1a2e)
    scene.add(gridHelper)

    loadModel(url, scene).catch(err => console.error('Error loading model:', err))

    let animId
    const animate = () => {
      animId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      controls.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [url])

  return (
    <div
      ref={containerRef}
      onContextMenu={e => e.preventDefault()}
      style={{
        width: '100%',
        height: '400px',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        cursor: 'grab',
        userSelect: 'none',
      }}
    />
  )
}
