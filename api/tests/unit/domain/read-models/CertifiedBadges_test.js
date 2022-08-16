const ComplementaryCertificationCourseResult = require('../../../../lib/domain/models/ComplementaryCertificationCourseResult');
const CertifiedBadges = require('../../../../lib/domain/read-models/CertifiedBadges');
const { expect, domainBuilder } = require('../../../test-helper');

const {
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EMPLOI_CLEA_V1,
  PIX_EMPLOI_CLEA_V2,
  PIX_EMPLOI_CLEA_V3,
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

describe('Unit | Domain | Read-models | CertifiedBadges', function () {
  describe('#getAcquiredCertifiedBadgesDTO', function () {
    context('when badge is not "PIX_EDU', function () {
      context('when badge is not acquired', function () {
        it('should return an empty array', function () {
          // given
          const complementaryCertificationCourseResults = [
            domainBuilder.buildComplementaryCertificationCourseResult({
              acquired: false,
              partnerKey: PIX_DROIT_EXPERT_CERTIF,
            }),
          ];
          // when
          const acquiredCertifiedBadgesDTO = new CertifiedBadges({
            complementaryCertificationCourseResults,
          }).getAcquiredCertifiedBadgesDTO();

          // then
          expect(acquiredCertifiedBadgesDTO).to.be.empty;
        });
      });

      context('when badge is acquired', function () {
        // eslint-disable-next-line mocha/no-setup-in-describe
        [
          { partnerKey: PIX_DROIT_EXPERT_CERTIF, label: 'Pix+ Droit Expert' },
          { partnerKey: PIX_DROIT_MAITRE_CERTIF, label: 'Pix+ Droit Maître' },
          { partnerKey: PIX_EMPLOI_CLEA_V1, label: 'CléA Numérique' },
          { partnerKey: PIX_EMPLOI_CLEA_V2, label: 'CléA Numérique' },
          { partnerKey: PIX_EMPLOI_CLEA_V3, label: 'CléA Numérique' },
        ].forEach(({ partnerKey, label }) => {
          it(`returns a non temporary acquired badge for ${partnerKey} with label ${label}`, function () {
            // given
            const complementaryCertificationCourseResults = [
              domainBuilder.buildComplementaryCertificationCourseResult({
                complementaryCertificationCourseId: 456,
                partnerKey,
                acquired: true,
                label,
              }),
            ];

            // when
            const certifiedBadgesDTO = new CertifiedBadges({
              complementaryCertificationCourseResults,
            }).getAcquiredCertifiedBadgesDTO();

            // then
            expect(certifiedBadgesDTO).to.deepEqualArray([
              {
                partnerKey,
                isTemporaryBadge: false,
                label,
              },
            ]);
          });
        });
      });
    });
    context('when badge is "PIX_EDU', function () {
      // eslint-disable-next-line mocha/no-setup-in-describe
      [
        {
          partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
          label: 'Pix+ Édu 2nd degré Initié (entrée dans le métier)',
        },
        { partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME, label: 'Pix+ Édu 2nd degré Confirmé' },
        { partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME, label: 'Pix+ Édu 2nd degré Confirmé' },
        { partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE, label: 'Pix+ Édu 2nd degré Avancé' },
        { partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT, label: 'Pix+ Édu 2nd degré Expert' },
        {
          partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
          label: 'Pix+ Édu 1er degré Initié (entrée dans le métier)',
        },
        { partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME, label: 'Pix+ Édu 1er degré Confirmé' },
        { partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME, label: 'Pix+ Édu 1er degré Confirmé' },
        { partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE, label: 'Pix+ Édu 1er degré Avancé' },
        { partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT, label: 'Pix+ Édu 1er degré Expert' },
      ].forEach(({ partnerKey, label }) => {
        context('when there is only one complementaryCertificationCourseResult', function () {
          it(`returns a temporary badge for acquired ${partnerKey} with label ${label}`, function () {
            // given
            const complementaryCertificationCourseResults = [
              domainBuilder.buildComplementaryCertificationCourseResult({
                complementaryCertificationCourseId: 456,
                partnerKey,
                acquired: true,
                label,
              }),
            ];

            // when
            const certifiedBadgesDTO = new CertifiedBadges({
              complementaryCertificationCourseResults,
            }).getAcquiredCertifiedBadgesDTO();

            // then
            expect(certifiedBadgesDTO).to.deepEqualArray([
              {
                partnerKey,
                isTemporaryBadge: true,
                label,
              },
            ]);
          });

          it(`returns an empty array for non acquired ${partnerKey}`, function () {
            // given
            const complementaryCertificationCourseResults = [
              domainBuilder.buildComplementaryCertificationCourseResult({
                complementaryCertificationCourseId: 456,
                partnerKey,
                acquired: false,
              }),
            ];

            // when
            const certifiedBadgesDTO = new CertifiedBadges({
              complementaryCertificationCourseResults,
            }).getAcquiredCertifiedBadgesDTO();

            // then
            expect(certifiedBadgesDTO).to.deepEqualArray([]);
          });
        });

        context('when there is more than one complementaryCertificationCourseResult', function () {
          describe('when there is an "EXTERNAL" and acquired badge', function () {
            it(`returns a non temporary badge for ${partnerKey} with label ${label}`, function () {
              // given
              const complementaryCertificationCourseResults = [
                domainBuilder.buildComplementaryCertificationCourseResult({
                  complementaryCertificationCourseId: 456,
                  partnerKey,
                  source: ComplementaryCertificationCourseResult.sources.PIX,
                  label,
                }),
                domainBuilder.buildComplementaryCertificationCourseResult({
                  partnerKey,
                  complementaryCertificationCourseId: 456,
                  source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
                  acquired: true,
                  label,
                }),
              ];

              // when
              const certifiedBadgesDTO = new CertifiedBadges({
                complementaryCertificationCourseResults,
              }).getAcquiredCertifiedBadgesDTO();

              // then
              expect(certifiedBadgesDTO).to.deepEqualArray([
                {
                  partnerKey,
                  isTemporaryBadge: false,
                  label,
                },
              ]);
            });
          });

          describe('when there is an "EXTERNAL" and not acquired badge', function () {
            it(`returns an empty array`, function () {
              // given
              const complementaryCertificationCourseResults = [
                domainBuilder.buildComplementaryCertificationCourseResult({
                  complementaryCertificationCourseId: 456,
                  partnerKey,
                  source: ComplementaryCertificationCourseResult.sources.PIX,
                }),
                domainBuilder.buildComplementaryCertificationCourseResult({
                  partnerKey,
                  complementaryCertificationCourseId: 456,
                  source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
                  acquired: false,
                }),
              ];

              // when
              const certifiedBadgesDTO = new CertifiedBadges({
                complementaryCertificationCourseResults,
              }).getAcquiredCertifiedBadgesDTO();

              // then
              expect(certifiedBadgesDTO).to.deepEqualArray([]);
            });
          });
        });
      });

      // eslint-disable-next-line mocha/no-setup-in-describe
      [
        {
          sourcePix: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
          sourceExternal: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
          expectedLowestBadge: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
        },
        {
          sourcePix: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
          sourceExternal: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
          expectedLowestBadge: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
        },
        {
          sourcePix: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
          sourceExternal: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
          expectedLowestBadge: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
        },
        {
          sourcePix: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
          sourceExternal: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
          expectedLowestBadge: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
        },
        {
          sourcePix: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
          sourceExternal: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
          expectedLowestBadge: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
        },
        {
          sourcePix: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
          sourceExternal: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
          expectedLowestBadge: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
        },
        {
          sourcePix: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
          sourceExternal: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
          expectedLowestBadge: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
        },
        {
          sourcePix: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
          sourceExternal: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
          expectedLowestBadge: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
        },
        {
          sourcePix: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
          sourceExternal: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
          expectedLowestBadge: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
        },
        {
          sourcePix: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
          sourceExternal: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
          expectedLowestBadge: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
        },
        {
          sourcePix: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
          sourceExternal: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
          expectedLowestBadge: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
        },
        {
          sourcePix: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
          sourceExternal: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
          expectedLowestBadge: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
        },
        {
          sourcePix: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
          sourceExternal: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
          expectedLowestBadge: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
        },
        {
          sourcePix: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
          sourceExternal: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
          expectedLowestBadge: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
        },
        {
          sourcePix: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
          sourceExternal: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
          expectedLowestBadge: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
        },
        {
          sourcePix: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
          sourceExternal: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
          expectedLowestBadge: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
        },
        {
          sourcePix: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
          sourceExternal: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
          expectedLowestBadge: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
        },
        {
          sourcePix: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
          sourceExternal: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
          expectedLowestBadge: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
        },
      ].forEach(({ sourcePix, sourceExternal, expectedLowestBadge }) => {
        it(`should return ${expectedLowestBadge} when the 'PIX' source level is ${sourcePix} and the 'EXTERNAL' source level is ${sourceExternal}`, function () {
          // given
          const complementaryCertificationCourseResults = [
            domainBuilder.buildComplementaryCertificationCourseResult({
              partnerKey: sourcePix,
              complementaryCertificationCourseId: 456,
              source: ComplementaryCertificationCourseResult.sources.PIX,
            }),
            domainBuilder.buildComplementaryCertificationCourseResult({
              partnerKey: sourceExternal,
              complementaryCertificationCourseId: 456,
              source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
              acquired: true,
            }),
          ];

          // when
          const certifiedBadgesDTO = new CertifiedBadges({
            complementaryCertificationCourseResults,
          }).getAcquiredCertifiedBadgesDTO();

          // then
          expect(certifiedBadgesDTO).to.deepEqualArray([
            {
              partnerKey: expectedLowestBadge,
              isTemporaryBadge: false,
              label: undefined,
            },
          ]);
        });
      });
    });
  });
});
