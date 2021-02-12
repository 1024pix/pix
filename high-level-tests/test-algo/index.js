'use strict';
require('dotenv').config();
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const { launchTest } = require('./algo');

async function index() {
  const argv = yargs(hideBin(process.argv))
    .option('competenceId', {
      type: 'string',
      description: 'L\'id de la compétence',
    })
    .option('locale', {
      type: 'string',
      description: 'Locale du challenge désiré',
      choices: ['fr', 'fr-fr', 'en'],
      default: 'fr',
    })
    .demandOption(['competenceId'])
    .argv;

  await launchTest(argv);

  process.exit(0);
}

index();
