import { expect } from 'chai';

import { buildV2Results } from '../../../../../../../src/certification/results/domain/models/factories/V2Results.ts';
import { Frameworks } from '../../../../../../../src/certification/shared/domain/models/Frameworks.js';

describe('Certification | Results | Unit | Domain | Models | Factories | V2Results', function () {
  describe('#buildV2Results', function () {
    const competenceMarks = [
      { level: 1, competenceId: 'competenceABC123' },
      { level: 7, competenceId: 'competenceDEF456' },
    ];
    const pixPlusV2VoletPixItem = {
      certificationCourseId: 111,
      v2VoletPixBadgeId: 999,
      v2VoletPixAcquired: true,
    };

    it('builds CORE results', function () {
      const results = buildV2Results({
        certificationItem: { framework: Frameworks.CORE, pixScore: 678, competenceMarks },
        cleaItem: null,
        pixPlusV2VoletPixItem: null,
        pixPlusV2VoletExterneItem: null,
      });

      expect(results).to.deep.equal({ pixScore: 678, competenceMarks });
    });

    it('builds CLEA results', function () {
      const results = buildV2Results({
        certificationItem: { framework: Frameworks.CLEA, pixScore: 678, competenceMarks },
        cleaItem: { certificationCourseId: 111, hasAcquiredClea: true, cleaBadgeId: 999 },
        pixPlusV2VoletPixItem: null,
        pixPlusV2VoletExterneItem: null,
      });

      expect(results).to.deep.equal({
        pixScore: 678,
        competenceMarks,
        hasAcquiredClea: true,
        cleaBadgeId: 999,
      });
    });

    [Frameworks.DROIT, Frameworks.PRO_SANTE].forEach((framework) => {
      it(`builds ${framework} results`, function () {
        const results = buildV2Results({
          certificationItem: { framework, pixScore: 678, competenceMarks },
          cleaItem: null,
          pixPlusV2VoletPixItem,
          pixPlusV2VoletExterneItem: null,
        });

        expect(results).to.deep.equal({
          pixScore: 678,
          competenceMarks,
          v2VoletPixBadgeId: 999,
          v2VoletPixAcquired: true,
        });
      });
    });

    context('when complementary data is missing', function () {
      it('returns null for CLEA when clea data is missing', function () {
        const results = buildV2Results({
          certificationItem: { framework: Frameworks.CLEA, pixScore: 678, competenceMarks },
          cleaItem: null,
          pixPlusV2VoletPixItem: null,
          pixPlusV2VoletExterneItem: null,
        });

        expect(results).to.be.null;
      });

      [
        Frameworks.DROIT,
        Frameworks.PRO_SANTE,
        Frameworks.EDU_1ER_DEGRE,
        Frameworks.EDU_2ND_DEGRE,
        Frameworks.EDU_CPE,
      ].forEach((framework) => {
        it(`returns null for ${framework} when volet pix data is missing`, function () {
          const results = buildV2Results({
            certificationItem: { framework, pixScore: 678, competenceMarks },
            cleaItem: null,
            pixPlusV2VoletPixItem: null,
            pixPlusV2VoletExterneItem: null,
          });

          expect(results).to.be.null;
        });
      });
    });

    context('EDU', function () {
      [Frameworks.EDU_1ER_DEGRE, Frameworks.EDU_2ND_DEGRE, Frameworks.EDU_CPE].forEach((framework) => {
        context(framework, function () {
          it('builds results with no volet externe', function () {
            const results = buildV2Results({
              certificationItem: { framework, pixScore: 678, competenceMarks },
              cleaItem: null,
              pixPlusV2VoletPixItem,
              pixPlusV2VoletExterneItem: null,
            });

            expect(results).to.deep.equal({
              pixScore: 678,
              competenceMarks,
              v2VoletPixBadgeId: 999,
              v2VoletPixAcquired: true,
              v2VoletExterneBadgeId: null,
              v2VoletExterneAcquired: null,
            });
          });

          it('builds results with volet externe', function () {
            const results = buildV2Results({
              certificationItem: { framework, pixScore: 678, competenceMarks },
              cleaItem: null,
              pixPlusV2VoletPixItem,
              pixPlusV2VoletExterneItem: {
                certificationCourseId: 111,
                v2VoletExterneBadgeId: 888,
                v2VoletExterneAcquired: false,
              },
            });

            expect(results).to.deep.equal({
              pixScore: 678,
              competenceMarks,
              v2VoletPixBadgeId: 999,
              v2VoletPixAcquired: true,
              v2VoletExterneBadgeId: 888,
              v2VoletExterneAcquired: false,
            });
          });
        });
      });
    });
  });
});
