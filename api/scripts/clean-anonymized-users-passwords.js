'use strict';
require('dotenv').config();

const _ = require('lodash');
const bluebird = require('bluebird');

const { parseCsvWithHeader } = require('./helpers/csvHelpers');
const authenticationMethodRepository = require('../lib/infrastructure/repositories/authentication-method-repository');
const AuthenticationMethod = require('../lib/domain/models/AuthenticationMethod');

async function cleanAnonymizedUsersPasswords({ arrayOfAnonymizedUsersIds }) {
  const anonymizedUserIdsWithPasswordDeleted = [];
  await bluebird.mapSeries(arrayOfAnonymizedUsersIds, async (userId) => {
    const numberOfRowDeleted = await authenticationMethodRepository.removeByUserIdAndIdentityProvider({
      userId,
      identityProvider: AuthenticationMethod.identityProviders.PIX,
    });
    if (numberOfRowDeleted > 0) {
      anonymizedUserIdsWithPasswordDeleted.push(userId);
    }
  });
  return anonymizedUserIdsWithPasswordDeleted;
}

async function main() {
  console.log('Starting cleaning anonymized users with passwords');

  try {
    const filePath = process.argv[2];

    const anonymizedUsersIds = await parseCsvWithHeader(filePath);
    const arrayOfAnonymizedUsersIds = _(anonymizedUsersIds)
      .map((user) => user.ID)
      .filter((userId) => !_.isNil(userId))
      .value();

    if (arrayOfAnonymizedUsersIds.length < 1) {
      throw new Error('ID column must be present in CSV');
    }
    const anonymizedUserIdsWithPasswordDeleted = await cleanAnonymizedUsersPasswords({ arrayOfAnonymizedUsersIds });

    console.log(
      "\nDone. Here the list of user's id which password was deleted : ",
      anonymizedUserIdsWithPasswordDeleted
    );
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    }
  );
}

module.exports = { cleanAnonymizedUsersPasswords };
