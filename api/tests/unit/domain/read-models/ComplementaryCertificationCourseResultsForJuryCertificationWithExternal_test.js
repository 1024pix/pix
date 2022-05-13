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

  describe('#pixResult', function () {
    context('when pix section is not evaluated', function () {
      it('should return null', function () {
        // given
        const complementaryCertificationCourseResultsForJuryCertificationWithExternal =
          new ComplementaryCertificationCourseResultsForJuryCertificationWithExternal({});

        // when
        const pixResult = complementaryCertificationCourseResultsForJuryCertificationWithExternal.pixResult;

        // then
        expect(pixResult).to.be.null;
      });
    });

    context('when pix section is evaluated', function () {
      [
        {
          partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
          acquired: true,
          expectedResult: 'Pix+ Édu Initié (entrée dans le métier)',
        },
        {
          partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
          acquired: true,
          expectedResult: 'Pix+ Édu Confirmé',
        },
        {
          partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
          acquired: true,
          expectedResult: 'Pix+ Édu Confirmé',
        },
        { partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE, acquired: true, expectedResult: 'Pix+ Édu Avancé' },
        { partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT, acquired: true, expectedResult: 'Pix+ Édu Expert' },
        {
          partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
          acquired: true,
          expectedResult: 'Pix+ Édu Initié (entrée dans le métier)',
        },
        {
          partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
          acquired: true,
          expectedResult: 'Pix+ Édu Confirmé',
        },
        {
          partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
          acquired: true,
          expectedResult: 'Pix+ Édu Confirmé',
        },
        { partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE, acquired: true, expectedResult: 'Pix+ Édu Avancé' },
        { partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT, acquired: true, expectedResult: 'Pix+ Édu Expert' },
        { partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT, acquired: false, expectedResult: 'Rejetée' },
      ].forEach(({ partnerKey, acquired, expectedResult }) => {
        it(`should return ${expectedResult} when pix section partner key is ${partnerKey} and acquired is ${acquired}`, function () {
          // given
          const complementaryCertificationCourseResultsForJuryCertificationWithExternal =
            new ComplementaryCertificationCourseResultsForJuryCertificationWithExternal({
              pixPartnerKey: partnerKey,
              pixAcquired: acquired,
            });

          // when
          const pixResult = complementaryCertificationCourseResultsForJuryCertificationWithExternal.pixResult;

          // then
          expect(pixResult).to.equal(expectedResult);
        });
      });
    });
  });

  describe('#externalResult', function () {
    context('when pix section is not acquired', function () {
      it('should return "-"', function () {
        // given
        const complementaryCertificationCourseResultsForJuryCertificationWithExternal =
          new ComplementaryCertificationCourseResultsForJuryCertificationWithExternal({
            pixPartnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
            pixAcquired: false,
          });

        // when
        const externalResult = complementaryCertificationCourseResultsForJuryCertificationWithExternal.externalResult;

        // then
        expect(externalResult).to.equal('-');
      });
    });

    context('when piw section is acquired and external section is not yet evaluated', function () {
      it('should return "En attente"', function () {
        // given
        const complementaryCertificationCourseResultsForJuryCertificationWithExternal =
          new ComplementaryCertificationCourseResultsForJuryCertificationWithExternal({
            pixPartnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
            pixAcquired: true,
          });

        // when
        const externalResult = complementaryCertificationCourseResultsForJuryCertificationWithExternal.externalResult;

        // then
        expect(externalResult).to.equal('En attente');
      });
    });

    context('when pix section is acquired and external section is evaluated', function () {
      context('when acquired is true', function () {
        [
          {
            partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
            expectedResult: 'Pix+ Édu Initié (entrée dans le métier)',
          },
          {
            partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
            expectedResult: 'Pix+ Édu Confirmé',
          },
          {
            partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
            expectedResult: 'Pix+ Édu Confirmé',
          },
          { partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE, expectedResult: 'Pix+ Édu Avancé' },
          { partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT, expectedResult: 'Pix+ Édu Expert' },
          {
            partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
            expectedResult: 'Pix+ Édu Initié (entrée dans le métier)',
          },
          {
            partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
            expectedResult: 'Pix+ Édu Confirmé',
          },
          {
            partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
            expectedResult: 'Pix+ Édu Confirmé',
          },
          { partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE, expectedResult: 'Pix+ Édu Avancé' },
          { partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT, expectedResult: 'Pix+ Édu Expert' },
        ].forEach(({ partnerKey, expectedResult }) => {
          it(`should return ${expectedResult} when external section partner key is ${partnerKey}`, function () {
            // given
            const complementaryCertificationCourseResultsForJuryCertificationWithExternal =
              new ComplementaryCertificationCourseResultsForJuryCertificationWithExternal({
                pixPartnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
                pixAcquired: true,
                externalPartnerKey: partnerKey,
                externalAcquired: true,
              });

            // when
            const externalResult =
              complementaryCertificationCourseResultsForJuryCertificationWithExternal.externalResult;

            // then
            expect(externalResult).to.equal(expectedResult);
          });
        });
      });

      context('when acquired is false', function () {
        it(`should return Rejetée`, function () {
          // given
          const complementaryCertificationCourseResultsForJuryCertificationWithExternal =
            new ComplementaryCertificationCourseResultsForJuryCertificationWithExternal({
              pixPartnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
              pixAcquired: true,
              externalPartnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
              externalAcquired: false,
            });

          // when
          const externalResult = complementaryCertificationCourseResultsForJuryCertificationWithExternal.externalResult;

          // then
          expect(externalResult).to.equal('Rejetée');
        });
      });
    });
  });
});
