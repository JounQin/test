import { resolve, moduleResolve } from 'import-meta-resolve'

console.log(resolve('@isnotdefined/stylelint-plugin', import.meta.url))
console.log(moduleResolve('@isnotdefined/stylelint-plugin', import.meta.url))
