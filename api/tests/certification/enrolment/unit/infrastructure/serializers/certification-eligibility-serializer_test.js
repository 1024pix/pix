import * as serializer from '../../../../../../src/certification/enrolment/infrastructure/serializers/certification-eligibility-serializer.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Serializer | certification-eligibility-serializer', function () {
  describe('#serialize()', function () {
    it('should format certification eligibility model into into JSON API data', function () {
      // given
      const certificationEligibility = domainBuilder.certification.enrolment.buildCertificationEligibility({
        id: 123,
        pixCertificationEligible: true,
        complementaryCertifications: ['CléA Numérique', 'Pix+ Droit Expert', 'Pix+ Édu 1er degré Avancé'],
      });

      // when
      const json = serializer.serialize(certificationEligibility);

      // then
      expect(json).to.deep.equal({
        data: {
          id: '123',
          type: 'isCertifiables',
          attributes: {
            'is-certifiable': true,
            'complementary-certifications': ['CléA Numérique', 'Pix+ Droit Expert', 'Pix+ Édu 1er degré Avancé'],
          },
        },
      });
    });
  });
});
