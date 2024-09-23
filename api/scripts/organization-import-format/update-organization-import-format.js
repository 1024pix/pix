import { readFile } from 'node:fs/promises';
import * as url from 'node:url';

import { usecases } from '../../src/prescription/learner-management/domain/usecases/index.js';
import { DomainTransaction } from '../../src/shared/domain/DomainTransaction.js';
import { executeScript } from '../tooling/tooling.js';
// Usage: node scripts/organization-import-format/update-organization-import-format.js path/data.json
// data.json
// [{
//   "name": 'FORMAT_NAME',
//   "config": {
//      "new_config": "awesome",
//    },
//   "fileType": "csv",
// }]

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  console.log('Starting update import format configuration');

  const filePath = process.argv[2];

  console.log('Reading json data file... ');
  const jsonFile = await readFile(filePath);
  const rawImportFormats = JSON.parse(jsonFile);
  console.log(`Import Format to update : ${rawImportFormats.length}`);
  await DomainTransaction.execute(async () => {
    await usecases.updateOrganizationLearnerImportFormats({ rawImportFormats });
  });
}

(async () => {
  if (isLaunchedFromCommandLine) {
    await executeScript({ processArgvs: process.argv, scriptFn: main });
  }
})();
