import { expect } from 'chai';

import { buildV3Results } from '../../../../../../../src/certification/results/domain/models/factories/V3Results.ts';
import { Frameworks } from '../../../../../../../src/certification/shared/domain/models/Frameworks.js';

describe('Certification | Results | Unit | Domain | Models | Factories | V3Results', function () {
  describe('#buildV3Results', function () {
    const competenceMarks = [
      { level: 1, competenceId: 'competenceABC123' },
      { level: 7, competenceId: 'competenceDEF456' },
    ];
    const baseCertificationItem = {
      maxReachableLevel: 7,
      reachedMeshIndex: 4,
      pixScore: 678,
      competenceMarks,
      v3EduExternalJuryResult: null,
    };

    it('builds CORE results', function () {
      const results = buildV3Results({
        certificationItem: { ...baseCertificationItem, framework: Frameworks.CORE },
        cleaItem: null,
      });

      expect(results).to.deep.equal({
        maxReachableLevel: 7,
        reachedMeshIndex: 4,
        pixScore: 678,
        competenceMarks,
      });
    });

    it('builds CLEA results', function () {
      const results = buildV3Results({
        certificationItem: { ...baseCertificationItem, framework: Frameworks.CLEA },
        cleaItem: { certificationCourseId: 111, hasAcquiredClea: true, cleaBadgeId: 999 },
      });

      expect(results).to.deep.equal({
        maxReachableLevel: 7,
        reachedMeshIndex: 4,
        pixScore: 678,
        competenceMarks,
        hasAcquiredClea: true,
        cleaBadgeId: 999,
      });
    });

    [Frameworks.DROIT, Frameworks.PRO_SANTE].forEach((framework) => {
      it(`builds ${framework} results without pix score nor competence marks`, function () {
        const results = buildV3Results({
          certificationItem: { ...baseCertificationItem, framework },
          cleaItem: null,
        });

        expect(results).to.deep.equal({
          maxReachableLevel: 7,
          reachedMeshIndex: 4,
        });
      });
    });

    context('EDU', function () {
      [Frameworks.EDU_1ER_DEGRE, Frameworks.EDU_2ND_DEGRE, Frameworks.EDU_CPE].forEach((framework) => {
        context(framework, function () {
          it('builds results with no v3EduExternalJuryResult', function () {
            const results = buildV3Results({
              certificationItem: { ...baseCertificationItem, framework },
              cleaItem: null,
            });

            expect(results).to.deep.equal({
              maxReachableLevel: 7,
              reachedMeshIndex: 4,
              v3EduExternalJuryResult: null,
            });
          });

          it('builds results with a v3EduExternalJuryResult', function () {
            const results = buildV3Results({
              certificationItem: { ...baseCertificationItem, framework, v3EduExternalJuryResult: 'SUPER' },
              cleaItem: null,
            });

            expect(results).to.deep.equal({
              maxReachableLevel: 7,
              reachedMeshIndex: 4,
              v3EduExternalJuryResult: 'SUPER',
            });
          });
        });
      });
    });
  });
});
