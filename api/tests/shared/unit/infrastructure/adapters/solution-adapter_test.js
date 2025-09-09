import { Solution } from '../../../../../src/shared/domain/models/Solution.js';
import * as solutionAdapter from '../../../../../src/shared/infrastructure/adapters/solution-adapter.js';
import { domainBuilder, expect } from '../../../../test-helper.js';

describe('Unit | Adapter | Solution', function () {
  describe('#fromDatasourceObject', function () {
    it('should create a Solution model', function () {
      // given
      const expectedSolution = new Solution({
        id: 'recwWzTquPlvIl4So',
        tEnabled: 0b101,
        scoring: '1: outilsTexte2\n2: outilsTexte4',
        type: 'QCM',
        value: '1, 5',
        qrocBlocksTypes: {},
      });
      const challengeLearningContentDataObject = domainBuilder.buildChallengeLearningContentDataObject({});

      // when
      const solution = solutionAdapter.fromDatasourceObject(challengeLearningContentDataObject);

      // then
      expect(solution).to.be.an.instanceof(Solution);
      expect(solution).to.deep.equal(expectedSolution);
    });

    it('should precise the type of each key in Solution model', function () {
      // given
      const expectedSolution = new Solution({
        id: 'recwWzTquPlvIl4So',
        tEnabled: 0b101,
        scoring: 'rep1: aaaa\nrep2: bbbb\nrep3: cccc\nrep4: dddd',
        type: 'QROCM-dep',
        value: '1, 5, 9, 7',
        qrocBlocksTypes: { rep1: 'input', rep2: 'select', rep3: 'select', rep4: 'input' },
      });
      const challengeLearningContentDataObject = domainBuilder.buildChallengeLearningContentDataObject({
        id: 'recwWzTquPlvIl4So',
        tStatus: 0b101,
        scoring: 'rep1: aaaa\nrep2: bbbb\nrep3: cccc\nrep4: dddd',
        proposals: 'Je fait ${rep1#test§test} et ${rep2 options=["a","b"]}, ${rep3§test options=["a","b"]}, ${rep4}',
        type: 'QROCM-dep',
        solution: '1, 5, 9, 7',
      });

      // when
      const solution = solutionAdapter.fromDatasourceObject(challengeLearningContentDataObject);

      // then
      expect(solution).to.be.an.instanceof(Solution);
      expect(solution).to.deep.equal(expectedSolution);
    });

    describe('tStatus bitmask conversion', function () {
      it('should handle no tolerances enabled (tStatus = 0)', function () {
        // given
        const challengeLearningContentDataObject = domainBuilder.buildChallengeLearningContentDataObject({
          tStatus: 0b000,
        });

        // when
        const solution = solutionAdapter.fromDatasourceObject(challengeLearningContentDataObject);

        // then
        expect(solution.tEnabled).to.equal(0b000);
      });

      it('should handle extended tolerances beyond t1-t3 (t4-t32)', function () {
        // given - testing t4, t8, t16 tolerances 
        const extendedTStatus = (1 << 3) | (1 << 7) | (1 << 15); // t4, t8, t16
        const challengeLearningContentDataObject = domainBuilder.buildChallengeLearningContentDataObject({
          tStatus: extendedTStatus,
        });

        // when
        const solution = solutionAdapter.fromDatasourceObject(challengeLearningContentDataObject);

        // then
        expect(solution.tEnabled).to.equal(extendedTStatus);
      });

      it('should handle maximum tolerance combination (t1-t32 all enabled)', function () {
        // given - all 32 bits set
        const maxTStatus = Math.pow(2, 32) - 1; // 0b11111111111111111111111111111111
        const challengeLearningContentDataObject = domainBuilder.buildChallengeLearningContentDataObject({
          tStatus: maxTStatus,
        });

        // when
        const solution = solutionAdapter.fromDatasourceObject(challengeLearningContentDataObject);

        // then
        expect(solution.tEnabled).to.equal(maxTStatus);
      });

      it('should handle edge case with high-bit tolerances (t29, t30, t31, t32)', function () {
        // given - testing the highest tolerance bits
        const highBitTStatus = (1 << 28) | (1 << 29) | (1 << 30) | (1 << 31); // t29, t30, t31, t32
        const challengeLearningContentDataObject = domainBuilder.buildChallengeLearningContentDataObject({
          tStatus: highBitTStatus,
        });

        // when
        const solution = solutionAdapter.fromDatasourceObject(challengeLearningContentDataObject);

        // then
        expect(solution.tEnabled).to.equal(highBitTStatus);
      });

      it('should handle mixed tolerance patterns', function () {
        // given - mix of low and high tolerance bits
        const mixedTStatus = 0b101 | (1 << 10) | (1 << 20); // t1, t3, t11, t21
        const challengeLearningContentDataObject = domainBuilder.buildChallengeLearningContentDataObject({
          tStatus: mixedTStatus,
        });

        // when
        const solution = solutionAdapter.fromDatasourceObject(challengeLearningContentDataObject);

        // then
        expect(solution.tEnabled).to.equal(mixedTStatus);
      });

      it('should preserve exact bitmask values without conversion', function () {
        // given - test various specific bitmask values
        const testCases = [
          0b1010101010101010,    // alternating pattern
          0b1111000011110000,    // block pattern  
          42,                    // arbitrary number
          255,                   // 8-bit max
          65535,                 // 16-bit max
        ];

        testCases.forEach((tStatus) => {
          const challengeLearningContentDataObject = domainBuilder.buildChallengeLearningContentDataObject({
            tStatus,
          });

          // when
          const solution = solutionAdapter.fromDatasourceObject(challengeLearningContentDataObject);

          // then
          expect(solution.tEnabled).to.equal(tStatus);
        });
      });
    });
  });
});
