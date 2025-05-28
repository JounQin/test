// eslint-disable-next-line unicorn-x/prefer-node-protocol
const path = require('path')

const resolve = require('resolve')

const fixtures = path.resolve(__dirname, 'fixtures')

console.log(
  '`resolve` npm package:',
  resolve.sync('bar', {
    paths: [fixtures],
  }),
)

console.log(
  '`require.resolve` built-in function:',
  require.resolve('bar', {
    paths: [fixtures],
  }),
)
