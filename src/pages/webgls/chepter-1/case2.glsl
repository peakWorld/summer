// 1. 向量
// vecn  包含n个float分量的向量
// bvecn 包含n个bool分量的向量
// ivecn 包含n个int分量的向量
// uvecn 包含n个unsigned int分量的向量
// dvecn 包含n个double分量的向量

// 注: vecn类型向量满足大部分需求

// 2. 向量操作

// 获取分量 获取的值是一样的, 但是代表的意义一样
vec4 a_color;
// a_color.x; a_color.y; a_color.z; a_color.w;
// a_color.r; a_color.g; a_color.b; a_color.a;

// 重组
vec2 sVec;
vec4 dVec = sVec.xxyx;
vec3 aVec = dVec.yzw;
vec4 oVec = aVec.xyzx + sVec.xxyy;
vec3 ooVec = vec3(sVec, dVec.x);

// 3. glsl 300 es
// in 输入
// out 输出

// 4. uniform声明变量
// 全局的, 在每个着色器程序对象中都是独一无二的。
// 常量, 一直保存数据, 直到重置或更新。
// 如果你声明了一个uniform却在GLSL代码中没用过，编译器会静默移除这个变量，导致最后编译出的版本中并不会包含它