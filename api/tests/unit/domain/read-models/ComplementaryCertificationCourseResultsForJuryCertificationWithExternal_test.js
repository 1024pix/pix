// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable mocha/no-setup-in-describe */
const ComplementaryCertificationCourseResultsForJuryCertificationWithExternal = require('../../../../lib/domain/read-models/ComplementaryCertificationCourseResultsForJuryCertificationWithExternal');
const { expect, domainBuilder } = require('../../../test-helper');
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

      it(`should return the section with the lowest level`, function () {
        // given
        const complementaryCertificationCourseResultForJuryCertificationWithExternal =
          domainBuilder.buildComplementaryCertificationCourseResultForJuryCertificationWithExternal({
            pixPartnerKey: 'BADGE_KEY_1',
            pixLabel: 'Badge Key 1',
            pixAcquired: true,
            pixLevel: 4,
            externalPartnerKey: 'BADGE_KEY_2',
            externalLabel: 'Badge Key 2',
            externalAcquired: true,
            externalLevel: 2,
          });

        // when
        const finalResult = complementaryCertificationCourseResultForJuryCertificationWithExternal.finalResult;

        // then
        expect(finalResult).to.equal('Badge Key 2');
      });
    });
  });

  describe('#from', function () {
    it('should return a PixEduComplementaryCertificationCourseResultForJuryCertification', function () {
      // given
      const complementaryCertificationCourseResultsWithExternal = [
        domainBuilder.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId: 1234,
          partnerKey: 'KEY_1',
          acquired: true,
          source: 'PIX',
        }),
        domainBuilder.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId: 1234,
          partnerKey: 'KEY_2',
          acquired: false,
          source: 'EXTERNAL',
        }),
      ];
      const badgeKeyAndLabelsGroupedByTargetProfile = [
        [
          { key: 'KEY_3', label: 'Key 3' },
          { key: 'KEY_4', label: 'Key 4' },
        ],
        [
          { key: 'KEY_1', label: 'Key 1' },
          { key: 'KEY_2', label: 'Key 2' },
        ],
      ];

      // when
      const result = ComplementaryCertificationCourseResultsForJuryCertificationWithExternal.from(
        complementaryCertificationCourseResultsWithExternal,
        badgeKeyAndLabelsGroupedByTargetProfile
      );

      // then
      expect(result).to.deepEqualInstance(
        new ComplementaryCertificationCourseResultsForJuryCertificationWithExternal({
          pixAcquired: true,
          externalAcquired: false,
          pixPartnerKey: 'KEY_1',
          externalPartnerKey: 'KEY_2',
          complementaryCertificationCourseId: 1234,
          allowedExternalLevels: [
            { value: 'KEY_1', label: 'Key 1' },
            { value: 'KEY_2', label: 'Key 2' },
          ],
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
          label: 'Pix+ Édu 2nd degré Initié (entrée dans le métier)',
        },
        {
          partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
          acquired: true,
          label: 'Pix+ Édu 2nd degré Confirmé',
        },
        {
          partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
          acquired: true,
          label: 'Pix+ Édu 2nd degré Confirmé',
        },
        {
          partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
          acquired: true,
          label: 'Pix+ Édu 2nd degré Avancé',
        },
        {
          partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
          acquired: true,
          label: 'Pix+ Édu 2nd degré Expert',
        },
        {
          partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
          acquired: true,
          label: 'Pix+ Édu 1er degré Initié (entrée dans le métier)',
        },
        {
          partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
          acquired: true,
          label: 'Pix+ Édu 1er degré Confirmé',
        },
        {
          partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
          acquired: true,
          label: 'Pix+ Édu 1er degré Confirmé',
        },
        {
          partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
          acquired: true,
          label: 'Pix+ Édu 1er degré Avancé',
        },
        {
          partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
          acquired: true,
          label: 'Pix+ Édu 1er degré Expert',
        },
        { partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT, acquired: false, label: 'Rejetée' },
      ].forEach(({ partnerKey, acquired, label }) => {
        it(`should return ${label} when pix section partner key is ${partnerKey} and acquired is ${acquired}`, function () {
          // given
          const complementaryCertificationCourseResultsForJuryCertificationWithExternal =
            new ComplementaryCertificationCourseResultsForJuryCertificationWithExternal({
              pixPartnerKey: partnerKey,
              pixLabel: label,
              pixAcquired: acquired,
            });

          // when
          const pixResult = complementaryCertificationCourseResultsForJuryCertificationWithExternal.pixResult;

          // then
          expect(pixResult).to.equal(label);
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

    context('when pix section is acquired and external section is not yet evaluated', function () {
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
            label: 'Pix+ Édu 2nd degré Initié (entrée dans le métier)',
          },
          {
            partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
            label: 'Pix+ Édu 2nd degré Confirmé',
          },
          {
            partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
            label: 'Pix+ Édu 2nd degré Confirmé',
          },
          { partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE, label: 'Pix+ Édu 2nd degré Avancé' },
          { partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT, label: 'Pix+ Édu 2nd degré Expert' },
          {
            partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
            label: 'Pix+ Édu 1er degré Initié (entrée dans le métier)',
          },
          {
            partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
            label: 'Pix+ Édu 1er degré Confirmé',
          },
          {
            partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
            label: 'Pix+ Édu 1er degré Confirmé',
          },
          { partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE, label: 'Pix+ Édu 1er degré Avancé' },
          { partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT, label: 'Pix+ Édu 1er degré Expert' },
        ].forEach(({ partnerKey, label }) => {
          it(`should return ${label} when external section partner key is ${partnerKey}`, function () {
            // given
            const complementaryCertificationCourseResultsForJuryCertificationWithExternal =
              new ComplementaryCertificationCourseResultsForJuryCertificationWithExternal({
                pixPartnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
                pixAcquired: true,
                externalPartnerKey: partnerKey,
                externalLabel: label,
                externalAcquired: true,
              });

            // when
            const externalResult =
              complementaryCertificationCourseResultsForJuryCertificationWithExternal.externalResult;

            // then
            expect(externalResult).to.equal(label);
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
