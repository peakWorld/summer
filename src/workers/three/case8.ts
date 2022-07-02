// eslint-disable-next-line @typescript-eslint/no-unsafe-call
// importScripts('../libs/ammo.js')
import '../libs/ammo'

onmessage = data => {
	console.log(data)
}

setTimeout(() => {
	postMessage('worker2467775...')
}, 1500)

// function cb () {
//   console.log('hahhaha')
//   requestAnimationFrame(cb)
// }

// requestAnimationFrame(cb)
