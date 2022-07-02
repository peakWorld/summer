/*
 * @Author: lyf
 * @Date: 2021-03-09 19:11:35
 * @LastEditors: lyf
 * @LastEditTime: 2021-09-18 14:17:34
 * @Description: 物理特效
 * @FilePath: /3d-case/src/examples-three/case7/index.tsx
 */
import { useEffect, useRef } from 'react'
import {
	AmbientLight,
	AxesHelper,
	Color,
	PerspectiveCamera,
	Scene,
	WebGLRenderer
} from 'three'
import { createStats } from 'utils/help'
import Worker from '../../../workers/three/case8?worker'

const worker = new Worker()

function ThreeCase7() {
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
		camera.position.set(-40, 40, 30)
		camera.up.set(0, 1, 0)
		camera.lookAt(0, 0, 0)

		// 场景
		const scene = new Scene()
		const axesHelper = new AxesHelper(20)
		scene.add(axesHelper)

		// 光线
		const ambient = new AmbientLight(0x40_40_40)
		scene.add(ambient)

		// 物体
		worker.postMessage('haha', [])

		worker.addEventListener('message', dd => {
			console.log(dd)
		})

		// 动画
		function animate() {
			renderer.render(scene, camera)
			stats.update()

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

export default ThreeCase7
