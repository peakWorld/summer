interface ViewPort {
	point: { x: number; y: number }
	width: number
	height: number
}

/**
 * webgl基本函数
 */
export default class Webgl {
	dom: HTMLCanvasElement

	gl: WebGL2RenderingContext

	constructor(dom: HTMLCanvasElement) {
		this.dom = dom

		this.setDp()

		this.gl = dom.getContext('webgl2') as WebGL2RenderingContext
	}

	setDp() {
		const { dom } = this
		const width = dom.clientWidth
		const height = dom.clientHeight
		const dp = window.devicePixelRatio
		dom.setAttribute('width', `${width * dp}px`)
		dom.setAttribute('height', `${height * dp}px`)
	}

	/**
	 * 设置渲染窗口, 前两个参数控制窗口左下角, 三、四参数控制窗口宽、高
	 * @param vp {ViewPort} 窗口参数
	 */
	setViewPort(vp?: ViewPort) {
		const { gl, dom } = this
		const { clientWidth, clientHeight } = dom
		gl.viewport(
			vp?.point.x ?? 0,
			vp?.point.y ?? 0,
			vp?.width ?? clientWidth,
			vp?.height ?? clientHeight
		)
	}

	/**
	 * 创建顶点着色器
	 */
	createVShader(code: string) {
		const { gl } = this
		const shader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader
		gl.shaderSource(shader, code)
		gl.compileShader(shader)
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.log('shader(vs) compile failed:', gl.getShaderInfoLog(shader))
			return
		}
		return shader
	}

	/**
	 * 创建片段着色器
	 */
	createFShader(code: string) {
		const { gl } = this
		const shader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader
		gl.shaderSource(shader, code)
		gl.compileShader(shader)
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.log('shader(fs) compile failed:', gl.getShaderInfoLog(shader))
			return
		}
		return shader
	}

	/**
	 * 创建着色器程序
	 */
	createProgram(vsCode: string, fsCode: string) {
		const { gl } = this
		const vs = this.createVShader(vsCode) as WebGLShader
		const fs = this.createFShader(fsCode) as WebGLShader
		const program = gl.createProgram() as WebGLProgram
		gl.attachShader(program, vs)
		gl.attachShader(program, fs)
		gl.linkProgram(program)
		// gl.deleteShader(vs as WebGLShader)
		// gl.deleteShader(fs as WebGLShader)
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.log('link program failed:', gl.getProgramInfoLog(program))
			return
		}
		return program
	}
}
