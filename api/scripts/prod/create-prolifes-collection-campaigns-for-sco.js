// Usage: node create-profile-collection-campaigns-for-sco.js path/file.csv <creatorId>
// To use on file with columns |name, customLandingPageText, organizationsId|, those headers included
const bluebird = require('bluebird');
const { knex } = require('../../db/knex-database-connection');
const Campaign = require('../../lib/domain/models/Campaign');
const campaignCodeGenerator = require('../../lib/domain/services/campaigns/campaign-code-generator');
const campaignValidator = require('../../lib/domain/validators/campaign-validator');
const campaignRepository = require('../../lib/infrastructure/repositories/campaign-repository');
const { parseCsvWithHeader } = require('../helpers/csvHelpers');

function checkData(campaignData) {
  return campaignData.map(({ name, organizationId, customLandingPageText }, index) => {
    if (!organizationId) {
      throw new Error(`Ligne ${index + 1}: Une organizationId est obligatoire pour la campagne de collecte de profile.`);
    }

    if (!name) {
      throw new Error(`Ligne ${index + 1}: Un nom de campagne est obligatoire pour la campagne de collecte de profile.`);
    }

    return { name, organizationId, customLandingPageText };
  });
}

async function prepareCampaigns(campaignsData, creatorId) {
  const campaigns = await bluebird.map(campaignsData, async (campaignData) => {

    const campaign = {
      creatorId,
      type: Campaign.types.PROFILES_COLLECTION,

      name: campaignData.name,
      customLandingPageText: campaignData.customLandingPageText || '',
      organizationId: campaignData.organizationId,
    };

    campaignValidator.validate(campaign);
    campaign.code = await campaignCodeGenerator.generate(campaignRepository);

    if (require.main === module) process.stdout.write(`Collecte de Profile ${ campaign.name } pour l'organisation ${ campaign.organizationId } ===> ✔\n`);
    return campaign;
  }, { concurrency: 5 });

  return campaigns.flat();
}

function createProfilesCollectionCampaigns(campaigns) {
  return knex.batchInsert('campaigns', campaigns);
}

async function main() {
  try {
    const filePath = process.argv[2];
    const creatorId = process.argv[3];

    if (!creatorId) {
      throw new Error('le creatorId est obligatoire.');
    }

    console.log('Lecture et parsing du fichier csv... ');
    const csvData = await parseCsvWithHeader(filePath);

    console.log('Vérification des données du fichier csv...');
    const checkedData = checkData(csvData);

    console.log('Création des modèles campagne...');
    const campaigns = await prepareCampaigns(checkedData, creatorId);

    console.log('Création des campagnes...');
    await createProfilesCollectionCampaigns(campaigns);

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
};
