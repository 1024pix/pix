import _ from 'lodash';

import { random } from '../../../../lib/infrastructure/utils/random.js';
import { expect } from '../../../test-helper.js';

describe('Unit | Infrastructure | Utils | Random', function () {
  describe('#binaryTreeRandom', function () {
    context('randomDistributionTest', function () {
      it('should have a decent distribution', function () {
        const length = 100000;
        const values = {
          ok: 0.1,
          ko: 0.3,
          aband: 0.6,
        };

        const results = random.weightedRandoms(values, length);

        const resultDistribution = _.countBy(results);

        const computeDistance = (value, expected) => Math.abs(value / length - expected);
        expect(computeDistance(resultDistribution.ok, values.ok)).to.be.lessThan(0.01);
        expect(computeDistance(resultDistribution.ko, values.ko)).to.be.lessThan(0.01);
        expect(computeDistance(resultDistribution.aband, values.aband)).to.be.lessThan(0.01);
      });
    });
  });
});
