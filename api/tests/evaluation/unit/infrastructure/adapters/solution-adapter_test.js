import { Solution } from '../../../../../src/evaluation/domain/models/Solution.js';
import * as solutionAdapter from '../../../../../src/evaluation/infrastructure/adapters/solution-adapter.js';
import { domainBuilder, expect } from '../../../../test-helper.js';

describe('Evaluation | Unit | Adapter | Solution', function () {
  describe('#fromDatasourceObject', function () {
    it('should create a Solution model', function () {
      // given
      const expectedSolution = new Solution({
        id: 'recwWzTquPlvIl4So',
        isT1Enabled: true,
        isT2Enabled: false,
        isT3Enabled: true,
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
        isT1Enabled: true,
        isT2Enabled: false,
        isT3Enabled: true,
        scoring: 'rep1: aaaa\nrep2: bbbb\nrep3: cccc\nrep4: dddd',
        type: 'QROCM-dep',
        value: '1, 5, 9, 7',
        qrocBlocksTypes: { rep1: 'input', rep2: 'select', rep3: 'select', rep4: 'input' },
      });
      const challengeLearningContentDataObject = domainBuilder.buildChallengeLearningContentDataObject({
        id: 'recwWzTquPlvIl4So',
        t1Status: true,
        t2Status: false,
        t3: true,
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
  });

  describe('#fromChallenge', function () {
    it('should create a Solution model', function () {
      // given
      const challenge = domainBuilder.learningContent.buildChallenge({
        id: 'recwWzTquPlvIl4So',
        t1Status: true,
        t2Status: false,
        t3Status: true,
        type: domainBuilder.learningContent.buildChallenge.TYPES.QCM,
        solution: '1, 5',
      });

      // when
      const solution = solutionAdapter.fromChallenge(challenge);

      // then
      expect(solution).to.deepEqualInstance(
        new Solution({
          id: 'recwWzTquPlvIl4So',
          isT1Enabled: true,
          isT2Enabled: false,
          isT3Enabled: true,
          type: 'QCM',
          value: '1, 5',
          qrocBlocksTypes: {},
        }),
      );
    });

    it('should precise the type of each key in Solution model', function () {
      // given
      const challenge = domainBuilder.learningContent.buildChallenge({
        id: 'recwWzTquPlvIl4So',
        t1Status: true,
        t2Status: false,
        t3Status: true,
        proposals: 'Je fait ${rep1#test§test} et ${rep2 options=["a","b"]}, ${rep3§test options=["a","b"]}, ${rep4}',
        type: domainBuilder.learningContent.buildChallenge.TYPES.QROCM_DEP,
        solution: '1, 5, 9, 7',
      });

      // when
      const solution = solutionAdapter.fromChallenge(challenge);

      // then
      expect(solution).to.deepEqualInstance(
        new Solution({
          id: 'recwWzTquPlvIl4So',
          isT1Enabled: true,
          isT2Enabled: false,
          isT3Enabled: true,
          type: 'QROCM-dep',
          value: '1, 5, 9, 7',
          qrocBlocksTypes: { rep1: 'input', rep2: 'select', rep3: 'select', rep4: 'input' },
        }),
      );
    });
  });
});
