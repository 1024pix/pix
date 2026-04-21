import * as serializer from '../../../../../../src/certification/enrolment/infrastructure/serializers/certification-candidate-subscription-serializer.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Enrolment | Unit | Serializer | certification-candidate-subscription', function () {
  describe('#serialize', function () {
    it('should return a serialized JSON data object', function () {
      const certificationCandidateSubscription = domainBuilder.buildCertificationCandidateSubscription({
        id: 123,
        sessionId: 456,
        enrolledDoubleCertificationLabel: 'First Complementary Certification',
        doubleCertificationEligibility: true,
      });

      // when
      const result = serializer.serialize(certificationCandidateSubscription);

      // then
      const expectedSerializedResult = {
        data: {
          id: '123',
          type: 'certification-candidate-subscriptions',
          attributes: {
            'enrolled-double-certification-label': 'First Complementary Certification',
            'double-certification-eligibility': true,
            'session-id': 456,
          },
        },
      };
      expect(result).to.deep.equal(expectedSerializedResult);
    });
  });
});
