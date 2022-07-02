import { lazy } from 'react'

const Case1 = lazy(
	async () =>
		import(/* webpackChunkName: "examples-webgl-chapter1-case1" */ './case1')
)
const Case2 = lazy(
	async () =>
		import(/* webpackChunkName: "examples-webgl-chapter1-case2" */ './case2')
)

export { Case1, Case2 }
