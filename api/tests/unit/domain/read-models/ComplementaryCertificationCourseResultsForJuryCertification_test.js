const { expect } = require('../../../test-helper');
const ComplementaryCertificationCourseResultsForJuryCertification = require('../../../../lib/domain/read-models/ComplementaryCertificationCourseResultsForJuryCertification');
const { PIX_EMPLOI_CLEA_V1, PIX_EMPLOI_CLEA_V2, PIX_EMPLOI_CLEA_V3, PIX_DROIT_MAITRE_CERTIF, PIX_DROIT_EXPERT_CERTIF } =
  require('../../../../lib/domain/models/Badge').keys;

describe('Unit | Domain | Models | ComplementaryCertificationCourseResultsForJuryCertification', function () {
  describe('#label', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      { partnerKey: PIX_EMPLOI_CLEA_V1, expectedLabel: 'CléA Numérique' },
      { partnerKey: PIX_EMPLOI_CLEA_V2, expectedLabel: 'CléA Numérique' },
      { partnerKey: PIX_EMPLOI_CLEA_V3, expectedLabel: 'CléA Numérique' },
      { partnerKey: PIX_DROIT_MAITRE_CERTIF, expectedLabel: 'Pix+ Droit Maître' },
      { partnerKey: PIX_DROIT_EXPERT_CERTIF, expectedLabel: 'Pix+ Droit Expert' },
    ].forEach(({ partnerKey, expectedLabel }) => {
      it(`should return ${expectedLabel} for partner key ${partnerKey}`, function () {
        // given
        const complementaryCertificationCourseResultsForJuryCertification =
          new ComplementaryCertificationCourseResultsForJuryCertification({ partnerKey });

        // when
        const label = complementaryCertificationCourseResultsForJuryCertification.label;

        // then
        expect(label).to.equal(expectedLabel);
      });
    });
  });

  describe('#status', function () {
    describe('when the complementary certification course result is acquired', function () {
      it('should return Validée', function () {
        // given
        const complementaryCertificationCourseResultsForJuryCertification =
          new ComplementaryCertificationCourseResultsForJuryCertification({ acquired: true });

        // when
        const status = complementaryCertificationCourseResultsForJuryCertification.status;

        // then
        expect(status).to.equal('Validée');
      });
    });

    describe('when the complementary certification course result is not acquired', function () {
      it('should return Rejetée', function () {
        // given
        const complementaryCertificationCourseResultsForJuryCertification =
          new ComplementaryCertificationCourseResultsForJuryCertification({ acquired: false });

        // when
        const status = complementaryCertificationCourseResultsForJuryCertification.status;

        // then
        expect(status).to.equal('Rejetée');
      });
    });
  });
});
