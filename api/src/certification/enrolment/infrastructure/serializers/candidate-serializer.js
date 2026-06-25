import jsonapiSerializer from 'jsonapi-serializer';

import { Candidate } from '../../domain/models/Candidate.js';
import { EditedCandidate } from '../../domain/models/EditedCandidate.js';
import { Subscription } from '../../domain/models/Subscription.js';

const { Deserializer, Serializer } = jsonapiSerializer;

async function deserialize(json) {
  const deserializer = new Deserializer({ keyForAttribute: 'camelCase' });
  const deserializedCandidate = await deserializer.deserialize(json);
  deserializedCandidate.birthINSEECode = deserializedCandidate.birthInseeCode;
  const { attributes } = json.data;

  const subscriptions = attributes['subscriptions'].map(
    ({ type, complementaryCertificationKey }) =>
      new Subscription({
        certificationCandidateId: null,
        type,
        complementaryCertificationKey,
      }),
  );

  return Candidate.create({
    ...deserializedCandidate,
    id: deserializedCandidate?.id ? parseInt(deserializedCandidate?.id) : null,
    subscriptions,
    firstName: deserializedCandidate.firstName.trim(),
    lastName: deserializedCandidate.lastName.trim(),
  });
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
