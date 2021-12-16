'use strict';
require('dotenv').config();

const _ = require('lodash');
const bluebird = require('bluebird');

const { parseCsvWithHeader } = require('./helpers/csvHelpers');
const authenticationMethodRepository = require('../lib/infrastructure/repositories/authentication-method-repository');

async function cleanAnonymizedAuthenticationMethods({ arrayOfAnonymizedUsersIds }) {
  const anonymizedUserIdsWithAuthenticationMethodsDeleted = [];
  await bluebird.mapSeries(arrayOfAnonymizedUsersIds, async (userId) => {
    const numberOfRowDeleted = await authenticationMethodRepository.removeAllAuthenticationMethodsByUserId({
      userId,
    });
    if (numberOfRowDeleted > 0) {
      anonymizedUserIdsWithAuthenticationMethodsDeleted.push(userId);
    }
  });
  return anonymizedUserIdsWithAuthenticationMethodsDeleted;
}

async function main() {
  console.log('Starting deleting anonymized users authentication methods');

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
    const anonymizedUserIdsWithAllAuthenticationMethodsDeleted = await cleanAnonymizedAuthenticationMethods({
      arrayOfAnonymizedUsersIds,
    });

    console.log(
      "\nDone. Here the list of user's id which authentication methods were deleted : ",
      anonymizedUserIdsWithAllAuthenticationMethodsDeleted
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

module.exports = { cleanAnonymizedAuthenticationMethods };
