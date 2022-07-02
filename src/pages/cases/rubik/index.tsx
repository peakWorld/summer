/*
 * @Author: lyf
 * @Date: 2021-02-01 10:49:32
 * @LastEditors: lyf
 * @LastEditTime: 2021-09-18 14:18:50
 * @Description: 3D魔方
 * @FilePath: /3d-case/src/projects-three/rubik/index.tsx
 */
import type { ReactElement } from 'react'
import { useEffect, useRef } from 'react'
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { createStats } from 'utils/help'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Rubik from './Rubik'

function RubikCase(): ReactElement {
	const reference = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const dom = reference.current as HTMLDivElement
		const stats = createStats({ dom })
		const w = dom.offsetWidth
		const h = dom.offsetHeight
		const rubik = new Rubik()

		// 渲染
		const renderer = new WebGLRenderer({ antialias: true })
		renderer.setSize(w, h)
		renderer.setClearColor('#fff')
		renderer.setPixelRatio(window.devicePixelRatio)
		dom.append(renderer.domElement)

		// 相机
		const camera = new PerspectiveCamera(45, w / h, 0.1, 2000)
		camera.position.set(350, 350, 300)
		camera.up.set(0, 1, 0)
		camera.lookAt(0, 0, 0)
		// const control = new OrbitControls(camera, renderer.domElement)

		// 场景
		const scene = new Scene()

		// 物体
		const boxes = rubik.models()
		scene.add(boxes)

		// 事件绑定
		const cancelEvent = rubik.bindEvent(camera, scene)

		function tick(): void {
			stats.update()
			// control.update()

			renderer.render(scene, camera)

			requestAnimationFrame(tick)
		}

		tick()

		return cancelEvent
	}, [])

	return <div className='rubik' ref={reference} />
}

export default RubikCase
