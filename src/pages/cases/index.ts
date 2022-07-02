import { lazy } from 'react'

const Rubik = lazy(
	async () => import(/* webpackChunkName: "cases-rubik" */ './rubik')
)
const Collision = lazy(
	async () => import(/* webpackChunkName: "cases-collision" */ './collision')
)

export { Rubik, Collision }
