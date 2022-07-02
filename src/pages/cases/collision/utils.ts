/*
 * @Author: lyf
 * @Date: 2021-03-12 11:04:11
 * @LastEditors: lyf
 * @LastEditTime: 2021-09-17 23:26:52
 * @Description: In User Settings Edit
 * @FilePath: /3d-case/src/pages/collision/utils.ts
 */
import type { Box3, Mesh, Sphere } from 'three'
import { Plane, SphereGeometry, Vector3 } from 'three'

export default class Utils {
	private static boundingPlanes: Plane[] = []

	/* 创建包围盒 */
	public static setBoundingBox(length_: number, meshes: Mesh[]): void {
		const font = new Plane(new Vector3(0, 0, -1), length_)
		const back = new Plane(new Vector3(0, 0, 1), length_)
		const left = new Plane(new Vector3(1, 0, 0), length_)
		const right = new Plane(new Vector3(-1, 0, 0), length_)
		const top = new Plane(new Vector3(0, -1, 0), length_)
		const bottom = new Plane(new Vector3(0, 1, 0), length_)

		this.boundingPlanes = [font, back, left, right, top, bottom]

		for (const mesh of meshes) {
			if (this.isSphere(mesh)) {
				mesh.geometry.computeBoundingSphere()
			} else {
				mesh.geometry.computeBoundingBox()
			}
		}
	}

	/* 是否为球体 */
	static isSphere(mesh: Mesh): boolean {
		return mesh.geometry instanceof SphereGeometry
	}

	/**
	 * 每一帧渲染
	 *
	 * 获取碰撞墙壁的元素
	 */
	static render(objs: Mesh[]): Mesh[] {
		const boxes: Mesh[] = []
		const { length } = objs
		for (let index = 0; index < length; index += 1) {
			const mesh = objs[index]
			// 墙壁碰撞
			const crossPlanes = this.getCollisionPlanes(mesh)
			if (crossPlanes.length > 0) {
				const direction = new Vector3()
				for (const { normal } of crossPlanes) direction.add(normal)
				console.log(direction.normalize())
				mesh.translateOnAxis(direction.normalize(), Math.random() * 3)
				boxes.push(mesh)
			}

			// 球体碰撞
		}
		return boxes
	}

	/**
	 * 获取元素碰撞的墙面
	 */
	static getCollisionPlanes(mesh: Mesh): Plane[] {
		const { matrix, geometry } = mesh
		const isSphere = this.isSphere(mesh)
		const crossPlanes: Plane[] = []
		const planes = this.boundingPlanes
		for (let index = 0, { length } = planes; index < length; index += 1) {
			const plane = planes[index]
			if (isSphere) {
				const sphere = geometry.boundingSphere
					?.clone()
					.applyMatrix4(matrix) as Sphere
				if (plane.intersectsSphere(sphere)) {
					crossPlanes.push(plane)
				}
			} else {
				const box = geometry.boundingBox?.clone().applyMatrix4(matrix) as Box3
				if (plane.intersectsBox(box)) {
					crossPlanes.push(plane)
				}
			}
		}
		return crossPlanes
	}
}
