import bluebird from 'bluebird';
import { knex, disconnect } from '../../db/knex-database-connection';
import CampaignTypes from '../../lib/domain/models/CampaignTypes';
import campaignCodeGenerator from '../../lib/domain/services/campaigns/campaign-code-generator';
import campaignValidator from '../../lib/domain/validators/campaign-validator';
import campaignRepository from '../../lib/infrastructure/repositories/campaign-repository';
import { parseCsvWithHeader } from '../helpers/csvHelpers';

function checkData(campaignData) {
  return campaignData.map(({ name, organizationId, customLandingPageText, creatorId }, index) => {
    if (!organizationId) {
      throw new Error(`Ligne ${index + 1}: L'organizationId est obligatoire pour la campagne de collecte de profils.`);
    }
    if (!name) {
      throw new Error(
        `Ligne ${index + 1}: Le nom de campagne est obligatoire pour la campagne de collecte de profils.`
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
  const campaigns = await bluebird.map(
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

      campaignValidator.validate(campaign);
      campaign.code = await campaignCodeGenerator.generate(campaignRepository, generatedList);
      generatedList.push(campaign.code);

      if (require.main === module)
        process.stdout.write(
          `Campagne de collecte de profils ${campaign.name} pour l'organisation ${campaign.organizationId} ===> ✔\n`
        );
      return campaign;
    },
    { concurrency: 10 }
  );

  return campaigns.flat();
}

function createProfilesCollectionCampaigns(campaigns) {
  return knex.batchInsert('campaigns', campaigns);
}

const isLaunchedFromCommandLine = require.main === module;

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
      await main();
    } catch (error) {
      console.error('\x1b[31mErreur : %s\x1b[0m', error.message);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export default {
  prepareCampaigns,
  checkData,
};
