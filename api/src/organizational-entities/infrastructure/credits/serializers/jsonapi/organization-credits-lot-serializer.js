import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (creditsLots) {
  return new Serializer('organization-credits-lot', {
    attributes: [
      'count',
      'consumedCount',
      'availableCount',
      'activationDate',
      'expirationDate',
      'reference',
      'status',
      'consumptions',
    ],
    consumptions: {
      attributes: ['organizationLearnerId', 'firstName', 'lastName', 'consumedAt'],
    },
  }).serialize(creditsLots);
};

export const organizationCreditsLotSerializer = { serialize };
