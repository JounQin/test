import prettier from 'prettier'

const main = async () => {
  await prettier.resolveConfig('README.md')
}

main()
