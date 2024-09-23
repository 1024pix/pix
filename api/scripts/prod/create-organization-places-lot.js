import * as url from 'node:url';

import { knex } from '../../db/knex-database-connection.js';
import * as categories from '../../src/prescription/organization-place/domain/constants/organization-places-categories.js';
import { OrganizationPlacesLotForManagement } from '../../src/prescription/organization-place/domain/models/OrganizationPlacesLotForManagement.js';
import { parseCsvWithHeader } from '../helpers/csvHelpers.js';
import { executeScript } from '../tooling/tooling.js';

const categoriesByCode = {
  [categories.T0]: categories.FREE_RATE,
  [categories.T1]: categories.PUBLIC_RATE,
  [categories.T2]: categories.REDUCE_RATE,
  [categories.T2bis]: categories.SPECIAL_REDUCE_RATE,
  [categories.T3]: categories.FULL_RATE,
};

let logEnable;

async function prepareOrganizationPlacesLot(organizationPlacesLotData, log = true) {
  logEnable = log;
  const organizationPlacesLot = organizationPlacesLotData.map(
    ({ createdBy, organizationId, count, category, reference, activationDate, expirationDate }) => {
      const activationDateInCorrectFormat = activationDate?.split('/').reverse().join('-');
      const expirationDateInCorrectFormat = expirationDate?.split('/').reverse().join('-');

      const organizationPlacesLot = new OrganizationPlacesLotForManagement({
        createdBy,
        organizationId,
        count,
        category: categoriesByCode[category],
        reference,
        activationDate: activationDateInCorrectFormat,
        expirationDate: expirationDateInCorrectFormat,
      });

      _log(
        `Lot de ${organizationPlacesLot.count} places ${organizationPlacesLot.category} pour l'organisation ${organizationPlacesLot.organizationId} ===> ✔\n`,
      );
      return organizationPlacesLot;
    },
  );

  return organizationPlacesLot.flat();
}

function createOrganizationPlacesLots(organizationPlacesLot) {
  return knex.batchInsert('organization-places', organizationPlacesLot);
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  const filePath = process.argv[2];
  try {
    console.log('Lecture et parsing du fichier csv... ');
    const csvData = await parseCsvWithHeader(filePath);

    console.log('Création des modèles et vérification de la cohérence...');
    const organizationPlacesLot = await prepareOrganizationPlacesLot(csvData);

    console.log('Insertion en base...');
    await createOrganizationPlacesLots(organizationPlacesLot);

    console.log('FIN');
  } catch (err) {
    if (err.invalidAttributes) {
      err.invalidAttributes.map((invalidAttribute) => {
        console.error(invalidAttribute.message);
      });
    }
    throw err;
  }
}

(async () => {
  if (isLaunchedFromCommandLine) {
    await executeScript({ processArgvs: process.argv, scriptFn: main });
  }
})();

function _log(message) {
  if (logEnable) {
    console.log(message);
  }
}

export { prepareOrganizationPlacesLot };
