const { expect, sinon } = require('$tests/test-helper');
const competenceEvaluationRepository = require('$lib/infrastructure/repositories/competence-evaluation-repository');
const CompetenceEvaluation = require('$lib/infrastructure/data/competence-evaluation');
const queryBuilder = require('$lib/infrastructure/utils/query-builder');

describe('Unit | Repository | CompetenceEvaluationRepository', function() {

  describe('#find', () => {
    let options;

    beforeEach(() => {
      sinon.stub(queryBuilder, 'find');

      options = {
        filter: { assessmentId: 1 },
      };
    });

    it('should find the competence-evaluations', async () => {
      // given
      queryBuilder.find.withArgs(CompetenceEvaluation, options).resolves('ok');

      // when
      const result = await competenceEvaluationRepository.find(options);

      // then
      expect(result).to.equal('ok');
    });
  });

});
