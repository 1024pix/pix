import jsonapiSerializer from 'jsonapi-serializer';

import { Candidate } from '../../domain/models/Candidate.js';
import { EditedCandidate } from '../../domain/models/EditedCandidate.js';

const { Deserializer, Serializer } = jsonapiSerializer;

async function deserialize(json) {
  const deserializer = new Deserializer({ keyForAttribute: 'camelCase' });
  const deserializedCandidate = await deserializer.deserialize(json);
  deserializedCandidate.birthINSEECode = deserializedCandidate.birthInseeCode;

  return new Candidate({
    ...deserializedCandidate,
    id: deserializedCandidate?.id ? parseInt(deserializedCandidate?.id) : null,
    firstName: deserializedCandidate.firstName.trim(),
    lastName: deserializedCandidate.lastName.trim(),
    subscription: _resolveSubscription(deserializedCandidate, json),
  });
}

function _resolveSubscription(deserializedCandidate, json) {
  if (deserializedCandidate.subscription) {
    return deserializedCandidate.subscription;
  }
  const subscriptions = json?.data?.attributes?.subscriptions;
  const complementary = subscriptions.find((s) => s.type === 'COMPLEMENTARY');
  return complementary?.complementaryCertificationKey ?? 'CORE';
}

function deserializeForEdition({ candidateId, candidateData }) {
  return new EditedCandidate({
    id: candidateId,
    accessibilityAdjustmentNeeded: candidateData['accessibility-adjustment-needed'],
  });
}

const serializeForParticipation = function (candidate) {
  return new Serializer('certification-candidate', {
    attributes: [
      'firstName',
      'lastName',
      'birthdate',
      'sessionId',
      'hasSeenCertificationInstructions',
      'subscription',
      'hasStartedTest',
      'doubleCertificationEligibility',
    ],
  }).serialize(candidate);
};

function serializeId(candidateId) {
  return new Serializer('certification-candidate', {}).serialize({ id: candidateId });
}

function serialize(candidates) {
  return new Serializer('certification-candidate', {
    attributes: [
      'firstName',
      'lastName',
      'birthdate',
      'birthProvinceCode',
      'birthCity',
      'birthCountry',
      'email',
      'resultRecipientEmail',
      'externalId',
      'extraTimePercentage',
      'isLinked',
      'organizationLearnerId',
      'sex',
      'birthINSEECode',
      'birthPostalCode',
      'complementaryCertification',
      'subscription',
      'billingMode',
      'prepaymentCode',
      'hasSeenCertificationInstructions',
      'accessibilityAdjustmentNeeded',
    ],
  }).serialize(candidates);
}

function serializeForSession(candidates) {
  return new Serializer('certification-candidate', {
    attributes: ['firstName', 'lastName', 'birthdate', 'subscription'],
  }).serialize(candidates);
}

export const candidateSerializer = {
  deserialize,
  deserializeForEdition,
  serializeForParticipation,
  serializeId,
  serialize,
  serializeForSession,
};
