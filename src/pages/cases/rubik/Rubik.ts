import type { Camera, Object3D, Scene } from 'three'
import {
	BoxGeometry,
	CanvasTexture,
	Group,
	Matrix4,
	Mesh,
	MeshBasicMaterial,
	Raycaster,
	Vector2,
	Vector3
} from 'three'
import interval from 'utils/time'

interface Configs {
	origin: Vector3
	size: number
	len: number
	colors: string[]
}

interface PosIndex {
	pos: Vector3
	index: number
}

interface State {
	boxes: Mesh[]
	leftOriginPos: Vector3 /* 前、左、上 小盒子的原点坐标 */
	group: Group /* 魔方体 */
	isRotating: boolean /* 是否在旋转中 */
	normal: Vector3 /* 滑动面法向量 */
	intersect: Object3D /* 触摸点所在的小盒子 */
	startPoint?: Vector3 /* 开始触摸点在3d坐标系中位置 */
	endPoint: Vector3 /* 结束触摸点在3d坐标系中位置 */
	initPosIndex: PosIndex[] /* 初始化小盒子的原点坐标和顺序 */
}

/* 6种方向 */
enum Direction {
	x,
	nx,
	y,
	ny,
	z,
	nz
}

type DirectionItem = keyof typeof Direction

export default class Rubik {
	private static readonly defaultConfigs: Configs = {
		origin: new Vector3(0, 0, 0),
		size: 3,
		len: 50,
		colors: ['#ff6b02', '#dd422f', '#ffffff', '#fdcd02', '#3d81f7', '#019d53']
	}

	private readonly configs: Configs = {} as Configs

	private state: State = {
		boxes: [] as Mesh[],
		initPosIndex: [] as PosIndex[]
	} as State

	/* 相对于魔方局部坐标系的可旋转方向 */
	private readonly direction: Record<DirectionItem, Vector3> = {
		x: new Vector3(1, 0, 0),
		nx: new Vector3(-1, 0, 0),
		y: new Vector3(0, 1, 0),
		ny: new Vector3(0, -1, 0),
		z: new Vector3(0, 0, 1),
		nz: new Vector3(0, 0, -1)
	}

	/* 魔方可旋转方向, 在全局坐标系中的位置 */
	private globalDirection: Record<DirectionItem, Vector3> = {} as Record<
		DirectionItem,
		Vector3
	>

	/* 魔方原点, 在全局坐标系中的位置 */
	private globalOrigin: Vector3 = new Vector3()

	constructor(configs: Partial<Configs> = {}) {
		this.configs = { ...Rubik.defaultConfigs, ...configs }

		this.state.leftOriginPos = this.getLeftOriginPos()
	}

	/**
	 * 获取魔方的最前边左上角魔方的原点坐标
	 */
	getLeftOriginPos() {
		const { origin, size, len } = this.configs
		const step = (len * (size - 1)) / 2
		const x = origin.x - step
		const y = origin.y + step
		const z = origin.z + step
		return new Vector3(x, y, z)
	}

	/**
	 * 生成贴图纹理
	 */
	createMap(color: string) {
		const canvas = document.createElement('canvas')
		canvas.width = 256
		canvas.height = 256

		const context = canvas.getContext('2d') as CanvasRenderingContext2D
		context.fillStyle = 'rgba(0,0,0,1)'
		context.fillRect(0, 0, 256, 256)

		context.rect(16, 16, 224, 224)
		context.lineJoin = 'round'
		context.lineWidth = 16
		context.fillStyle = color
		context.strokeStyle = color
		context.stroke()
		context.fill()
		return canvas
	}

	/**
	 * 获取每个box的原点坐标相对于魔方原点的偏移
	 *
	 * 先计算出最前边左上角小盒子的原点坐标, 再依次算出每个盒子的原点坐标
	 */
	getOffsetInPerBox(page: number, index: number) {
		const { len, size } = this.configs
		const { leftOriginPos } = this.state
		if (page === 0 && index === 0) {
			return leftOriginPos
		}
		const x = leftOriginPos.x + len * (index % size)
		const y = leftOriginPos.y - len * Math.floor(index / size)
		const z = leftOriginPos.z - len * page
		return new Vector3(x, y, z)
	}

