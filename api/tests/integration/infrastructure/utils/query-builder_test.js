const { expect, databaseBuilder } = require('../../../test-helper');
const queryBuilder = require('../../../../lib/infrastructure/utils/query-builder');

const BookshelfCompetenceEvaluation = require('../../../../lib/infrastructure/data/competence-evaluation');
const CompetenceEvaluation = require('../../../../lib/domain/models/CompetenceEvaluation');
const { NotFoundError } = require('../../../../lib/domain/errors');
const _ = require('lodash');

describe('Integration | Infrastructure | Utils | Query Builder', function() {
  let competenceEvaluations;

  beforeEach(function() {
    competenceEvaluations = _.sortBy(_.times(3, databaseBuilder.factory.buildCompetenceEvaluation), 'id');

    return databaseBuilder.commit();
  });

  describe('get', function() {
    let expectedCompetenceEvaluation;

    beforeEach(function() {
      expectedCompetenceEvaluation = competenceEvaluations[0];
    });

    it('should return the competence evaluation', async function() {
      // when
      const result = await queryBuilder.get(BookshelfCompetenceEvaluation, expectedCompetenceEvaluation.id);

      // then
      expect(result.id).to.be.equal(competenceEvaluations[0].id);
      expect(result).to.be.instanceof(CompetenceEvaluation);
    });

    it('should return the competence evaluation without calling domain converter', async function() {
      // when
      const result = await queryBuilder.get(BookshelfCompetenceEvaluation, expectedCompetenceEvaluation.id, null, false);

      // then
      expect(result).to.be.instanceof(BookshelfCompetenceEvaluation);
    });

    it('should return the competence evaluation with assessment', async function() {
      // when
      const result = await queryBuilder.get(BookshelfCompetenceEvaluation, expectedCompetenceEvaluation.id, {
        include: ['assessment'],
      });

      // then
      expect(result.id).to.be.equal(expectedCompetenceEvaluation.id);
      expect(result.assessment.id).to.equal(expectedCompetenceEvaluation.assessmentId);
    });

    it('should throw a NotFoundError if competence evaluation can not be found', function() {
      // when
      const promise = queryBuilder.get(BookshelfCompetenceEvaluation, -1);

      // then
      return expect(promise).to.have.been.rejectedWith(NotFoundError);
    });
  });
});
