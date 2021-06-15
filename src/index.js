/* eslint-disable import/default */
import AWorker from './a.worker'
import BWorker from './b.worker'

const aWorker = new AWorker()
const bWorker = new BWorker()

aWorker.postMessage('Hello world', [])
bWorker.postMessage('Hello world', [])
