import * as aWorker from './a.worker'

let initialized = false

export function initialize() {
  if (initialized) {
    return
  }
  initialized = true
  aWorker.initialize()
  console.log('b initialize')
}

// eslint-disable-next-line sonar/post-message
self.addEventListener('message', ev => {
  console.log('b message:', ev)
  initialize()
})