	/**
	 * 生成小盒子
	 */
	createBox(page: number, index: number, materials: MeshBasicMaterial[]) {
		const { len, size } = this.configs
		const mesh = new Mesh(new BoxGeometry(len, len, len), materials)
		const position = this.getOffsetInPerBox(page, index)
		const order = page * size * size + index
		mesh.position.copy(position)
		mesh.userData.index = order
		this.state.initPosIndex.push({ pos: position, index: order })
		return mesh
	}

	/**
	 * 生成models
	 *
	 * 从前往后, 从左到右, 从上到下, 依次生成小盒子
	 */
	models() {
		const group = new Group()
		const { size, colors, len, origin } = this.configs
		const materials = colors.map(color => {
			const map = new CanvasTexture(this.createMap(color))
			const material = new MeshBasicMaterial({ map })
			return material
		})

		for (let i = 0; i < size; i += 1) {
			for (let j = 0; j < size * size; j += 1) {
				const box = this.createBox(i, j, materials)
				this.state.boxes.push(box)
				group.add(box)
			}
		}

		// 透明盒子
		const cubeLength = size * len + 1
		const cube = new Mesh(
			new BoxGeometry(cubeLength, cubeLength, cubeLength),
			new MeshBasicMaterial({ transparent: true, opacity: 0 })
		)
		cube.position.copy(origin)

		group.add(cube)
		group.position.copy(origin)
		this.state.group = group

		return group
	}

	/**
	 * 校验两个中心点是同一个盒子的中心点
	 */
	comparePos(pos1: Vector3, pos2: Vector3) {
		const { len } = this.configs
		const midEdge = len / 2
		return (
			Math.abs(pos1.x - pos2.x) <= midEdge &&
			Math.abs(pos1.y - pos2.y) <= midEdge &&
			Math.abs(pos1.z - pos2.z) <= midEdge
		)
	}

	/**
	 * 更新盒子的序号
	 */
	updateBoxesIndex() {
		const { boxes, initPosIndex } = this.state
		for (const box of boxes) {
			for (const { pos, index } of initPosIndex) {
				if (this.comparePos(box.position, pos)) {
					box.userData.index = index
				}
			}
		}
	}

	/**
	 * 获取魔方可转动方向在全局的位置
	 */
	getGlobalDirection() {
		const { group } = this.state
		// 魔方在世界坐标系中的模型变换矩阵
		const matrix = group.matrixWorld
		// 魔方局部坐标系的中心点肯定是(0, 0, 0), 需要将其转换成全局坐标系
		const globalOrigin = new Vector3(0, 0, 0).applyMatrix4(matrix)
		// 将魔方局部坐标系中可旋转方向装换成世界坐标系
		// eslint-disable-next-line unicorn/no-array-reduce
		const globalDirection = Object.keys(this.direction).reduce((res, item) => {
			const direction = this.direction[item as DirectionItem]
				.applyMatrix4(matrix)
				.sub(globalOrigin)
			return { ...res, [item]: direction }
		}, {}) as Record<DirectionItem, Vector3>
		this.globalDirection = globalDirection
		this.globalOrigin = globalOrigin
		return globalDirection
	}

