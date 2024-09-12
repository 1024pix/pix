import * as serializer from '../../../../../../src/certification/enrolment/infrastructure/serializers/user-certification-eligibility-serializer.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Serializer | user-certification-eligibility-serializer', function () {
  describe('#serialize()', function () {
    it('should format certification eligibility model into into JSON API data', function () {
      // given
      const userCertificationEligibility = domainBuilder.certification.enrolment.buildUserCertificationEligibility({
        id: 123,
        isCertifiable: true,
        certificationEligibilities: [
          domainBuilder.certification.enrolment.buildV3CertificationEligibility({
            label: 'Un super label',
            imageUrl: 'Une super image',
            isOutdated: false,
            isAcquiredExpectedLevel: false,
          }),
        ],
      });

      // when
      const json = serializer.serialize(userCertificationEligibility);

      // then
      expect(json).to.deep.equal({
        data: {
          id: '123',
          type: 'isCertifiables',
          attributes: {
            'is-certifiable': true,
            'complementary-certifications': [
              {
                label: 'Un super label',
                imageUrl: 'Une super image',
                isOutdated: false,
                isAcquiredExpectedLevel: false,
              },
            ],
          },
        },
      });
    });
  });
});
