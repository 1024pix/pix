'use strict';
import yargs from 'yargs'

config();
import { hideBin } from 'yargs/helpers';

import { config } from 'dotenv';

import { launchTest } from './algo.js';

async function index() {
  const argv = yargs(hideBin(process.argv))
    .option('competenceId', {
      type: 'string',
      description: 'L\'id de la compétence',
    })
    .option('campaignId', {
      type: 'number',
      description: 'L\'id d\'une campagne',
    })
    .option('locale', {
      type: 'string',
      description: 'Locale du challenge désiré',
      choices: ['fr', 'fr-fr', 'en'],
      default: 'fr',
    })
    .option('userResult', {
      type: 'string',
      description: 'Choix de réponse pour l\'utilisateur',
      choices: ['ok', 'ko', 'random', 'firstOKthenKO', 'firstKOthenOK'],
      default: 'ok',
    })
    .option('usersKEFile', {
      type: 'string',
      description: 'Localisation du fichier .json',
    })
    .option('enabledCsvOutput', {
      type: 'boolean',
      description: 'Permet de sortir les résultats dans un fichier csv',
      default: false,
    })
    .check((argv) => {
      return Boolean(argv.competenceId || argv.campaignId);
    }).argv;

  await launchTest(argv);

  process.exit(0);
}

index();
