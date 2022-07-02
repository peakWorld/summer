/*
 * @Author: lyf
 * @Date: 2021-03-12 10:29:00
 * @LastEditors: lyf
 * @LastEditTime: 2021-09-18 14:18:36
 * @Description: 碰撞
 * @FilePath: /3d-case/src/projects-three/collision/index.tsx
 */
import type { ReactElement } from 'react'
import { useEffect, useRef } from 'react'
import {
	AmbientLight,
	BoxGeometry,
	Clock,
	Color,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
	SphereGeometry,
	Vector3,
	WebGLRenderer
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { createStats } from 'utils/help'
import Utils from './utils'

function Collision(): ReactElement {
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
		camera.position.set(0, 0, 300)
		camera.up.set(0, 1, 0)
		camera.lookAt(0, 0, 0)
		const control = new OrbitControls(camera, renderer.domElement)

		// 场景
		const scene = new Scene()

		// 光线
		const ambient = new AmbientLight(0x40_40_40)
		scene.add(ambient)

		// 物体
		const length = 50
		const boxes: Mesh[] = []

		const box = new Mesh(
			new BoxGeometry(length * 2, length * 2, length * 2),
			new MeshBasicMaterial({ wireframe: true })
		)
		scene.add(box)

		for (let index = 0; index < 200; index += 1) {
			const mesh = new Mesh(
				new SphereGeometry(2, 24, 24),
				new MeshBasicMaterial()
			)
			const x = Math.random() * 96 - 48
			const y = Math.random() * 96 - 48
			const z = Math.random() * 96 - 48
			mesh.position.set(x, y, z)
			mesh.name = 'cube'
			boxes.push(mesh)
			scene.add(mesh)
		}

		Utils.setBoundingBox(length, boxes)

		const clock = new Clock()
		// 动画
		function animate(): void {
			const delta = clock.getDelta()
			stats.update()
			control.update()
			renderer.render(scene, camera)

			scene.traverse(object => {
				if (object.name === 'cube') {
					const direction = new Vector3(
						Math.random() > 0.5 ? 1 : -1,
						Math.random() > 0.5 ? 1 : -1,
						Math.random() > 0.5 ? 1 : -1
					)
					object.translateOnAxis(
						direction.normalize(),
						Math.sin(delta) * Math.random() + Math.cos(delta) * Math.random()
					)
				}
			})

			const crossBoxes = Utils.render(boxes)
			if (crossBoxes.length > 0) {
				for (const cBox of crossBoxes) {
					const material = cBox.material as MeshBasicMaterial
					material.color.setHex(0xff_ff_ff * Math.random())
				}
			}

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

export default Collision
