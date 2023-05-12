const { expect } = require('../../../test-helper');
const { range, countBy } = require('lodash');
const pseudoRandom = require('../../../../lib/infrastructure/utils/pseudo-random');

describe('Unit | Infrastructure | Utils | Random', function () {
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

        expect(computeDistance(resultDistribution[0], 50)).to.be.lessThan(0.01);
        expect(computeDistance(resultDistribution[1], 25)).to.be.lessThan(0.01);
        expect(computeDistance(resultDistribution[2], 12.5)).to.be.lessThan(0.01);
        expect(computeDistance(resultDistribution[3], 6.25)).to.be.lessThan(0.01);
        expect(computeDistance(resultDistribution[4], 6.25)).to.be.lessThan(0.01);
      });
    });
  });
});
