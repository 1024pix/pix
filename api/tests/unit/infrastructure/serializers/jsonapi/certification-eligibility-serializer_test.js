import { expect, domainBuilder } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/certification-eligibility-serializer';

describe('Unit | Serializer | JSONAPI | certification-eligibility-serializer', function () {
  describe('#serialize()', function () {
    it('should format certification eligibility model into into JSON API data', function () {
      // given
      const certificationEligibility = domainBuilder.buildCertificationEligibility({
        id: 123,
        pixCertificationEligible: true,
        eligibleComplementaryCertifications: ['CléA Numérique', 'Pix+ Droit Expert', 'Pix+ Édu 1er degré Avancé'],
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
            'eligible-complementary-certifications': [
              'CléA Numérique',
              'Pix+ Droit Expert',
              'Pix+ Édu 1er degré Avancé',
            ],
          },
        },
      });
    });
  });
});
