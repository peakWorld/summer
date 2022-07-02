/*
 * @Author: lyf
 * @Date: 2021-02-01 19:26:11
 * @LastEditors: lyf
 * @LastEditTime: 2021-09-18 14:15:20
 * @Description: 雾化 和 选中
 * @FilePath: /3d-case/src/examples-three/case3/index.tsx
 */
import { useEffect, useRef } from 'react'
import { createStats, randInt } from 'utils/help'
// import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import {
	AmbientLight,
	BoxGeometry,
	Color,
	Fog,
	Group,
	Mesh,
	MeshLambertMaterial,
	PerspectiveCamera,
	Raycaster,
	Scene,
	Vector2,
	WebGLRenderer
} from 'three'

function ThreeCase3() {
	const reference = useRef<HTMLDivElement>(null)

	useEffect(() => {
		// fps展示
		const dom = reference.current as HTMLElement
		const stats = createStats({ dom })
		const w = dom.offsetWidth
		const h = dom.offsetHeight

		// 控制操作
		// const gui = new GUI();
		// gui.addFolder('操作');
		// gui.add(controller, 'addCube');
		// gui.add(controller, 'delCube');
		// gui.add(controller, 'reset');

		// 渲染
		const renderer = new WebGLRenderer({ antialias: true })
		renderer.setSize(w, h) // 屏幕宽度
		renderer.setClearColor(new Color(0xee_ee_ee)) // 屏幕背景
		renderer.setPixelRatio(window.devicePixelRatio) // 设置设备像素比。避免HiDPI设备上绘图模糊
		dom.append(renderer.domElement)

		// 像机
		const camera = new PerspectiveCamera(75, w / h, 0.1, 1000)
		camera.position.set(-20, 30, 20)
		camera.up.set(0, 1, 0)
		camera.lookAt(0, 0, 0)

		// 场景
		const scene = new Scene()
		scene.fog = new Fog(0xff_ff_ff, 0.1, 40) // 雾化

		// 光照
		const light = new AmbientLight(0xff_ff_ff)
		scene.add(light)

		const group = new Group()
		scene.add(group)

		function addCube() {
			const geom = new BoxGeometry(randInt(3), randInt(3), randInt(3))
			const mesh = new Mesh(
				geom,
				new MeshLambertMaterial({ color: Math.random() * 0xff_ff_ff })
			)

			mesh.position.x = -30 + randInt(60)
			mesh.position.y = randInt(5)
			mesh.position.z = -20 + randInt(40)

			group.add(mesh)
		}

		function delCube() {
			const { length } = group.children
			const index = randInt(length) - 1
			group.remove(group.children[index])
		}

		const controller = {
			cache: {} as Group,
			addCube,
			delCube,
			reset() {
				group.children = []
				group.copy(controller.cache)
			}
		}

		// 添加100个物体
		for (let index = 0; index < 100; index += 1) {
			addCube()
		}

		// 缓存数据
		controller.cache = group.clone() as Group

		function animate() {
			renderer.render(scene, camera)
			stats.update()

			// 动画
			scene.traverse(e => {
				if (e instanceof Mesh) {
					e.position.x += 0.01
					e.position.y += 0.01
					e.position.z += 0.01
				}
			})

			requestAnimationFrame(animate)
		}

		animate()

		// 选中物体
		const raycaster = new Raycaster()

		// 坐标归一化
		function normalVector(x: number, y: number) {
			const nx = (x / w) * 2 - 1
			const ny = -(y / h) * 2 + 1
			return new Vector2(nx, ny)
		}

		const handleTouchStart = (event_: TouchEvent) => {
			const { clientX, clientY } = event_.touches[0]
			raycaster.setFromCamera(normalVector(clientX, clientY), camera)
			const intersects = raycaster.intersectObjects(scene.children, true)
			if (intersects.length > 0 && intersects[0].object.type === 'Mesh') {
				const mesh = intersects[0].object as Mesh
				const material = mesh.material as MeshLambertMaterial
				material.color.setHex(0xff_00_00)
				console.log(mesh)
			}
		}

		window.addEventListener('touchstart', handleTouchStart, false)

		return () => {
			const gui = document.querySelector('.dg.ac')
			if (gui) gui.remove()
		}
	}, [])

	return <div ref={reference} className='render-root' />
}

export default ThreeCase3
