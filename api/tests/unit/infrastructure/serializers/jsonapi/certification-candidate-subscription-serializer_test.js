const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-candidate-subscription-serializer');

describe('Unit | Serializer | JSONAPI | certification-candidate-subscription-serializer', function () {
  describe('#serialize', function () {
    it('should return a serialized JSON data object', function () {
      const certificationCandidateSubscription = domainBuilder.buildCertificationCandidateSubscription({
        id: 123,
        sessionId: 456,
        eligibleSubscriptions: [domainBuilder.buildComplementaryCertification({ name: 'Comp 1' })],
        nonEligibleSubscriptions: [domainBuilder.buildComplementaryCertification({ name: 'Comp 2' })],
      });

      const expectedSerializedResult = {
        data: {
          id: '123',
          type: 'certification-candidate-subscriptions',
          attributes: {
            'eligible-subscriptions': [
              {
                id: 1,
                name: 'Comp 1',
              },
            ],
            'non-eligible-subscriptions': [
              {
                id: 1,
                name: 'Comp 2',
              },
            ],
            'session-id': 456,
          },
        },
      };

      // when
      const result = serializer.serialize(certificationCandidateSubscription);

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });
  });
});
