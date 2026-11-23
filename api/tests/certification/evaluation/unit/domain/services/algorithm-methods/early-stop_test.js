import { expect } from 'chai';

import { normalCdf } from '../../../../../../../src/certification/evaluation/domain/services/algorithm-methods/early-stop.js';

describe('Unit | Certification | Evaluation | Domain | Service | Algorithm-methods | early-stop', function () {
  describe('#normalCdf', function () {
    [
      { z: 0, expected: 0.5 },
      { z: 1.645, expected: 0.95 },
      { z: -1.96, expected: 0.025 },
      { z: 1.96, expected: 0.975 },
      { z: -8, expected: 0 },
      { z: 8, expected: 1 },
    ].forEach(({ z, expected }) => {
      it(`should return ${expected} for z = ${z}`, function () {
        // when
        const result = normalCdf(z);

        // then
        expect(result).to.be.closeTo(expected, 1e-3);
      });
    });
  });
});
