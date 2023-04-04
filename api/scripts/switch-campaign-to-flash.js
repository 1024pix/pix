'use strict';
import _ from 'lodash';
import dotenv from 'dotenv';

dotenv.config();
import { knex } from '../db/knex-database-connection.js';
import { Assessment } from '../lib/domain/models/Assessment.js';
import * as url from 'url';

async function switchCampaignToFlash(id) {
  await knex('campaigns').update({ assessmentMethod: Assessment.methods.FLASH }).where({ id });
}

async function main(id) {
  if (!_.isFinite(id)) {
    throw new Error("L'id de campagne est obligatoire, node switch-campaign-to-flash.js <:id>");
  }

  await switchCampaignToFlash(id);
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;
if (isLaunchedFromCommandLine) {
  const id = parseInt(process.argv[2]);

  main(id).catch((err) => {
    console.error(err);
    process.exitCode = 1; // ou throw err
  });
}

export { switchCampaignToFlash };
