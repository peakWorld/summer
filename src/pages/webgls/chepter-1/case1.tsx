import { useEffect, useRef } from 'react'
import Webgl from 'utils/webgl'
import * as sjData from '../data/sanjiao'

const vs = `
  attribute vec3 a_Position;
  void main(){
    gl_Position = vec4(a_Position, 1.0);
  }
`

const fs = `
  precision mediump float;
  void main(){
    gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
  }
`

const data = sjData.cubePoints
const indexData = sjData.cubeIndex

function Chapter1Case1() {
	const reference = useRef<HTMLCanvasElement>(null)

	useEffect(() => {
		const orchid = new Webgl(reference.current as HTMLCanvasElement)
		const { gl } = orchid

		gl.enable(gl.CULL_FACE) // 开启正反面剔除(默认关闭)
		gl.cullFace(gl.BACK) // 剔除背面
		gl.frontFace(gl.CW) // 顺时针绘制图形是正面; 默认逆时针绘制是正面(gl.CCW)

		gl.clear(gl.COLOR_BUFFER_BIT) // 清空颜色缓冲区
		gl.clearColor(0.2, 0.3, 0.3, 1) // 设置清空屏幕所用的颜色

		orchid.setViewPort() // 设置视口

		// 生成着色器程序
		const program = orchid.createProgram(vs, fs) as WebGLProgram

		// 顶点缓冲对象: 创建并初始化一个用于储存顶点数据或着色数据的webgl对象
		const vbo = gl.createBuffer()
		// 索引缓冲对象
		const ebo = gl.createBuffer()

		// 顶点数组对象
		const vao = gl.createVertexArray()
		// 顶点数组对象的绑定
		// 对于解绑之间的所有操作都会进行缓存
		// 1. 绑定缓冲对象
		// 2. 指定顶点属性读取的数据是哪个缓冲对象
		gl.bindVertexArray(vao)

		// 将新建的缓冲对象绑定到gl.ARRAY_BUFFER(缓冲类型)目标上
		// 两者绑定后, 对gl.ARRAY_BUFFER的调用都会用来配置当前绑定对象vbo
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
		// 将数据复制到vbo这个webgl对象
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)

		// 将新建的缓冲对象绑定到gl.ELEMENT_ARRAY_BUFFER(缓冲类型)目标上
		// 两者绑定后, 对gl.ELEMENT_ARRAY_BUFFER的调用都会用来配置当前绑定对象ebo
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo)
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW)

		// 获取着色器程序中 指定顶点属性(attribute)的索引
		const aPos = gl.getAttribLocation(program, 'a_Position')
		// 链接 顶点数据 和 着色器中的顶点属性
		// 告诉显卡从当前绑定的缓冲区（bindBuffer()指定的缓冲区）中读取顶点数据
		// 使用该顶点属性时,数据从那个缓冲对象中获取
		gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0)
		// 启用顶点属性(默认禁用)
		gl.enableVertexAttribArray(aPos)

		// 解除顶点数组对象的绑定, 可以绑定其他顶点数组对象
		gl.bindVertexArray(null)

		// 绘制
		// 使用着色器: 将着色器对象添加到当前的渲染状态
		// 该操作后的 每个着色器调用和渲染调用都会使用这个着色器程序对象
		gl.useProgram(program)
		gl.bindVertexArray(vao)
		// 未使用索引缓冲对象绑定数据使用该方法, 绘制几点点
		// gl.drawArrays(gl.TRIANGLES, 0, 3)

		function tick() {
			// 根据绑定的索引对象来绘制图元
			gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0)

			requestAnimationFrame(tick)
		}

		tick()
	}, [])

	return <canvas ref={reference} className='render-root' />
}

export default Chapter1Case1
