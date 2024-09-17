import * as url from 'node:url';

import { disconnect, knex } from '../../db/knex-database-connection.js';
import * as campaignUpdateValidator from '../../src/prescription/campaign/domain/validators/campaign-update-validator.js';
import * as campaignRepository from '../../src/prescription/campaign/infrastructure/repositories/campaign-administration-repository.js';
import { CampaignTypes } from '../../src/prescription/shared/domain/constants.js';
import * as codeGenerator from '../../src/shared/domain/services/code-generator.js';
import { PromiseUtils } from '../../src/shared/infrastructure/utils/promise-utils.js';
import { parseCsvWithHeader } from '../helpers/csvHelpers.js';
import { executeAndLogScript } from '../tooling/tooling.js';

function checkData(campaignData) {
  return campaignData.map(({ name, organizationId, customLandingPageText, creatorId }, index) => {
    if (!organizationId) {
      throw new Error(`Ligne ${index + 1}: L'organizationId est obligatoire pour la campagne de collecte de profils.`);
    }
    if (!name) {
      throw new Error(
        `Ligne ${index + 1}: Le nom de campagne est obligatoire pour la campagne de collecte de profils.`,
      );
    }
    if (!creatorId) {
      throw new Error(`Ligne ${index + 1}: Le creatorId est obligatoire pour la campagne de collecte de profils.`);
    }

    return { name, organizationId, customLandingPageText, creatorId };
  });
}

async function prepareCampaigns(campaignsData) {
  const generatedList = [];
  const campaigns = await PromiseUtils.map(
    campaignsData,
    async (campaignData) => {
      const campaign = {
        creatorId: campaignData.creatorId,
        organizationId: campaignData.organizationId,
        type: CampaignTypes.PROFILES_COLLECTION,
        name: campaignData.name,
        customLandingPageText: campaignData.customLandingPageText,
        multipleSendings: campaignData.multipleSendings,
      };

      campaignUpdateValidator.validate(campaign);
      campaign.code = await codeGenerator.generate(campaignRepository, generatedList);
      generatedList.push(campaign.code);

      if (isLaunchedFromCommandLine)
        process.stdout.write(
          `Campagne de collecte de profils ${campaign.name} pour l'organisation ${campaign.organizationId} ===> ✔\n`,
        );
      return campaign;
    },
    { concurrency: 10 },
  );

  return campaigns.flat();
}

function createProfilesCollectionCampaigns(campaigns) {
  return knex.batchInsert('campaigns', campaigns);
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

async function main() {
  const filePath = process.argv[2];

  console.log('Lecture et parsing du fichier csv... ');
  const csvData = await parseCsvWithHeader(filePath);

  console.log('Vérification des données du fichier csv...');
  const checkedData = checkData(csvData);

  console.log('Création des modèles campagne...');
  const campaigns = await prepareCampaigns(checkedData);

  console.log('Création des campagnes...');
  await createProfilesCollectionCampaigns(campaigns);

  console.log('FIN');
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await executeAndLogScript({ processArgvs: process.argv, scriptFn: main });
    } catch (error) {
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export { checkData, prepareCampaigns };
