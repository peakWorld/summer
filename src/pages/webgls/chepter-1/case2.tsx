import { useEffect, useRef } from 'react'
import Webgl from 'utils/webgl'
import * as sjData from '../data/sanjiao'

const vs = `#version 300 es
  in vec3 a_Pos;  // 输入变量, 顶点数据
  in vec3 a_Color; // 输入变量, 顶点颜色

  out vec4 vertexColor; // 输出变量, 当做片段着色器中的输入变量
  out vec3 aColor;

  void main() {
    gl_Position = vec4(a_Pos, 1.0);
    vertexColor = vec4(0.5, 0.0, 0.0, 1.0);
    aColor = a_Color;
  }
`
const fs = `#version 300 es
  precision mediump float;

  out vec4 FragColor; // 定义输出片段, 相当于glsl 100版本中的默认gl_FragColor变量

  in vec4 vertexColor; // 输入变量, 和顶点着色器中的某个输出变量一样
  in vec3 aColor;

  uniform vec4 u_Color; // uniform变量

  void main() {
    FragColor = vertexColor * 0.2 + u_Color * 0.3 + vec4(aColor, 1.0) * 0.5;
  }
`

const data = sjData.triData
const indexData = sjData.triIndex

const perSize = data.BYTES_PER_ELEMENT

function Chapter1Case2() {
	const reference = useRef<HTMLCanvasElement>(null)

	useEffect(() => {
		const orchid = new Webgl(reference.current as HTMLCanvasElement)
		const { gl } = orchid

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
		const aPos = gl.getAttribLocation(program, 'a_Pos')
		// 链接 顶点数据 和 着色器中的顶点属性
		// 告诉显卡从当前绑定的缓冲区（bindBuffer()指定的缓冲区）中读取顶点数据
		// 使用该顶点属性时,数据从那个缓冲对象中获取
		gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 6 * perSize, 0)
		// 启用顶点属性(默认禁用)
		gl.enableVertexAttribArray(aPos)

		const aColor = gl.getAttribLocation(program, 'a_Color')
		gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 6 * perSize, 3 * perSize)
		gl.enableVertexAttribArray(aColor)

		// 解除顶点数组对象的绑定, 可以绑定其他顶点数组对象
		gl.bindVertexArray(null)

		// uniform变量
		const uColor = gl.getUniformLocation(program, 'u_Color')

		function tick() {
			// 绘制
			// 使用着色器: 将着色器对象添加到当前的渲染状态
			// 该操作后的 每个着色器调用和渲染调用都会使用这个着色器程序对象
			gl.useProgram(program)
			gl.bindVertexArray(vao)

			// 查询uniform变量地址, 不要求已使用过着色器程序
			// 更新uniform变量, 必须先使用着色器程序(修改当前激活的着色器程序)
			gl.uniform4fv(uColor, [0, Math.random(), 0, 1])

			// 根据绑定的索引对象来绘制图元
			gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_BYTE, 0)

			requestAnimationFrame(tick)
		}

		tick()
	}, [])

	return <canvas ref={reference} className='render-root' />
}

export default Chapter1Case2
