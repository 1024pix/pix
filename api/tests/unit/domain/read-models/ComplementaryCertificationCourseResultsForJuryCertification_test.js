const { expect } = require('../../../test-helper');
const ComplementaryCertificationCourseResultsForJuryCertification = require('../../../../lib/domain/read-models/ComplementaryCertificationCourseResultsForJuryCertification');
const {
  PIX_EMPLOI_CLEA_V1,
  PIX_EMPLOI_CLEA_V2,
  PIX_EMPLOI_CLEA_V3,
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
} = require('../../../../lib/domain/models/Badge').keys;

describe('Unit | Domain | Models | ComplementaryCertificationCourseResultsForJuryCertification', function () {
  describe('#label', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      { partnerKey: PIX_EMPLOI_CLEA_V1, expectedLabel: 'CléA Numérique' },
      { partnerKey: PIX_EMPLOI_CLEA_V2, expectedLabel: 'CléA Numérique' },
      { partnerKey: PIX_EMPLOI_CLEA_V3, expectedLabel: 'CléA Numérique' },
      { partnerKey: PIX_DROIT_MAITRE_CERTIF, expectedLabel: 'Pix+ Droit Maître' },
      { partnerKey: PIX_DROIT_EXPERT_CERTIF, expectedLabel: 'Pix+ Droit Expert' },
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
        expectedLabel: 'Pix+ Édu Initié (entrée dans le métier)',
      },
      { partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME, expectedLabel: 'Pix+ Édu Confirmé' },
      { partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME, expectedLabel: 'Pix+ Édu Confirmé' },
      { partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE, expectedLabel: 'Pix+ Édu Avancé' },
      { partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT, expectedLabel: 'Pix+ Édu Expert' },
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
        expectedLabel: 'Pix+ Édu Initié (entrée dans le métier)',
      },
      { partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME, expectedLabel: 'Pix+ Édu Confirmé' },
      { partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME, expectedLabel: 'Pix+ Édu Confirmé' },
      { partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE, expectedLabel: 'Pix+ Édu Avancé' },
      { partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT, expectedLabel: 'Pix+ Édu Expert' },
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
