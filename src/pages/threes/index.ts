import { lazy } from 'react'

const Case1 = lazy(
	async () => import(/* webpackChunkName: "threes-case1" */ './case1')
)
const Case2 = lazy(
	async () => import(/* webpackChunkName: "threes-case2" */ './case2')
)
const Case3 = lazy(
	async () => import(/* webpackChunkName: "threes-case3" */ './case3')
)
const Case4 = lazy(
	async () => import(/* webpackChunkName: "threes-case4" */ './case4')
)
const Case5 = lazy(
	async () => import(/* webpackChunkName: "threes-case5" */ './case5')
)
const Case6 = lazy(
	async () => import(/* webpackChunkName: "threes-case6" */ './case6')
)
const Case7 = lazy(
	async () => import(/* webpackChunkName: "threes-case7" */ './case7')
)

export { Case1, Case2, Case3, Case4, Case5, Case6, Case7 }
