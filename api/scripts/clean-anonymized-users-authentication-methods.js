'use strict';
require('dotenv').config();

import _ from 'lodash';
import bluebird from 'bluebird';
import { disconnect } from '../db/knex-database-connection';
import { parseCsvWithHeader } from './helpers/csvHelpers';
import authenticationMethodRepository from '../lib/infrastructure/repositories/authentication-method-repository';

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

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  console.log('Starting deleting anonymized users authentication methods');

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
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export default { cleanAnonymizedAuthenticationMethods };
