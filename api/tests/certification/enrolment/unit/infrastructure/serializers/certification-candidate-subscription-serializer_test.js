import * as serializer from '../../../../../../src/certification/enrolment/infrastructure/serializers/certification-candidate-subscription-serializer.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Serializer | certification-candidate-subscription', function () {
  describe('#serialize', function () {
    it('should return a serialized JSON data object', function () {
      const certificationCandidateSubscription = domainBuilder.buildCertificationCandidateSubscription({
        id: 123,
        sessionId: 456,
        eligibleSubscription: domainBuilder.buildComplementaryCertification({
          key: 'FIRST_COMPLEMENTARY',
          label: 'First Complementary Certification',
        }),
        sessionVersion: 2,

        nonEligibleSubscription: domainBuilder.buildComplementaryCertification({
          key: 'SECOND_COMPLEMENTARY',
          label: 'Second Complementary Certification',
        }),
      });

      const expectedSerializedResult = {
        data: {
          id: '123',
          type: 'certification-candidate-subscriptions',
          attributes: {
            'eligible-subscription': {
              id: 1,
              key: 'FIRST_COMPLEMENTARY',
              label: 'First Complementary Certification',
            },
            'non-eligible-subscription': {
              id: 1,
              key: 'SECOND_COMPLEMENTARY',
              label: 'Second Complementary Certification',
            },
            'session-id': 456,
            'session-version': 2,
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
