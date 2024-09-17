import 'dotenv/config';

import * as url from 'node:url';

import { knex } from '../db/knex-database-connection.js';
import { executeScript } from './tooling/tooling.js';

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

const DEFAULT_IMAGE_URL = 'https://images.pix.fr/profil-cible/Illu_GEN.svg';

async function fillTargetProfilesWithDefaultImageUrl() {
  await knex('target-profiles').whereNull('imageUrl').update({
    imageUrl: DEFAULT_IMAGE_URL,
  });
}

async function main() {
  await fillTargetProfilesWithDefaultImageUrl();
}

(async () => {
  if (isLaunchedFromCommandLine) {
    await executeScript({ processArgvs: process.argv, scriptFn: main });
  }
})();

export { fillTargetProfilesWithDefaultImageUrl };
