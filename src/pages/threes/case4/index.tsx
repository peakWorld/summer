/*
 * @Author: lyf
 * @Date: 2021-02-19 19:28:39
 * @LastEditors: lyf
 * @LastEditTime: 2021-09-18 14:15:59
 * @Description: 点、popmotion动画、纹理贴图
 * @FilePath: /3d-case/src/examples-three/case4/index.tsx
 * 
 *  将坐标变换为标准化设备坐标，接着再转化为屏幕坐标的过程通常是分步进行的，也就是类似于流水线那样子。
    在流水线中，物体的顶点在最终转化为屏幕坐标之前还会被变换到多个坐标系统(Coordinate System)

    局部空间【顶点坐标,相对局部原点】 -> 
    模型矩阵【model Matrix】 -> 世界空间【世界坐标,相对世界原点】 ->
    视图矩阵【view Matrix】 -> 观察空间【每个坐标都是从摄像机的角度进行观察】->
    投影矩阵【project Matrix】-> 裁剪空间【坐标转化到-1.0到1.0,判断哪些顶点出现在屏幕】
    视口变换【将裁剪空间的坐标变换到由viewport函数定义的范围,完成后再通过光栅器转化为片段】
 */
import { animate, easeInOut } from 'popmotion'
import { useEffect, useRef } from 'react'
import {
	AdditiveBlending,
	AmbientLight,
	AxesHelper,
	BoxGeometry,
	BufferGeometry,
	CubeTextureLoader,
	DoubleSide,
	Float32BufferAttribute,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Points,
	PointsMaterial,
	Scene,
	SphereGeometry,
	TextureLoader,
	WebGLRenderer
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { createStats } from 'utils/help'

function ThreeCase4() {
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
			const camera = new PerspectiveCamera(55, w / h, 0.1, 1000)
			camera.position.set(0, 0, 40)
			camera.up.set(0, 1, 0)
			camera.lookAt(0, 0, 0)
			const control = new OrbitControls(camera, renderer.domElement)

			// 场景
			const scene = new Scene()
			const axesHelper = new AxesHelper(20)
			scene.add(axesHelper)

			// 光线
			const ambient = new AmbientLight(0xff_ff_ff)
			scene.add(ambient)

			// 环境贴图
			scene.background = new CubeTextureLoader()
				.setPath('/assets/webgl/img/three-case5/parliament/')
				.load([
					'posx.jpg',
					'negx.jpg',
					'posy.jpg',
					'negy.jpg',
					'posz.jpg',
					'negz.jpg'
				])

			const sphere = new Mesh(
				new SphereGeometry(5, 20, 20),
				new MeshBasicMaterial({ envMap: scene.background })
			)
			sphere.name = 'sphere'
			sphere.position.setX(-6)
			scene.add(sphere)

			const box = new Mesh(
				new BoxGeometry(5, 5, 5),
				new MeshBasicMaterial({ envMap: scene.background, side: DoubleSide }) // 绘制双面
			)
			box.name = 'box'
			box.position.setX(6)
			box.geometry.setDrawRange(0, 9) // 只绘制部分内容
			scene.add(box)

			animate({
				// popmotion动画
				from: 1,
				to: 0,
				duration: 4000,
				repeat: Number.POSITIVE_INFINITY,
				repeatType: 'reverse',
				ease: easeInOut,
				onUpdate: (/* pos */) => {
					// camera.position.z = Math.cos(pos) * 50
				}
			})

			return { scene, camera, control }
		}

		function sceneBottom() {
			// 相机
			const camera = new PerspectiveCamera(75, w / h, 0.1, 1000)
			// camera.position.z = 400
			camera.position.set(-70, -22, -106)
			camera.up.set(0, 1, 0)
			camera.lookAt(0, 0, 0)
			const control = new OrbitControls(camera, renderer.domElement)
			control.maxZoom = 1.5
			control.minZoom = 0.5

			// 场景
			const scene = new Scene()

			// 光线
			const ambient = new AmbientLight(0x40_40_40)
			scene.add(ambient)

			const textureLoader = new TextureLoader()
			// 雨
			const textures = [
				textureLoader.load('/assets/webgl/img/three-case5/raindrop-1.png'),
				textureLoader.load('/assets/webgl/img/three-case5/raindrop-2.png'),
				textureLoader.load('/assets/webgl/img/three-case5/raindrop-3.png')
			]
			// 雪
			// const textures = [
			//   textureLoader.load('/assets/webgl/img/three-case5/snowflake1.png'),
			//   textureLoader.load('/assets/webgl/img/three-case5/snowflake2.png'),
			//   textureLoader.load('/assets/webgl/img/three-case5/snowflake3.png'),
			//   textureLoader.load('/assets/webgl/img/three-case5/snowflake4.png'),
			//   textureLoader.load('/assets/webgl/img/three-case5/snowflake5.png'),
			// ]
			const geometry = new BufferGeometry()
			const vertices: number[] = []
			for (
				let index = 0, len = 6000 * textures.length;
				index < len;
				index += 1
			) {
				const x = Math.random() * 400 - 200
				const y = Math.random() * 400 - 200
				const z = Math.random() * 400 - 200
				vertices.push(x, y, z)
			}
			geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))

			for (let index = 0, len = textures.length; index < len; index += 1) {
				const material = new PointsMaterial({
					color: 0xff_ff_ff,
					size: Math.random() * index,
					map: textures[index],
					transparent: true, // 开启 blending才能其效果
					blending: AdditiveBlending // 除去png黑色背景
				})
				const point = new Points(geometry, material)
				scene.add(point)
			}

			return { scene, camera, control }
		}

		const top = sceneTop()
		const bottom = sceneBottom()

		// 动画
		function tick() {
			stats.update()
			top.control.update()
			bottom.control.update()

			// 渲染上半屏
			const sphere = top.scene.getObjectByName('sphere') as Mesh
			sphere.rotation.y += 0.01

			const box = top.scene.getObjectByName('box') as Mesh
			box.rotation.x += 0.01
			box.rotation.y += 0.01
			box.rotation.z += 0.01

			renderer.setScissor(0, hh, w, hh)
			renderer.setViewport(0, hh, w, hh)
			renderer.setClearColor(0xbc_d4_8f, 1)
			renderer.render(top.scene, top.camera)

			// 渲染下半屏
			bottom.scene.traverse(object => {
				if (object instanceof Points) {
					// const res = []
					// const { array, count, itemSize } = obj.geometry.getAttribute('position').clone()
					// for (let i = 0; i < count; i++) {
					//   let y = array[i * itemSize + 1] - Math.random() * 0.3
					//   y = y > -200 ? y : Math.random() * 400 - 200
					//   const vector = new Vector3(
					//     array[i * itemSize],
					//     y,
					//     array[i * itemSize + 2]
					//   )
					//   res.push(vector)
					// }
					// obj.geometry.setFromPoints(res)

					const { array, count, itemSize } =
						object.geometry.getAttribute('position')
					const arr = array as number[]
					for (let index = 0; index < count; index += 1) {
						const y = array[index * itemSize + 1] - Math.random() * 0.3
						arr[index * itemSize + 1] = y > -200 ? y : Math.random() * 400 - 200
					}
					// eslint-disable-next-line no-param-reassign
					object.geometry.attributes.position.needsUpdate = true
				}
			})

			renderer.setScissor(0, 0, w, hh)
			renderer.setViewport(0, 0, w, hh)
			renderer.setClearColor(0xff_ff_ff, 0)
			renderer.render(bottom.scene, bottom.camera)

			requestAnimationFrame(tick)
		}

		tick()

		return () => {
			const gui = document.querySelector('.dg.ac')
			if (gui) gui.remove()
		}
	}, [])

	return <div ref={reference} className='render-root' />
}

export default ThreeCase4
