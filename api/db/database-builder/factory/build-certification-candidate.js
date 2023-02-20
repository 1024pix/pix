import _ from 'lodash';
import buildSession from './build-session';
import buildUser from './build-user';
import databaseBuffer from '../database-buffer';

export default function buildCertificationCandidate({
  id = databaseBuffer.getNextId(),
  firstName = 'first-name',
  lastName = 'last-name',
  sex = 'M',
  birthPostalCode = null,
  birthINSEECode = '75101',
  birthCity = 'PARIS 1',
  birthProvinceCode = null,
  birthCountry = 'France',
  email = 'somemail@example.net',
  birthdate = '2000-01-04',
  resultRecipientEmail = 'somerecipientmail@example.net',
  sessionId,
  externalId = 'externalId',
  createdAt = new Date('2020-01-01'),
  extraTimePercentage = 0.3,
  userId,
  organizationLearnerId,
  authorizedToStart = false,
  billingMode = null,
  prepaymentCode = null,
} = {}) {
  sessionId = _.isUndefined(sessionId) ? buildSession().id : sessionId;
  userId = _.isUndefined(userId) ? buildUser().id : userId;

  const values = {
    id,
    firstName,
    lastName,
    sex,
    birthPostalCode,
    birthINSEECode,
    birthCity,
    birthProvinceCode,
    birthCountry,
    email,
    resultRecipientEmail,
    birthdate,
    sessionId,
    externalId,
    extraTimePercentage,
    createdAt,
    userId,
    organizationLearnerId,
    authorizedToStart,
    billingMode,
    prepaymentCode,
  };

  databaseBuffer.pushInsertable({
    tableName: 'certification-candidates',
    values,
  });

  return {
    id,
    firstName,
    lastName,
    sex,
    birthPostalCode,
    birthINSEECode,
    birthCity,
    birthProvinceCode,
    birthCountry,
    email,
    resultRecipientEmail,
    birthdate,
    sessionId,
    externalId,
    extraTimePercentage,
    createdAt,
    userId,
    organizationLearnerId,
    authorizedToStart,
    billingMode,
    prepaymentCode,
  };
}
