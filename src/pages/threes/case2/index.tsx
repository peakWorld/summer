/*
 * @Author: lyf
 * @Date: 2021-02-19 19:28:39
 * @LastEditors: lyf
 * @LastEditTime: 2021-09-18 14:14:43
 * @Description: 多材质、自定义shader 和 分屏
 * @FilePath: /3d-case/src/examples-three/case2/index.tsx
 */
import { useEffect, useRef } from 'react'
import {
	AmbientLight,
	AxesHelper,
	BoxGeometry,
	BufferAttribute,
	BufferGeometry,
	Color,
	DirectionalLight,
	Mesh,
	MeshBasicMaterial,
	MeshLambertMaterial,
	MeshNormalMaterial,
	PerspectiveCamera,
	Scene,
	ShaderMaterial,
	SphereGeometry,
	Vector3,
	WebGLRenderer
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper'
import { createStats } from 'utils/help'
import { color, fShader, indexData, normal, position, vShader } from './data'

function ThreeCase2() {
	const reference = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const dom = reference.current as HTMLDivElement
		const stats = createStats({ dom })
		const w = dom.offsetWidth
		const h = dom.offsetHeight
		const hh = Math.ceil(h / 2)

		// 渲染器
		const renderer = new WebGLRenderer({ antialias: true })
		renderer.setSize(w, h)
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.setScissorTest(true) // 开启剪裁检测
		dom.append(renderer.domElement)

		function sceneTop() {
			// 相机
			const camera = new PerspectiveCamera(45, w / hh, 0.1, 1000)
			camera.position.set(30, 30, 30)
			camera.up.set(0, 1, 0)
			camera.lookAt(0, 0, 0)
			const control = new OrbitControls(camera, renderer.domElement)

			// 场景
			const scene = new Scene()
			const axesHelper = new AxesHelper(20)
			scene.add(axesHelper)

			// 光线
			const ambient = new AmbientLight(0x40_40_40)
			scene.add(ambient)

			// 物体
			const box = new Mesh(new BoxGeometry(4, 4, 4), [
				new MeshLambertMaterial({ color: 0xff_ff_00 }),
				new MeshBasicMaterial({ color: 0xff_00_00 }), // basic材质不受光照影响
				new MeshBasicMaterial({ color: 0xff_ff_ff }),
				new MeshBasicMaterial({ color: 0x00_ff_00 }),
				new MeshBasicMaterial({ color: 0x00_ff_ff }),
				new MeshBasicMaterial({ color: 0x00_00_00 })
			])
			box.position.set(-6, 0, 0)
			scene.add(box)

			const geometry = new SphereGeometry(4, 20, 20)
			const material = new MeshNormalMaterial()
			const sphere = new Mesh(geometry, material)
			sphere.position.set(6, 0, 0)
			scene.add(sphere)
			const helper = new VertexNormalsHelper(sphere, 2, 0x00_ff_00)
			scene.add(helper)

			return { scene, camera, control, helper }
		}

		function sceneBottom() {
			// 相机
			const camera = new PerspectiveCamera(45, w / hh, 0.1, 1000)
			camera.position.set(0, 0, 10)
			camera.up.set(0, 1, 0)
			camera.lookAt(0, 0, 0)
			const control = new OrbitControls(camera, renderer.domElement)

			// 场景
			const scene = new Scene()
			// const axesHelper = new AxesHelper( 20 );
			// scene.add( axesHelper );

			// 光线
			const ambient = new AmbientLight(0x40_40_40)
			scene.add(ambient)
			const light = new DirectionalLight(0xff_ff_ff)
			light.position.set(5, 5, 5)
			scene.add(light)

			// 物体
			const geometry = new BufferGeometry()
			geometry
				.setAttribute('position', new BufferAttribute(position, 3))
				.setAttribute('color', new BufferAttribute(color, 3))
				.setAttribute('normal', new BufferAttribute(normal, 3))
				.setIndex(new BufferAttribute(indexData, 1))
			// geometry.index = new Uint16BufferAttribute(indexData, 1)

			// 自定shader
			const meterial = new ShaderMaterial({
				uniforms: {
					light: {
						value: {
							color: new Color(0xff_ff_ff),
							position: new Vector3(1, 1, 1)
						}
					}
				},
				vertexColors: true,
				vertexShader: vShader,
				fragmentShader: fShader
			})
			const box1 = new Mesh(geometry, meterial)
			box1.position.set(-2, 0, 0)
			box1.name = 'box-1'
			const box2 = new Mesh(
				geometry,
				new MeshLambertMaterial({ color: 0xff_ff_00 })
			)
			box2.position.set(2, 0, 0)
			box2.name = 'box-2'

			scene.add(box1)
			scene.add(box2)
			return { scene, camera, control }
		}

		const top = sceneTop()
		const bottom = sceneBottom()

		// 动画
		function animate() {
			stats.update()
			top.control.update()
			top.helper.update()
			bottom.control.update()

			// 渲染上半屏
			renderer.setScissor(0, hh, w, hh)
			renderer.setViewport(0, hh, w, hh)
			renderer.setClearColor(0xbc_d4_8f, 1)
			renderer.render(top.scene, top.camera)

			// 渲染下半屏
			renderer.setScissor(0, 0, w, hh)
			renderer.setViewport(0, 0, w, hh)
			renderer.setClearColor(0x8f_bc_d4, 1)
			const box1 = bottom.scene.getObjectByName('box-1')
			if (box1) {
				box1.rotation.x += 0.01
				box1.rotation.y += 0.01
				box1.rotation.z += 0.01
			}

			const box2 = bottom.scene.getObjectByName('box-2')
			if (box2) {
				box2.rotation.x += 0.02
				box2.rotation.y += 0.02
				box2.rotation.z += 0.02
			}
			renderer.render(bottom.scene, bottom.camera)

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

export default ThreeCase2