	/**
	 * 围绕 穿过某一点的向量 旋转
	 * https://blog.csdn.net/csxiaoshui/article/details/65446125
	 *
	 * https://krasjet.github.io/quaternion/quaternion.pdf
	 */
	rotateAroundWorldAxis(pos: Vector3, vector: Vector3, rad: number) {
		vector.normalize()
		const u = vector.x
		const v = vector.y
		const w = vector.z
		const a = pos.x
		const b = pos.y
		const c = pos.z
		const matrix4 = new Matrix4()
		matrix4.set(
			u * u + (v * v + w * w) * Math.cos(rad),
			u * v * (1 - Math.cos(rad)) - w * Math.sin(rad),
			u * w * (1 - Math.cos(rad)) + v * Math.sin(rad),
			(a * (v * v + w * w) - u * (b * v + c * w)) * (1 - Math.cos(rad)) +
				(b * w - c * v) * Math.sin(rad),
			u * v * (1 - Math.cos(rad)) + w * Math.sin(rad),
			v * v + (u * u + w * w) * Math.cos(rad),
			v * w * (1 - Math.cos(rad)) - u * Math.sin(rad),
			(b * (u * u + w * w) - v * (a * u + c * w)) * (1 - Math.cos(rad)) +
				(c * u - a * w) * Math.sin(rad),
			u * w * (1 - Math.cos(rad)) - v * Math.sin(rad),
			v * w * (1 - Math.cos(rad)) + u * Math.sin(rad),
			w * w + (u * u + v * v) * Math.cos(rad),
			(c * (u * u + v * v) - w * (a * u + b * v)) * (1 - Math.cos(rad)) +
				(a * v - b * u) * Math.sin(rad),
			0,
			0,
			0,
			1
		)
		return matrix4
	}

	/**
	 * 魔方转动
	 * @param axis 围绕旋转的轴
	 * @param plus 正逆时针旋转
	 */
	doRotating(axis: Direction, plus: boolean) {
		const { intersect, boxes } = this.state
		const { size } = this.configs
		const { index } = intersect.userData
		const cubes: Mesh[] = []
		let roateAxis: Vector3
		switch (axis) {
			case Direction.x: // 绕着x轴转动
				{
					const temporary = index % size
					for (const box of boxes) {
						const { index: xi } = box.userData
						if (xi % size === temporary) {
							cubes.push(box)
						}
					}
					roateAxis = this.globalDirection.x
				}
				break
			case Direction.y: // 绕着y轴转动
				{
					const temporary = Math.floor((index % (size * size)) / size)
					for (const box of boxes) {
						const { index: yi } = box.userData
						const calIndex = Math.floor((yi % (size * size)) / size)
						if (calIndex === temporary) {
							cubes.push(box)
						}
					}
					roateAxis = this.globalDirection.y
				}
				break
			case Direction.z: // 绕着z轴转动
				{
					const temporary = Math.floor(index / (size * size))
					for (const box of boxes) {
						const { index: zi } = box.userData
						const calIndex = Math.floor(zi / (size * size))
						if (calIndex === temporary) {
							cubes.push(box)
						}
					}
					roateAxis = this.globalDirection.z
				}
				break
			default:
		}

		// 转动
		interval(
			250,
			percent => {
				const rand = (Math.PI / 2) * (plus ? -percent : percent)
				const matrix = this.rotateAroundWorldAxis(
					this.globalOrigin,
					roateAxis,
					rand
				)
				for (const cube of cubes) {
					cube.applyMatrix4(matrix)
				}
			},
			() => {
				this.state.isRotating = false
				this.updateBoxesIndex()
				console.log('done....')
			}
		)
	}

