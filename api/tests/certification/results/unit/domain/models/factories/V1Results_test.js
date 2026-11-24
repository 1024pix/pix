import { expect } from 'chai';

import { buildV1Results } from '../../../../../../../src/certification/results/domain/models/factories/V1Results.ts';
import { Frameworks } from '../../../../../../../src/certification/shared/domain/models/Frameworks.js';

describe('Certification | Results | Unit | Domain | Models | Factories | V1Results', function () {
  describe('#buildV1Results', function () {
    it('builds CORE results', function () {
      const competenceMarks = [
        { level: 1, competenceId: 'competenceABC123' },
        { level: 7, competenceId: 'competenceDEF456' },
      ];

      const results = buildV1Results({
        certificationItem: { framework: Frameworks.CORE, pixScore: 678, competenceMarks },
      });

      expect(results).to.deep.equal({ pixScore: 678, competenceMarks });
    });
  });
});
