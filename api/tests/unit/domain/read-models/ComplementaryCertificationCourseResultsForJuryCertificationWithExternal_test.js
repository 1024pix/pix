// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable mocha/no-setup-in-describe */
const ComplementaryCertificationCourseResultsForJuryCertificationWithExternal = require('../../../../lib/domain/read-models/ComplementaryCertificationCourseResultsForJuryCertificationWithExternal');
const { expect, domainBuilder, catchErr } = require('../../../test-helper');
const {
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

describe('Unit | Domain | Models | ComplementaryCertificationCourseResultsForJuryCertificationWithExternal', function () {
  describe('#finalResult', function () {
    context('when external section is not scored yet', function () {
      it('should return "En attente volet jury" ', function () {
        // given
        const complementaryCertificationCourseResultForJuryCertificationWithExternal =
          domainBuilder.buildComplementaryCertificationCourseResultForJuryCertificationWithExternal({
            pixPartnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
            pixAcquired: true,
            externalPartnerKey: null,
          });

        // when
        const finalResult = complementaryCertificationCourseResultForJuryCertificationWithExternal.finalResult;

        // then
        expect(finalResult).to.be.equal('En attente volet jury');
      });
    });

    it('should return "Rejetée" when pix section is not obtained', function () {
      // given
      const complementaryCertificationCourseResultForJuryCertificationWithExternal =
        domainBuilder.buildComplementaryCertificationCourseResultForJuryCertificationWithExternal({
          pixPartnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
          pixAcquired: false,
        });

      // when
      const finalResult = complementaryCertificationCourseResultForJuryCertificationWithExternal.finalResult;

      // then
      expect(finalResult).to.equal('Rejetée');
    });

    context('when both section are scored', function () {
      it('should return "Rejetée" when external section is not obtained', function () {
        // given
        const complementaryCertificationCourseResultForJuryCertificationWithExternal =
          domainBuilder.buildComplementaryCertificationCourseResultForJuryCertificationWithExternal({
            pixPartnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
            pixAcquired: true,
            externalPartnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
            externalAcquired: false,
          });

        // when
        const finalResult = complementaryCertificationCourseResultForJuryCertificationWithExternal.finalResult;

        // then
        expect(finalResult).to.equal('Rejetée');
      });

      [
        {
          pixPartnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
          externalPartnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
          expectedFinalResult:
            ComplementaryCertificationCourseResultsForJuryCertificationWithExternal.labels[
              PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE
            ],
        },
        {
          pixPartnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
          externalPartnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
          expectedFinalResult:
            ComplementaryCertificationCourseResultsForJuryCertificationWithExternal.labels[
              PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE
            ],
        },
        {
          pixPartnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
          externalPartnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
          expectedFinalResult:
            ComplementaryCertificationCourseResultsForJuryCertificationWithExternal.labels[
              PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME
            ],
        },
        {
          pixPartnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
          externalPartnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
          expectedFinalResult:
            ComplementaryCertificationCourseResultsForJuryCertificationWithExternal.labels[
              PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME
            ],
        },
        {
          pixPartnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
          externalPartnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
          expectedFinalResult:
            ComplementaryCertificationCourseResultsForJuryCertificationWithExternal.labels[
              PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME
            ],
        },
        {
          pixPartnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
          externalPartnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
          expectedFinalResult:
            ComplementaryCertificationCourseResultsForJuryCertificationWithExternal.labels[
              PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME
            ],
        },
        {
          pixPartnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
          externalPartnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
          expectedFinalResult:
            ComplementaryCertificationCourseResultsForJuryCertificationWithExternal.labels[
              PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE
            ],
        },
        {
          pixPartnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
          externalPartnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
          expectedFinalResult:
            ComplementaryCertificationCourseResultsForJuryCertificationWithExternal.labels[
              PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE
            ],
        },
        {
          pixPartnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
          externalPartnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
          expectedFinalResult:
            ComplementaryCertificationCourseResultsForJuryCertificationWithExternal.labels[
              PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT
            ],
        },
        {
          pixPartnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
          externalPartnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
          expectedFinalResult:
            ComplementaryCertificationCourseResultsForJuryCertificationWithExternal.labels[
              PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE
            ],
        },
        {
          pixPartnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
          externalPartnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
          expectedFinalResult:
            ComplementaryCertificationCourseResultsForJuryCertificationWithExternal.labels[
              PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE
            ],
        },
        {
          pixPartnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
          externalPartnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
          expectedFinalResult:
            ComplementaryCertificationCourseResultsForJuryCertificationWithExternal.labels[
              PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME
            ],
        },
        {
          pixPartnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
          externalPartnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
          expectedFinalResult:
            ComplementaryCertificationCourseResultsForJuryCertificationWithExternal.labels[
              PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME
            ],
        },
        {
          pixPartnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
          externalPartnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
          expectedFinalResult:
            ComplementaryCertificationCourseResultsForJuryCertificationWithExternal.labels[
              PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME
            ],
        },
        {
          pixPartnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
          externalPartnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
          expectedFinalResult:
            ComplementaryCertificationCourseResultsForJuryCertificationWithExternal.labels[
              PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME
            ],
        },
        {
          pixPartnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
          externalPartnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
          expectedFinalResult:
            ComplementaryCertificationCourseResultsForJuryCertificationWithExternal.labels[
              PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE
            ],
        },
        {
          pixPartnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
          externalPartnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
          expectedFinalResult:
            ComplementaryCertificationCourseResultsForJuryCertificationWithExternal.labels[
              PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE
            ],
        },
        {
          pixPartnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
          externalPartnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
          expectedFinalResult:
            ComplementaryCertificationCourseResultsForJuryCertificationWithExternal.labels[
              PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT
            ],
        },
      ].forEach(({ pixPartnerKey, externalPartnerKey, expectedFinalResult }) => {
        it(`should return ${expectedFinalResult} when the 'PIX' source level is ${pixPartnerKey} and the 'EXTERNAL' source level is ${externalPartnerKey}`, function () {
          // given
          const complementaryCertificationCourseResultForJuryCertificationWithExternal =
            domainBuilder.buildComplementaryCertificationCourseResultForJuryCertificationWithExternal({
              pixPartnerKey,
              pixAcquired: true,
              externalPartnerKey,
              externalAcquired: true,
            });

          // when
          const finalResult = complementaryCertificationCourseResultForJuryCertificationWithExternal.finalResult;

          // then
          expect(finalResult).to.equal(expectedFinalResult);
        });
      });

      it('should throw an Error when partner key are not from the same degrees', async function () {
        // given
        const complementaryCertificationCourseResultForJuryCertificationWithExternal =
          domainBuilder.buildComplementaryCertificationCourseResultForJuryCertificationWithExternal({
            pixPartnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
            pixAcquired: true,
            externalPartnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
            externalAcquired: true,
          });

        // when
        const myFunc = () => complementaryCertificationCourseResultForJuryCertificationWithExternal.finalResult;
        const error = await catchErr(myFunc)();

        // then
        expect(error.message).to.equal(
          `Badges edu incoherent !!! ${PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE} et ${PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT}`
        );
      });
    });
  });

  describe('#from', function () {
    it('should return a PixEduComplementaryCertificationCourseResultForJuryCertification', function () {
      // given
      const complementaryCertificationCourseResultsWithExternal = [
        domainBuilder.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId: 1234,
          partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
          acquired: true,
          source: 'PIX',
        }),
        domainBuilder.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId: 1234,
          partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
          acquired: false,
          source: 'EXTERNAL',
        }),
      ];

      // when
      const result = ComplementaryCertificationCourseResultsForJuryCertificationWithExternal.from(
        complementaryCertificationCourseResultsWithExternal
      );

      // then
      expect(result).to.deepEqualInstance(
        new ComplementaryCertificationCourseResultsForJuryCertificationWithExternal({
          pixAcquired: true,
          externalAcquired: false,
          pixPartnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
          externalPartnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
          complementaryCertificationCourseId: 1234,
        })
      );
    });
  });
});
