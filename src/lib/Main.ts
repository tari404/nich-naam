import { initRenderer } from './utils'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'

import customFragmentShader from './custom.glsl.fs'

const ball = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1, 0.15, 200, 16, 2, 5),
  // new THREE.SphereGeometry(1, 32, 16),
  // new THREE.MeshStandardMaterial({
  //   color: 0xd0d8dc,
  //   metalness: 0.96,
  //   roughness: 0.1,
  // })
  new THREE.ShaderMaterial({
    uniforms: {
      ...THREE.ShaderLib.standard.uniforms,
      time: { value: 0 },
    },
    vertexShader: THREE.ShaderLib.standard.vertexShader,
    fragmentShader: customFragmentShader,
    lights: true,
    fog: true,
  })
)

window.THREE = THREE

export default class MainStage {
  private width: number
  private height: number

  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera

  private composer: EffectComposer

  private skip = false

  private raf = 0

  constructor() {
    this.renderer = initRenderer()
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      2000
    )
    this.camera.position.set(0, 3, 4)
    this.camera.lookAt(0, 0, 0)

    this.width = window.innerWidth
    this.height = window.innerHeight

    const composer = new EffectComposer(this.renderer)
    const renderPass = new RenderPass(this.scene, this.camera)
    composer.addPass(renderPass)

    this.composer = composer
  }

  public get domElement(): HTMLCanvasElement {
    return this.renderer.domElement
  }

  public start(): void {
    this.raf = requestAnimationFrame((time) => {
      this.render(time)
    })
  }

  public dispose(): void {
    cancelAnimationFrame(this.raf)
    this.renderer.dispose()
  }

  public initTestScene() {
    this.scene.add(ball)
    ball.castShadow = true
    ball.receiveShadow = true

    const envLight = new THREE.HemisphereLight(0xffffee, 0x484880, 0.4)
    this.scene.add(envLight)
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.4)
    mainLight.castShadow = true
    mainLight.shadow.mapSize.set(4096, 4096)
    mainLight.position.set(0.54, 0.81, -0.2)
    const k = window.innerHeight / window.innerWidth
    const x = 1.8584 + k * 1.4779 + 0.1
    const y = 1.0421 + k * 3.9332 + 0.1
    mainLight.shadow.camera.left = -y
    mainLight.shadow.camera.right = y
    mainLight.shadow.camera.bottom = -x
    mainLight.shadow.camera.top = x
    mainLight.shadow.camera.near = -100
    mainLight.shadow.camera.far = 100
    this.scene.add(mainLight)
  }

  public resize(width: number, height: number) {
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(width, height)

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.width = width
    this.height = height
  }

  public record(ms = 5000) {
    const types = [
      ['video/webm', '.webm'],
      ['video/quicktime', '.mov'],
      ['video/ogg', '.ogg'],
      ['video/mp4', '.mp4'],
    ]

    const selected = types.find((item) =>
      MediaRecorder.isTypeSupported(item[0])
    )

    if (!selected) {
      return false
    }
    const [mimeType, suffix] = selected

    const recordedChunks: BlobPart[] = []

    const stream = this.domElement.captureStream(30)

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType,
    })

    mediaRecorder.start(0)
    setTimeout(() => {
      mediaRecorder.stop()
    }, ms)

    mediaRecorder.ondataavailable = function (e) {
      recordedChunks.push(e.data)
    }

    mediaRecorder.onstop = function () {
      const blob = new Blob(recordedChunks, {
        type: mimeType,
      })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.download = 'record' + suffix
      a.href = url
      a.dispatchEvent(new MouseEvent('click'))
    }

    return suffix
  }

  private update(time: number) {
    // const x = Math.sin(time / 1000) * 4
    // const z = Math.cos(time / 1000) * 4
    // this.camera.position.set(x, 3, z)
    // this.camera.lookAt(0, 0, 0)
    ball.rotateY(0.02)
    ball.rotateX(0.01)

    ball.material.uniforms.time.value = time / 1000
  }

  private render(time: number) {
    this.update(time)
    // this.renderer.render(this.scene, this.camera)
    if (!this.skip) {
      this.composer.render()
    }
    this.skip = !this.skip
    this.raf = requestAnimationFrame((time) => {
      this.render(time)
    })
  }
}
