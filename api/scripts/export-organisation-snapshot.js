#! /usr/bin/env node
const tokenService = require('../lib/domain/services/token-service');
const User = require('../lib/domain/models/User');

const fs = require('fs');
const request = require('request');

/**
 * Trois arguments pour télécharger les snapshots d'une orga:
 *
 * Dans le cas où userId = 1, organisationId = 2
 * La commande "./export-organisation-snapshot.js 1 2 export" crée un fichier organisation-2-export.csv
 */
function main(args) {
  const userId = args[2];
  const organizationId = args[3];
  const fileName = args[4];
  const userWeUseToCreateSnapshot = new User({ id: userId });

  const token = tokenService.createTokenFromUser(userWeUseToCreateSnapshot);

  request(`https://api.pix.fr/api/organizations/${organizationId}/snapshots/export?userToken=${token}`)
    .pipe(fs.createWriteStream(`organization-${organizationId}-${fileName}.csv`));
}

main(process.argv);
