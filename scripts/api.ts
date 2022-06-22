import prettier from 'prettier'

const main = async () => {
  await prettier.resolveConfig(process.cwd())
}

main()
