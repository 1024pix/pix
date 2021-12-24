const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-eligibility-serializer');

describe('Unit | Serializer | JSONAPI | certification-eligibility-serializer', function () {
  describe('#serialize()', function () {
    it('should format certification eligibility model into into JSON API data', function () {
      // given
      const certificationEligibility = domainBuilder.buildCertificationEligibility({
        id: 123,
        pixCertificationEligible: false,
        cleaCertificationEligible: true,
        pixPlusDroitMaitreCertificationEligible: false,
        pixPlusDroitExpertCertificationEligible: true,
        pixPlusEduAutonomeCertificationEligible: false,
        pixPlusEduAvanceCertificationEligible: false,
        pixPlusEduExpertCertificationEligible: true,
        pixPlusEduFormateurCertificationEligible: false,
      });

      // when
      const json = serializer.serialize(certificationEligibility);

      // then
      expect(json).to.deep.equal({
        data: {
          id: '123',
          type: 'isCertifiables',
          attributes: {
            'is-certifiable': false,
            'clea-certification-eligible': true,
            'pix-plus-droit-maitre-certification-eligible': false,
            'pix-plus-droit-expert-certification-eligible': true,
            'pix-plus-edu-autonome-certification-eligible': false,
            'pix-plus-edu-avance-certification-eligible': false,
            'pix-plus-edu-expert-certification-eligible': true,
            'pix-plus-edu-formateur-certification-eligible': false,
          },
        },
      });
    });
  });
});
