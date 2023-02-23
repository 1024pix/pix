'use strict';
const _ = require('lodash');
const dotenv = require('dotenv');
dotenv.config();
const { knex } = require('../db/knex-database-connection');
const Assessment = require('../lib/domain/models/Assessment');

async function switchCampaignToFlash(id) {
  await knex('campaigns').update({ assessmentMethod: Assessment.methods.FLASH }).where({ id });
}

async function main(id) {
  if (!_.isFinite(id)) {
    throw new Error("L'id de campagne est obligatoire, node switch-campaign-to-flash.js <:id>");
  }

  await switchCampaignToFlash(id);
}

if (require.main === module) {
  const id = parseInt(process.argv[2]);

  main(id).catch((err) => {
    console.error(err);
    process.exitCode = 1; // ou throw err
  });
}

module.exports = { switchCampaignToFlash };
