import bluebird from 'bluebird';
import _ from 'lodash';
import { knex, disconnect } from '../../db/knex-database-connection.js';
import { CampaignTypes } from '../../src/prescription/campaign/domain/read-models/CampaignTypes.js';
import * as codeGenerator from '../../lib/domain/services/code-generator.js';
import * as campaignValidator from '../../lib/domain/validators/campaign-validator.js';
import * as campaignRepository from '../../src/prescription/campaign/infrastructure/repositories/campaign-administration-repository.js';
import { parseCsvWithHeader } from '../helpers/csvHelpers.js';
import * as url from 'url';

function checkData(csvData) {
  return csvData.map(({ targetProfileId, name, externalId, title, customLandingPageText, creatorId }) => {
    if (!targetProfileId) {
      throw new Error(`Un targetProfileId est manquant pour la campagne ${name}.`);
    }
    if (!name) {
      throw new Error(`Un nom de campagne est manquant pour le profil cible ${targetProfileId}.`);
    }
    if (!externalId) {
      throw new Error(`Un externalId est manquant pour le profil cible ${targetProfileId}.`);
    }
    if (!creatorId) {
      throw new Error(`Un creatorId est manquant pour le profil cible ${targetProfileId}.`);
    }
    if (_.isEmpty(title)) title = null;
    if (_.isEmpty(customLandingPageText)) customLandingPageText = null;

    return { targetProfileId, name, externalId, title, customLandingPageText, creatorId };
  });
}

async function prepareCampaigns(campaignsData) {
  const campaigns = await bluebird.mapSeries(campaignsData, async (campaignData) => {
    const organization = await getByExternalIdFetchingIdOnly(campaignData.externalId);

    const campaign = {
      creatorId: campaignData.creatorId,
      organizationId: organization.id,
      type: CampaignTypes.ASSESSMENT,
      targetProfileId: campaignData.targetProfileId,
      name: campaignData.name,
      title: campaignData.title,
      customLandingPageText: campaignData.customLandingPageText,
      multipleSendings: campaignData.multipleSendings,
    };

    campaignValidator.validate(campaign);
    campaign.code = await codeGenerator.generate(campaignRepository);
    if (isLaunchedFromCommandLine)
      process.stdout.write(`Campagne ${campaign.name} pour l'organisation ${campaign.organizationId} ===> ✔\n`);
    return campaign;
  });

  return campaigns.flat();
}

async function getByExternalIdFetchingIdOnly(externalId) {
  const organization = await knex('organizations')
    .select('id', 'externalId')
    .whereRaw('LOWER (??) = ?', ['externalId', externalId.toLowerCase()])
    .first();

  if (!organization) {
    throw new Error(`L'organisation d'UAI ${externalId} n'existe pas.`);
  }

  return organization;
}

function createAssessmentCampaignsForSco(campaigns) {
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
  await createAssessmentCampaignsForSco(campaigns);

  console.log('FIN');
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export { prepareCampaigns, checkData, getByExternalIdFetchingIdOnly };
