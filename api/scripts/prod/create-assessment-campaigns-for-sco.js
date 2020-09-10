// Usage: node create-assessment-campaigns.js --creatorId creatorId --filePath path/file.csv
// To use on file with columns |targetProfileId, name, externalId, title, customLandingPageText|, those headers included
const bluebird = require('bluebird');
const yargs = require('yargs');
const _ = require('lodash');
const { knex } = require('../../db/knex-database-connection');
const Campaign = require('../../lib/domain/models/Campaign');
const campaignCodeGenerator = require('../../lib/domain/services/campaigns/campaign-code-generator');
const campaignValidator = require('../../lib/domain/validators/campaign-validator');
const campaignRepository = require('../../lib/infrastructure/repositories/campaign-repository');
const { parseCsvWithHeader } = require('../helpers/csvHelpers');

function _validateAndNormalizeCreatorId(creatorId) {
  if (!creatorId || isNaN(creatorId)) {
    throw new Error(`Le User n’est pas défini correctement : "${creatorId}".`);
  }
  return creatorId;
}

function _validateAndNormalizeFilePath(filePath) {
  if (!filePath) {
    throw new Error(`Le chemin du fichier n’est pas défini correctement : "${filePath}".`);
  }
  return filePath;
}

function _validateAndNormalizeArgs({ creatorId, filePath }) {
  const finalCreatorId = _validateAndNormalizeCreatorId(creatorId);
  const finalFilePath = _validateAndNormalizeFilePath(filePath);

  return {
    creatorId: finalCreatorId,
    filePath: finalFilePath,
  };
}

function checkData(csvData) {
  return csvData.map(({ targetProfileId, name, externalId, title, customLandingPageText }) => {
    if (!targetProfileId) {
      throw new Error(`Un targetProfileId est manquant pour la campagne ${name}.`);
    }
    if (!name) {
      throw new Error(`Un nom de campagne est manquant pour le profil cible ${targetProfileId}.`);
    }
    if (!externalId) {
      throw new Error(`Un externalId est manquant pour le profil cible ${targetProfileId}.`);
    }
    if (_.isEmpty(title)) title = null;
    if (_.isEmpty(customLandingPageText)) customLandingPageText = null;

    return { targetProfileId, name, externalId, title, customLandingPageText };
  });
}

async function prepareCampaigns(creatorId, campaignsData) {
  const campaigns = await bluebird.mapSeries(campaignsData, async (campaignData) => {

    const organization = await getByExternalIdFetchingIdOnly(campaignData.externalId);

    const campaign = {
      creatorId,
      organizationId: organization.id,
      type: Campaign.types.ASSESSMENT,
      targetProfileId: campaignData.targetProfileId,
      name: campaignData.name,
      title: campaignData.title,
      customLandingPageText: campaignData.customLandingPageText,
    };

    campaignValidator.validate(campaign);
    campaign.code = await campaignCodeGenerator.generate(campaignRepository);
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
    const commandLineArgs = yargs
      .option('creatorId', {
        description: 'Id du créateur de la campagne',
        type: 'number',
      })
      .option('filePath', {
        description: 'Path du fichier CSV',
        type: 'string',
      })
      .help()
      .argv;
    const { creatorId, filePath } = _validateAndNormalizeArgs(commandLineArgs);

    console.log('Lecture et parsing du fichier csv... ');
    const csvData = parseCsvWithHeader(filePath);

    console.log('Vérification des données du fichier csv...');
    const checkedData = checkData(csvData);

    console.log('Création des modèles campagne...');
    const campaigns = await prepareCampaigns(creatorId, checkedData);

    console.log('Création des campagnes...');
    await createAssessmentCampaignsForSco(campaigns);

    console.log('FIN');
  } catch (error) {
    console.error('\x1b[31mErreur : %s\x1b[0m', error.message);
    yargs.showHelp();
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
  createAssessmentCampaignsForSco,
  prepareCampaigns,
  checkData,
  getByExternalIdFetchingIdOnly,
};
