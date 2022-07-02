import Stats from 'three/examples/jsm/libs/stats.module'

/**
 * fps工具
 * @param {HTMLElement} dom fps的父级dom
 */
export function createStats({ dom }: { dom?: HTMLElement }) {
	const container = dom ?? document.body
	const stats = Stats()
	container.append(stats.dom)
	return stats
}

/**
 * 随机正整数
 * @param {number} max 最大值
 */
export function randInt(max = 10) {
	return Math.ceil(Math.random() * max)
}