	/**
	 * 动画开始
	 */
	doAnimation() {
		const { startPoint, endPoint, normal } = this.state
		const { x, nx, y, ny, z, nz } = this.direction
		// 全局坐标系中 移动方向
		const moveVector = endPoint.sub(startPoint as Vector3)
		const globalDirection = this.getGlobalDirection()
		// 计算和移动方向的夹角, 夹角最小的则是魔方的滑动方向
		// eslint-disable-next-line unicorn/no-array-reduce
		const angles = Object.keys(globalDirection).reduce((res, item) => {
			const angle = moveVector.angleTo(globalDirection[item as DirectionItem])
			return { ...res, [item]: angle }
		}, {}) as Record<string, number>
		// 获取最小的夹角
		const minAngle = Math.min(...Object.values(angles))

		switch (minAngle) {
			case angles.x: // 沿着x轴正方向滑动(可滑动的面只有四个)
				if (normal.equals(y)) {
					// 滑动面的法向量是y轴正方向, 即沿着z轴顺时针旋转
					this.doRotating(Direction.z, true)
				} else if (normal.equals(ny)) {
					// 滑动面的法向量是y轴负方向, 即沿着z轴逆时针旋转
					this.doRotating(Direction.z, false)
				} else if (normal.equals(z)) {
					// 滑动面的法向量是z轴正方向, 即沿着y轴逆时针旋转
					this.doRotating(Direction.y, false)
				} else if (normal.equals(nz)) {
					// 滑动面的法向量是z轴负方向, 即沿着y轴顺时针旋转
					this.doRotating(Direction.y, true)
				}
				break
			case angles.nx:
				if (normal.equals(y)) {
					this.doRotating(Direction.z, false)
				} else if (normal.equals(ny)) {
					this.doRotating(Direction.z, true)
				} else if (normal.equals(z)) {
					this.doRotating(Direction.y, true)
				} else if (normal.equals(nz)) {
					this.doRotating(Direction.y, false)
				}
				break
			case angles.y:
				if (normal.equals(x)) {
					this.doRotating(Direction.z, false)
				} else if (normal.equals(nx)) {
					this.doRotating(Direction.z, true)
				} else if (normal.equals(z)) {
					this.doRotating(Direction.x, true)
				} else if (normal.equals(nz)) {
					this.doRotating(Direction.x, false)
				}
				break
			case angles.ny:
				if (normal.equals(x)) {
					this.doRotating(Direction.z, true)
				} else if (normal.equals(nx)) {
					this.doRotating(Direction.z, false)
				} else if (normal.equals(z)) {
					this.doRotating(Direction.x, false)
				} else if (normal.equals(nz)) {
					this.doRotating(Direction.x, true)
				}
				break
			case angles.z:
				if (normal.equals(x)) {
					this.doRotating(Direction.y, true)
				} else if (normal.equals(nx)) {
					this.doRotating(Direction.y, false)
				} else if (normal.equals(y)) {
					this.doRotating(Direction.x, false)
				} else if (normal.equals(ny)) {
					this.doRotating(Direction.x, true)
				}
				break
			case angles.nz:
				if (normal.equals(x)) {
					this.doRotating(Direction.y, false)
				} else if (normal.equals(nx)) {
					this.doRotating(Direction.y, true)
				} else if (normal.equals(y)) {
					this.doRotating(Direction.x, true)
				} else if (normal.equals(ny)) {
					this.doRotating(Direction.x, false)
				}
				break
			default:
		}
	}

	/**
	 * 事件绑定
	 */
	bindEvent(camera: Camera, scene: Scene) {
		const raycaster = new Raycaster()

		function normalVector(x: number, y: number) {
			const nx = (x / window.innerWidth) * 2 - 1
			const ny = -(y / window.innerHeight) * 2 + 1
			return new Vector2(nx, ny)
		}

		const handleTouchStart = (event_: TouchEvent) => {
			const { isRotating } = this.state
			if (!isRotating) {
				const { clientX, clientY } = event_.touches[0]
				raycaster.setFromCamera(normalVector(clientX, clientY), camera)
				const intersects = raycaster.intersectObjects(scene.children, true)
				if (intersects.length > 2) {
					this.state.normal = intersects[0].face?.normal as Vector3
					this.state.intersect = intersects[1].object
					this.state.startPoint = intersects[0].point
				}
			}
		}

		const handleTouchEnd = (event_: TouchEvent) => {
			const { isRotating, startPoint, endPoint } = this.state
			if (!isRotating && startPoint) {
				const { clientX, clientY } = event_.changedTouches[0]
				raycaster.setFromCamera(normalVector(clientX, clientY), camera)
				const intersects = raycaster.intersectObjects(scene.children, true)
				if (intersects.length > 0) {
					this.state.endPoint = intersects[0].point
					if (!startPoint.equals(endPoint)) {
						this.state.isRotating = true
						this.doAnimation()
					}
				}
			}
		}

		window.addEventListener('touchstart', handleTouchStart, false)
		window.addEventListener('touchend', handleTouchEnd, false)

		return () => {
			window.removeEventListener('touchstart', handleTouchStart, false)
			window.removeEventListener('touchend', handleTouchEnd, false)
		}
	}
}
