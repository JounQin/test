let initialized = false

export function initialize() {
  if (initialized) {
    return
  }
  initialized = true
  console.log('a initialize')
}

// eslint-disable-next-line sonar/post-message
self.addEventListener('message', ev => {
  console.log('a message:', ev)
  initialize()
})
