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
    .option('targetProfileId', {
      type: 'number',
      description: 'L\'id du target profile',
    })
    .option('locale', {
      type: 'string',
      description: 'Locale du challenge désiré',
      choices: ['fr', 'fr-fr', 'en'],
      default: 'fr',
    })
    .check((argv) => {
      return Boolean(argv.competenceId || argv.targetProfileId);
    })
    .argv;

  await launchTest(argv);

  process.exit(0);
}

index();
