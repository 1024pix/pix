import lodash from 'lodash';

import { expect } from '../../../test-helper.js';

const { range, countBy } = lodash;

import * as pseudoRandom from '../../../../lib/infrastructure/utils/pseudo-random.js';

describe('Unit | Infrastructure | Utils | PseudoRandom', function () {
  describe('#binaryTreeRandom', function () {
    context('randomDistributionTest', function () {
      it('should have a decent distribution', function () {
        const sampleSize = 100000;
        const treeSize = 5;
        const seeds = range(0, sampleSize);

        const results = seeds.map((seed) => {
          const randomContext = pseudoRandom.create(seed);
          return randomContext.binaryTreeRandom(50, treeSize);
        });

        const resultDistribution = countBy(results);

        const computeDistance = (value, expected) => Math.abs(value / sampleSize - expected / 100);

        const RESULTS_AVERAGE_DISTRIBUTION = [50, 25, 12.5, 6.25, 6.25];

        expect(computeDistance(resultDistribution[0], RESULTS_AVERAGE_DISTRIBUTION[0])).to.be.lessThan(0.01);
        expect(computeDistance(resultDistribution[1], RESULTS_AVERAGE_DISTRIBUTION[1])).to.be.lessThan(0.01);
        expect(computeDistance(resultDistribution[2], RESULTS_AVERAGE_DISTRIBUTION[2])).to.be.lessThan(0.01);
        expect(computeDistance(resultDistribution[3], RESULTS_AVERAGE_DISTRIBUTION[3])).to.be.lessThan(0.01);
        expect(computeDistance(resultDistribution[4], RESULTS_AVERAGE_DISTRIBUTION[4])).to.be.lessThan(0.01);
      });
    });
  });
});
