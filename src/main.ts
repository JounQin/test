import { enableProdMode } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'

import { AppModule } from './app/app.module'
import { environment } from './environments/environment'

if (environment.production) {
  enableProdMode()
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err))

const main = async () => {
  const result = await Promise.resolve(1)
  console.log(result)

  for await (const i of [1, 2, 3]) {
    console.log(i)
  }
}

void main()
