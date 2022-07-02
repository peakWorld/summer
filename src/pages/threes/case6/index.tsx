/*
 * @Author: lyf
 * @Date: 2021-02-19 19:28:39
 * @LastEditors: lyf
 * @LastEditTime: 2021-09-18 14:17:10
 * @Description: 后期处理
 * @FilePath: /3d-case/src/examples-three/case6/index.tsx
 */
import { useEffect, useRef } from 'react'
import {
	AmbientLight,
	Color,
	Mesh,
	MeshPhongMaterial,
	PerspectiveCamera,
	Scene,
	SphereGeometry,
	TextureLoader,
	WebGLRenderer
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { createStats } from 'utils/help'
// import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
// import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass';
import { FilmShader } from 'three/examples/jsm/shaders/FilmShader'

function ThreeCase6() {
	const reference = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const dom = reference.current as HTMLDivElement
		const stats = createStats({ dom })
		const w = dom.offsetWidth
		const h = dom.offsetHeight

		// 渲染器
		const renderer = new WebGLRenderer({ antialias: true })
		renderer.setSize(w, h)
		renderer.setClearColor(new Color(0xee_ee_ee), 0.5)
		renderer.setPixelRatio(window.devicePixelRatio)
		dom.append(renderer.domElement)

		// 相机
		const camera = new PerspectiveCamera(55, w / h, 0.1, 1000)
		camera.position.set(40, 40, 40)
		camera.up.set(0, 1, 0)
		camera.lookAt(0, 0, 0)
		const control = new OrbitControls(camera, renderer.domElement)

		// 场景
		const scene = new Scene()
		// const axesHelper = new AxesHelper( 20 );
		// scene.add( axesHelper )

		// 光线
		const ambient = new AmbientLight(0xff_ff_ff)
		scene.add(ambient)

		// 物体
		const loader = new TextureLoader()
		const map = loader.load('/assets/webgl/img/three-case7/Earth.png')
		const specularMap = loader.load(
			'/assets/webgl/img/three-case7/EarthSpec.png'
		)
		const normalMap = loader.load(
			'/assets/webgl/img/three-case7/EarthNormal.png'
		)
		const geometry = new SphereGeometry(10, 40, 40)
		const material = new MeshPhongMaterial({
			map,
			normalMap,
			specularMap,
			specular: new Color(0x44_44_aa)
		})
		const mesh = new Mesh(geometry, material)
		scene.add(mesh)

		// 后期处理
		const composer = new EffectComposer(renderer)
		// 1. 此处使用帧缓冲, 实现屏后渲染. 生成纹理对象, 进行后期处理
		const renderPass = new RenderPass(scene, camera)
		composer.addPass(renderPass)
		// 2. 使用电影特效
		// 方式一 直接使用pass
		// const filmPass = new FilmPass(0.8, 0.325, 256)
		// 方式二 使用ShaderPass来生成pass(需要引入对应的shader代码)
		const filmPass = new ShaderPass(FilmShader)
		filmPass.uniforms.nIntensity.value = 0.8
		filmPass.uniforms.sIntensity.value = 0.325
		filmPass.uniforms.sCount.value = 256
		composer.addPass(filmPass)
		// bloomPass没有renderToScreen属性,无法显示在屏幕,
		// 所以用new THREE.ShaderPass(THREE.CopyShader),将纹理展示在屏幕
		// const bloomPass = new BloomPass(3, 25, 5.0, 256)
		// composer.addPass(bloomPass)
		// composer.addPass(composer.copyPass)

		// 动画
		function animate() {
			stats.update()
			control.update()

			composer.render()

			requestAnimationFrame(animate)
		}

		animate()

		return () => {
			const gui = document.querySelector('.dg.ac')
			if (gui) gui.remove()
		}
	}, [])

	return <div ref={reference} className='render-root' />
}

export default ThreeCase6
