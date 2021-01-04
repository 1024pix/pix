const { expect, domainBuilder } = require('../../../test-helper');
const solutionAdapter = require('../../../../lib/infrastructure/adapters/solution-adapter');
const Solution = require('../../../../lib/domain/models/Solution');

describe('Unit | Adapter | Solution', () => {

  describe('#fromDatasourceObject', () => {

    it('should create a Solution model', () => {
      // given
      const expectedSolution = new Solution({
        id: 'recwWzTquPlvIl4So',
        isT1Enabled: true,
        isT2Enabled: false,
        isT3Enabled: true,
        scoring: '1: outilsTexte2\n2: outilsTexte4',
        type: 'QCM',
        value: '1, 5',
      });
      const challengeLearningContentDataObject = domainBuilder.buildChallengeLearningContentDataObject({});

      // when
      const solution = solutionAdapter.fromDatasourceObject(challengeLearningContentDataObject);

      // then
      expect(solution).to.be.an.instanceof(Solution);
      expect(solution).to.deep.equal(expectedSolution);
    });
  });
});
