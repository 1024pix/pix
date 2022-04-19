const { expect, domainBuilder } = require('../../../test-helper');
const {
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

describe('Unit | Domain | Models | ComplementaryCertificationCourseResult', function () {
  describe('#isPixEdu1erDegre', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
        expected: true,
      },
      {
        partnerKey: PIX_DROIT_MAITRE_CERTIF,
        expected: false,
      },
      {
        partnerKey: PIX_DROIT_EXPERT_CERTIF,
        expected: false,
      },
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
        expected: false,
      },
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
        expected: false,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
        expected: false,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
        expected: false,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
        expected: false,
      },
    ].forEach(({ partnerKey, expected }) => {
      it(`should return ${expected} when partnerKey is ${partnerKey}`, function () {
        // given
        const complementaryCertificationCourseResult = domainBuilder.buildComplementaryCertificationCourseResult({
          partnerKey,
        });

        // when
        const result = complementaryCertificationCourseResult.isPixEdu1erDegre();

        // then
        expect(result).to.equal(expected);
      });
    });
  });
  describe('#isPixEdu2ndDegre', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
        expected: false,
      },
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
        expected: false,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
        expected: false,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
        expected: false,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
        expected: false,
      },
      {
        partnerKey: PIX_DROIT_MAITRE_CERTIF,
        expected: false,
      },
      {
        partnerKey: PIX_DROIT_EXPERT_CERTIF,
        expected: false,
      },
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
        expected: true,
      },
    ].forEach(({ partnerKey, expected }) => {
      it(`should return ${expected} when partnerKey is ${partnerKey}`, function () {
        // given
        const complementaryCertificationCourseResult = domainBuilder.buildComplementaryCertificationCourseResult({
          partnerKey,
        });

        // when
        const result = complementaryCertificationCourseResult.isPixEdu2ndDegre();

        // then
        expect(result).to.equal(expected);
      });
    });
  });

  describe('#isPixEdu', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        partnerKey: PIX_DROIT_MAITRE_CERTIF,
        expected: false,
      },
      {
        partnerKey: PIX_DROIT_EXPERT_CERTIF,
        expected: false,
      },
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
        expected: true,
      },
    ].forEach(({ partnerKey, expected }) => {
      it(`should return ${expected} when partnerKey is ${partnerKey}`, function () {
        // given
        const complementaryCertificationCourseResult = domainBuilder.buildComplementaryCertificationCourseResult({
          partnerKey,
        });

        // when
        const result = complementaryCertificationCourseResult.isPixEdu();

        // then
        expect(result).to.equal(expected);
      });
    });
  });
});
