/*
 * @Author: lyf
 * @Date: 2021-03-04 17:15:58
 * @LastEditors: lyf
 * @LastEditTime: 2021-09-18 14:16:58
 * @Description: 二维形状、文本、morph(形变)
 * @FilePath: /3d-case/src/examples-three/case5/index.tsx
 */
import { useEffect, useRef } from 'react'
import type { Sphere } from 'three'
import {
	AmbientLight,
	Color,
	FontLoader,
	Mesh,
	MeshBasicMaterial,
	MeshNormalMaterial,
	Path,
	PerspectiveCamera,
	Scene,
	Shape,
	ShapeGeometry,
	SphereGeometry,
	TextGeometry,
	Vector3,
	WebGLRenderer
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { createStats } from 'utils/help'

function ThreeCase5() {
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
		camera.position.set(0, 0, 60)
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

		// 二维形状
		const shape = new Shape() // 以xy轴平面(0, 0)为原点
		shape.lineTo(10, 5)
		shape.absarc(5, 5, 5, 0, Math.PI * 2, false)
		const rightEye = new Path()
		rightEye.moveTo(8, 6)
		rightEye.absellipse(7, 5, 1, 1, 0, Math.PI * 2, true, 0)
		shape.holes.push(rightEye)
		const leftEye = new Path()
		leftEye.moveTo(4, 5)
		leftEye.absarc(3, 5, 1, 0, Math.PI * 2, true)
		shape.holes.push(leftEye)
		const mouth = new Path()
		mouth.moveTo(5, 3)
		mouth.quadraticCurveTo(6, 3, 7, 4)
		mouth.quadraticCurveTo(6, 2, 5, 2)
		mouth.quadraticCurveTo(4, 2, 4, 4)
		mouth.quadraticCurveTo(4, 3, 5, 3)
		shape.holes.push(mouth)
		const mesh1 = new Mesh(new ShapeGeometry(shape), new MeshBasicMaterial())
		mesh1.visible = false
		scene.add(mesh1)

		// Text
		const loader = new FontLoader()
		loader.load('/assets/webgl/font/helvetiker_bold.typeface.js', font => {
			const geometry = new TextGeometry('Hello World', {
				font, // 字体
				size: 3, // 字体高度
				height: 0.2, // 字体厚度
				curveSegments: 5, // 曲线处的片段数
				bevelEnabled: true, // 是否前后面堆叠物体
				bevelThickness: 0.2, // 堆叠物厚度
				bevelSize: 0.2, // 堆叠物宽度
				bevelSegments: 20 // 厚度处的片段数,越大显示越圆滑
			})
			// 1. 材质支持形变
			const material = new MeshNormalMaterial({
				morphTargets: true,
				morphNormals: true
			})

			function handleAttribute(name: string) {
				const geomAttribute = geometry.getAttribute(name).clone() // 拷贝当前元素的geometry
				const { array, count, itemSize } = geomAttribute
				const arr: Vector3[] = []
				for (let index = 0; index < count; index += 1) {
					// 对每个顶点坐标进行处理
					const vector = new Vector3(
						array[index * itemSize] + Math.random() * 3,
						array[index * itemSize + 1] + Math.random() * 3,
						array[index * itemSize + 2] + Math.random() * 3
					)
					arr.push(vector)
				}
				const attribute = geomAttribute.copyVector3sArray(arr) // 生成一个新的gemoetry
				return attribute
			}

			// 2. 添加形变数据
			geometry.morphAttributes.position = [handleAttribute('position')]
			geometry.morphAttributes.normal = [handleAttribute('normal')]

			const mesh = new Mesh(geometry, material)
			// mesh.updateMorphTargets()
			mesh.morphTargetInfluences = [0.3] // 3. 形变程度[0-1]
			mesh.position.set(-10, 0, 0)
			mesh.visible = true
			scene.add(mesh)

			// 外接球
			geometry.computeBoundingSphere()
			const { center, radius } = geometry.boundingSphere as Sphere
			const sphere = new Mesh(
				new SphereGeometry(radius, 32, 32),
				new MeshNormalMaterial({ wireframe: true })
			)
			sphere.position.copy(center.setX(center.x - 10))
			sphere.visible = true
			scene.add(sphere)
		})

		// 动画
		function animate() {
			stats.update()
			control.update()
			renderer.render(scene, camera)

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

export default ThreeCase5
