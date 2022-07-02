/*
 * @Author: lyf
 * @Date: 2021-02-02 16:54:55
 * @LastEditors: lyf
 * @LastEditTime: 2021-09-18 14:14:16
 * @Description: 基本要素、动画、阴影
 * @FilePath: /3d-case/src/examples-three/case1/index.tsx
 */
import { useEffect, useRef } from 'react'
import {
	AmbientLight,
	AxesHelper,
	BoxGeometry,
	Color,
	Mesh,
	MeshLambertMaterial,
	PCFSoftShadowMap,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	SphereGeometry,
	SpotLight,
	WebGLRenderer
} from 'three'
import { createStats } from 'utils/help'

function ThreeCase1() {
	const reference = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const dom = reference.current as HTMLDivElement
		const stats = createStats({ dom })
		const w = dom.offsetWidth
		const h = dom.offsetHeight
		let step = 0

		// 渲染
		const renderer = new WebGLRenderer({
			antialias: true
		})
		renderer.setSize(w, h)
		renderer.setClearColor(new Color(0xee_ee_ee), 0.5)
		renderer.setPixelRatio(window.devicePixelRatio)
		// 开启阴影
		renderer.shadowMap.enabled = true
		renderer.shadowMap.type = PCFSoftShadowMap
		dom.append(renderer.domElement)

		// 相机
		const camera = new PerspectiveCamera(55, w / h, 0.1, 1000)
		camera.position.set(-40, 40, 30)
		camera.up.set(0, 1, 0)
		camera.lookAt(0, 0, 0)

		// 场景
		const scene = new Scene()
		window.scene = scene
		const axesHelper = new AxesHelper(20)
		scene.add(axesHelper)

		// 光线
		const ambient = new AmbientLight(0x40_40_40)
		const spot = new SpotLight(0xff_ff_ff)
		spot.position.set(30, 60, 10)
		spot.castShadow = true
		// 值越大(必须为2的倍数), 阴影质量越好
		spot.shadow.mapSize.width = 2048
		spot.shadow.mapSize.height = 2048
		scene.add(ambient)
		scene.add(spot)

		// 物体导入
		const plane = new Mesh(
			new PlaneGeometry(60, 20, 1, 1),
			new MeshLambertMaterial({ color: 0xcc_cc_cc })
		)
		plane.rotateX(-Math.PI / 2)
		plane.position.set(15, 0, 0)
		plane.name = 'plane'
		plane.receiveShadow = true

		const box = new Mesh(
			new BoxGeometry(4, 4, 4),
			new MeshLambertMaterial({ color: 0xff_00_00 })
		)
		box.position.set(-4, 3, 0)
		box.name = 'box'
		box.castShadow = true

		const sphere = new Mesh(
			new SphereGeometry(4, 20, 20),
			new MeshLambertMaterial({ color: 0x77_77_ff })
		)
		sphere.position.set(20, 4, 2)
		sphere.name = 'sphere'
		sphere.castShadow = true

		scene.add(box)
		scene.add(plane)
		scene.add(sphere)

		function animate() {
			renderer.render(scene, camera)
			stats.update()

			box.rotation.x += 0.02
			box.rotation.y += 0.02
			box.rotation.z += 0.02

			step += 0.02
			sphere.position.x = 20 + 10 * Math.cos(step)
			sphere.position.y = 2 + 10 * Math.abs(Math.sin(step))

			requestAnimationFrame(animate)
		}

		animate()

		return () => {
			const gui = document.querySelector('.dg.ac')
			if (gui) gui.remove()
		}
	}, [])

	return <div ref={reference} id='ThreeCase1' className='render-root' />
}

export default ThreeCase1
