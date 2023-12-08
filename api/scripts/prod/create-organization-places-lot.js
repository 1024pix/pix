import { knex, disconnect } from '../../db/knex-database-connection.js';
import { parseCsvWithHeader } from '../helpers/csvHelpers.js';
import { OrganizationPlacesLot } from '../../src/prescription/organization-place/domain/models/OrganizationPlacesLot.js';
import * as categories from '../../src/prescription/organization-place/domain/constants/organization-places-categories.js';
import * as url from 'url';

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

      const organizationPlaceLot = new OrganizationPlacesLot({
        createdBy,
        organizationId,
        count,
        category: categoriesByCode[category],
        reference,
        activationDate: activationDateInCorrectFormat,
        expirationDate: expirationDateInCorrectFormat,
      });

      _log(
        `Lot de ${organizationPlaceLot.count} places ${organizationPlaceLot.category} pour l'organisation ${organizationPlaceLot.organizationId} ===> ✔\n`,
      );
      return organizationPlaceLot;
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

  console.log('Lecture et parsing du fichier csv... ');
  const csvData = await parseCsvWithHeader(filePath);

  console.log('Création des modèles et vérification de la cohérence...');
  const organizationPlacesLot = await prepareOrganizationPlacesLot(csvData);

  console.log('Insertion en base...');
  await createOrganizationPlacesLots(organizationPlacesLot);

  console.log('FIN');
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error('\x1b[31mErreur : %s\x1b[0m', error.message);
      if (error.invalidAttributes) {
        error.invalidAttributes.map((invalidAttribute) => {
          console.error(invalidAttribute.message);
        });
      }
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

function _log(message) {
  if (logEnable) {
    console.log(message);
  }
}

export { prepareOrganizationPlacesLot };
