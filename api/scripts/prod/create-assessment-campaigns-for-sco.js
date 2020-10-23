// Usage: node create-assessment-campaigns.js path/file.csv
// To use on file with columns |targetProfileId, name, externalId, title, customLandingPageText, creatorId|, those headers included
const bluebird = require('bluebird');
const _ = require('lodash');
const { knex } = require('../../db/knex-database-connection');
const Campaign = require('../../lib/domain/models/Campaign');
const campaignCodeGenerator = require('../../lib/domain/services/campaigns/campaign-code-generator');
const campaignValidator = require('../../lib/domain/validators/campaign-validator');
const campaignRepository = require('../../lib/infrastructure/repositories/campaign-repository');
const { parseCsvWithHeader } = require('../helpers/csvHelpers');

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
      type: Campaign.types.ASSESSMENT,
      targetProfileId: campaignData.targetProfileId,
      name: campaignData.name,
      title: campaignData.title,
      customLandingPageText: campaignData.customLandingPageText,
    };

    campaignValidator.validate(campaign);
    campaign.code = await campaignCodeGenerator.generate(campaignRepository);
    if (require.main === module) process.stdout.write(`Campagne ${ campaign.name } pour l'organisation ${ campaign.organizationId } ===> ✔\n`);
    return campaign;
  });

  return campaigns.flat();
}

async function getByExternalIdFetchingIdOnly(externalId) {
  const organization = await knex('organizations').select('id', 'externalId')
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

async function main() {
  try {
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
  } catch (error) {
    console.error('\x1b[31mErreur : %s\x1b[0m', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    },
  );
}

module.exports = {
  prepareCampaigns,
  checkData,
  getByExternalIdFetchingIdOnly,
};
