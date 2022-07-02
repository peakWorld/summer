/*
 * @Author: lyf
 * @Date: 2021-03-10 11:03:54
 * @LastEditors: lyf
 * @LastEditTime: 2021-03-10 19:28:05
 * @Description: 时间操作相关
 * @FilePath: /cook-electron/Users/a58/iworkspace/3d-case/src/utils/time.ts
 */

/**
 * 1-0
 * @param {number} duration 执行时间(ms)
 * @param {(percent: number) => void} tick 每一帧的回调函数
 * @param {() => void} after 执行完成后的回调函数
 */
export default function interval(
	duration: number,
	tick?: (percent: number) => void,
	after?: () => void
) {
	const startTime = Date.now()
	const endTime = startTime + duration
	let previousTime = startTime
	let timer = 0

	function animate() {
		const current = Date.now()
		if (current < endTime) {
			const step = current - previousTime
			if (tick) {
				const percent = step / duration
				tick(percent)
			}
			previousTime = current
			timer = requestAnimationFrame(animate)
		} else {
			const step = endTime - previousTime
			if (step > 0 && tick) {
				const percent = step / duration
				tick(percent)
			}
			setTimeout(
				() => {
					if (after) after()
				},
				duration / 2 > 200 ? 200 : duration / 2
			)
			cancelAnimationFrame(timer)
		}
	}
	timer = requestAnimationFrame(animate)
}
