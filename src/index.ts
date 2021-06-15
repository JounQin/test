const aWorker = new Worker(new URL('./a.worker', import.meta.url))
const bWorker = new Worker(new URL('./b.worker', import.meta.url))

aWorker.postMessage('Hello world', [])
bWorker.postMessage('Hello world', [])
