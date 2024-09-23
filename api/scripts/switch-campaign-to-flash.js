import 'dotenv/config';

import * as url from 'node:url';

import _ from 'lodash';

import { knex } from '../db/knex-database-connection.js';
import { Assessment } from '../src/shared/domain/models/Assessment.js';
import { executeScript } from './tooling/tooling.js';

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
  const fnWithArgs = main.bind(this, parseInt(process.argv[2]));
  await executeScript({ processArgvs: process.argv, scriptFn: fnWithArgs });
}

export { switchCampaignToFlash };
