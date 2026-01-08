import {  asValue, createContainer } from 'awilix';
import type { Dependencies } from './di.type.ts';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import { informationBannersStorage } from '../shared/infrastructure/key-value-storages/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const container = await createContainer<Dependencies>()
  // External dependencies by manual register
  .register({
    informationBannersStorage: asValue(informationBannersStorage),
  })
  // Domain-context dependencies automatically registered
  .loadModules(
    [
      './application/*controller.ts',
      './domain/usecases/*.ts',
      './infrastructure/repositories/*repository.ts',
      './infrastructure/serializers/jsonapi/*.ts',
    ],
    { esModules: true, cwd: __dirname, formatName: 'camelCase' }
  );
