# 简介

- 大部分工作, 将 3D 坐标转变为适应屏幕的 2D 像素。
- 图形化管线
  - 将 3D 坐标转化为 2D 坐标
  - 将 2D 坐标转变为实际的有颜色像素
  - 通过自己写着色器来控制图形渲染管线中的特定部分
- 图形化管线流程
  - 顶点着色器: 将输入的 3D 坐标,转化为另一种 3D 坐标
    - 将顶点坐标 转化为 标准化设备坐标
  - 图元装配: 将顶点着色器输出顶点作为输入,装配成指定图元形状(点、线、面)
  - 几何着色器: 将图元形式的系列坐标作为输入, 构建新图元或其他形状(webgl 不支持修改)
  - 光栅化: 将图元映射为最终屏幕上相应的像素, 生成供片段着色器使用的片段。(注: 在片段着色器运行前,会执行裁切,舍弃超出视图的所有像素)
  - 片段着色器: 计算一个像素的最终颜色,是所有高级特效产生的地方。
  - alpha 测试和混合: 进行深度测试、模板测试, 判断像素是否舍弃; 也会检查 alpha 值, 对物体进行混合。
- 标准化设备坐标
  - x、y、z 都在-1.0 到 1.0 的范围。
- 视口变换
  - 将标准化设备坐标 变换为 屏幕空间坐标
  - 屏幕空间坐标又会被变换为片段输入到片段着色器中

# 着色器

- 运行在 GPU 上的小程序
- 向量

# 获取信息

- 获取当前清楚颜色 `gl.getParameter(gl.COLOR_CLEAR_VALUE)`
- 获取当前 gl.ARRAY_BUFFER 缓冲区绑定 `gl.getParameter(gl.ARRAY_BUFFER_BINDING)`
- 获取当前 gl.ELEMENT_ARRAY_BUFFER 缓冲区绑定 `gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING)`
- 着色器
  - 着色器是否删除 `gl.getShaderParameter(shader, gl.DELETE_STATUS)`
  - 着色器是否编译成功 `gl.getShaderParameter(shader, gl.COMPILE_STATUS)`
  - 着色器类型 `gl.getShaderParameter(shader, gl.SHADER_TYPE)`
  - 着色器信息(警告、调试、编译) `gl.getShaderInfoLog(shader)`
- 着色器程序
  - 着色器程序是否删除 `gl.getProgramParameter(program, gl.DELETE_STATUS)`
  - 着色器程序是否链接正常 `gl.getProgramParameter(program, gl.LINK_STATUS)`
  - 获取着色器程序错误信息 `gl.getProgramInfoLog(program)`
- 获取支持的 glsl 版本 `gl.getParameter(gl.SHADING_LANGUAGE_VERSION)`
- 获取当前 webgl 版本 `gl.getParameter(gl.VERSION)`
