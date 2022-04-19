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
  describe('#getCertifiedBadgesDTO', function () {
    context('when badge is not "PIX_EDU', function () {
      // eslint-disable-next-line mocha/no-setup-in-describe
      [
        PIX_DROIT_EXPERT_CERTIF,
        PIX_DROIT_MAITRE_CERTIF,
        PIX_EMPLOI_CLEA_V1,
        PIX_EMPLOI_CLEA_V2,
        PIX_EMPLOI_CLEA_V3,
      ].forEach((partnerKey) => {
        it(`returns a non temporary badge for ${partnerKey}`, function () {
          // given
          const complementaryCertificationCourseResults = [
            domainBuilder.buildComplementaryCertificationCourseResult({
              complementaryCertificationCourseId: 456,
              partnerKey,
            }),
          ];

          // when
          const certifiedBadgesDTO = new CertifiedBadges({
            complementaryCertificationCourseResults,
          }).getCertifiedBadgesDTO();

          // then
          expect(certifiedBadgesDTO).to.deepEqualArray([
            {
              partnerKey,
              isTemporaryBadge: false,
            },
          ]);
        });
      });
    });
    context('when badge is "PIX_EDU', function () {
      // eslint-disable-next-line mocha/no-setup-in-describe
      [
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
      ].forEach((partnerKey) => {
        context('when there is only one complementaryCertificationCourseResult', function () {
          it(`returns a temporary badge for ${partnerKey}`, function () {
            // given
            const complementaryCertificationCourseResults = [
              domainBuilder.buildComplementaryCertificationCourseResult({
                complementaryCertificationCourseId: 456,
                partnerKey,
              }),
            ];

            // when
            const certifiedBadgesDTO = new CertifiedBadges({
              complementaryCertificationCourseResults,
            }).getCertifiedBadgesDTO();

            // then
            expect(certifiedBadgesDTO).to.deepEqualArray([
              {
                partnerKey,
                isTemporaryBadge: true,
              },
            ]);
          });
        });
        context('when there is more than one complementaryCertificationCourseResult', function () {
          it(`returns a non temporary badge for ${partnerKey}`, function () {
            // given
            const complementaryCertificationCourseResults = [
              domainBuilder.buildComplementaryCertificationCourseResult({
                complementaryCertificationCourseId: 456,

                partnerKey,
                source: 'PIX',
              }),
              domainBuilder.buildComplementaryCertificationCourseResult({
                partnerKey,
                complementaryCertificationCourseId: 456,
                source: 'EXTERNAL',
              }),
            ];

            // when
            const certifiedBadgesDTO = new CertifiedBadges({
              complementaryCertificationCourseResults,
            }).getCertifiedBadgesDTO();

            // then
            expect(certifiedBadgesDTO).to.deepEqualArray([
              {
                partnerKey,
                isTemporaryBadge: false,
              },
            ]);
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
        it(`should return ${expectedLowestBadge} when the 'PIX' source level is ${sourcePix} and the 'ETERNAL' source level is ${sourceExternal}`, function () {
          // given
          const complementaryCertificationCourseResults = [
            domainBuilder.buildComplementaryCertificationCourseResult({
              partnerKey: sourcePix,
              complementaryCertificationCourseId: 456,
              source: 'PIX',
            }),
            domainBuilder.buildComplementaryCertificationCourseResult({
              partnerKey: sourceExternal,
              complementaryCertificationCourseId: 456,
              source: 'EXTERNAL',
            }),
          ];

          // when
          const certifiedBadgesDTO = new CertifiedBadges({
            complementaryCertificationCourseResults,
          }).getCertifiedBadgesDTO();

          // then
          expect(certifiedBadgesDTO).to.deepEqualArray([
            {
              partnerKey: expectedLowestBadge,
              isTemporaryBadge: false,
            },
          ]);
        });
      });
    });
  });
});
