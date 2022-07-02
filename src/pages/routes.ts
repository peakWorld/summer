/*
 * @Author: lyf
 * @Date: 2021-01-07 16:33:26
 * @LastEditors: lyf
 * @LastEditTime: 2021-09-18 14:21:01
 * @Description: In User Settings Edit
 * @FilePath: /3d-case/src/constants/routes.ts
 *
 * https://reactrouter.com/web/guides/code-splitting
 * https://reacttraining.com/blog/react-router-v5-1/
 */
import type { RouteProps } from 'react-router-dom'
import * as threes from './threes'
import * as webgls from './webgls'
import * as cases from './cases'

interface Platform {
	title: string
}

interface Route extends RouteProps {
	title: string
	path: string
	comp: React.LazyExoticComponent<() => JSX.Element>
	hide?: boolean
}

export interface LocationState {
	rid: string
	title?: string
}

export const routes = new Map<string, Route>()
export const platform = new Map<string, Platform>()

// 平台配置
platform.set('1', { title: 'three基础' })
platform.set('2', { title: 'webgl基础' })
platform.set('3', { title: '小项目' })

// three基础
routes.set('1001', {
	title: '基本要素、动画、阴影',
	path: '/threes/case1',
	comp: threes.Case1
})
routes.set('1002', {
	title: '雾化 和 选中',
	path: '/threes/case2',
	comp: threes.Case2
})
routes.set('1003', {
	title: '多材质、自定义shader 和 分屏',
	path: '/threes/case3',
	comp: threes.Case3
})
routes.set('1004', {
	title: '点、popmotion动画、纹理贴图',
	path: '/threes/case4',
	comp: threes.Case4
})
routes.set('1005', {
	title: '二维形状、文本、morph(形变)',
	path: '/threes/case5',
	comp: threes.Case5
})
routes.set('1006', {
	title: '后期处理',
	path: '/threes/case6',
	comp: threes.Case6
})
routes.set('1007', {
	title: '物理特效',
	path: '/threes/case7',
	comp: threes.Case7
})

// three小项目
routes.set('2001', { title: '魔方', path: '/cases/rubik', comp: cases.Rubik })
routes.set('2002', {
	title: '碰撞检测',
	path: '/cases/collision',
	comp: cases.Collision
})

// webgl基础
routes.set('3001', {
	title: 'chapter1-case1',
	path: '/webgls/chapter1/case1',
	comp: webgls.Chapter1.Case1
})
routes.set('3002', {
	title: 'chapter1-case2',
	path: '/webgls/chapter1/case2',
	comp: webgls.Chapter1.Case2
})

export const ROUTES_CONFIGS = [...routes.entries()].map(([rid, value]) => ({
	rid,
	...value
}))
export const PLATFORM_CONFIG = [...platform.entries()].map(([pid, value]) => {
	const children = ROUTES_CONFIGS.filter(({ rid }) => rid.startsWith(pid))
	return { ...value, children, pid }
})
