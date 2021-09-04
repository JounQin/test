import { Prism } from "../components";

const code = `import os from 'os'
import path from 'path'
 
import Chance from 'chance'
 
export const SWAGGER_JSON_FILE =
  process.env.SWAGGER_JSON_FILE ||
  path.resolve(os.homedir(), '.schema', 'api.swagger.json')
 
export const chance = new Chance()
 
export const ASSET_REG = /\.(|eot|ico|jpe?g|png|svg|tsx?|ttf|woff)$/`;

export default () => <Prism lang="typescript">{code}</Prism>;
