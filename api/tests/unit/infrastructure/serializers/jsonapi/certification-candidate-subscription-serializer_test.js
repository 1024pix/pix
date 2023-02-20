import { expect, domainBuilder } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/certification-candidate-subscription-serializer';

describe('Unit | Serializer | JSONAPI | certification-candidate-subscription-serializer', function () {
  describe('#serialize', function () {
    it('should return a serialized JSON data object', function () {
      const certificationCandidateSubscription = domainBuilder.buildCertificationCandidateSubscription({
        id: 123,
        sessionId: 456,
        eligibleSubscriptions: [
          domainBuilder.buildComplementaryCertification({
            key: 'FIRST_COMPLEMENTARY',
            label: 'First Complementary Certification',
          }),
        ],
        nonEligibleSubscriptions: [
          domainBuilder.buildComplementaryCertification({
            key: 'SECOND_COMPLEMENTARY',
            label: 'Second Complementary Certification',
          }),
        ],
      });

      const expectedSerializedResult = {
        data: {
          id: '123',
          type: 'certification-candidate-subscriptions',
          attributes: {
            'eligible-subscriptions': [
              {
                id: 1,
                key: 'FIRST_COMPLEMENTARY',
                label: 'First Complementary Certification',
              },
            ],
            'non-eligible-subscriptions': [
              {
                id: 1,
                key: 'SECOND_COMPLEMENTARY',
                label: 'Second Complementary Certification',
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
