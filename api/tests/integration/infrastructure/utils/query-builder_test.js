const { expect, databaseBuilder } = require('../../../test-helper');
const queryBuilder = require('../../../../lib/infrastructure/utils/query-builder');

const BookshelfCompetenceEvaluation = require('../../../../lib/infrastructure/data/competence-evaluation');
const CompetenceEvaluation = require('../../../../lib/domain/models/CompetenceEvaluation');
const { NotFoundError } = require('../../../../lib/domain/errors');
const _ = require('lodash');

describe('Integration | Infrastructure | Utils | Query Builder', function() {
  let competenceEvaluations;

  beforeEach(() => {
    competenceEvaluations = _.sortBy(_.times(10, databaseBuilder.factory.buildCompetenceEvaluation), 'id');

    return databaseBuilder.commit();
  });

  describe('find', function() {
    it('should return all competence evaluations', async function() {
      // when
      const results = await queryBuilder.find(BookshelfCompetenceEvaluation, {
        filter: {},
        page: {},
        sort: [],
        include: [],
      });

      // then
      expect(results.models).to.have.lengthOf(10);
    });

    it('should return filtered competence evaluations', async function() {
      // when
      const results = await queryBuilder.find(BookshelfCompetenceEvaluation, {
        filter: {
          assessmentId: competenceEvaluations[4].assessmentId,
        },
        page: {},
        sort: [],
        include: ['assessment'],
      });

      // then
      expect(results.models[0].assessment.id).to.equal(competenceEvaluations[4].assessmentId);
    });

    it('should return all competence evaluations sorted', async function() {
      // when
      const results = await queryBuilder.find(BookshelfCompetenceEvaluation, {
        filter: {},
        page: {},
        sort: ['-createdAt'],
        include: [],
      });

      // then
      expect(results.models).to.have.lengthOf(10);
      expect(results.models).to.have.lengthOf(10).to.be.descendingBy('createdAt');
    });

    it('should return all competence evaluations with pagination', async function() {
      // when
      const result = await queryBuilder.find(BookshelfCompetenceEvaluation, {
        filter: {},
        page: {
          number: 1,
          size: 10,
        },
        sort: [],
        include: [],
      });

      // then
      expect(result.pagination).to.deep.equal({ page: 1, pageSize: 10, rowCount: 10, pageCount: 1 });
      expect(result.models).to.have.lengthOf(10);
    });

    it('should return a specific page of competence evaluations', async function() {
      // when
      const result = await queryBuilder.find(BookshelfCompetenceEvaluation, {
        filter: {},
        page: {
          number: 2,
          size: 3,
        },
        sort: ['id'],
        include: [],
      });

      // then
      expect(result.pagination).to.deep.equal({ page: 2, pageSize: 3, rowCount: 10, pageCount: 4 });
      expect(result.models).to.have.lengthOf(3);
      expect(result.models[0].id).to.equal(competenceEvaluations[3].id);
      expect(result.models[1].id).to.equal(competenceEvaluations[4].id);
      expect(result.models[2].id).to.equal(competenceEvaluations[5].id);
    });

    it('should return a specific page of competenceEvaluations with related objects', async function() {
      // when
      const result = await queryBuilder.find(BookshelfCompetenceEvaluation, {
        filter: {},
        page: {
          number: 3,
          size: 2,
        },
        sort: ['id'],
        include: ['assessment'],
      });

      // then
      expect(result.pagination).to.deep.equal({ page: 3, pageSize: 2, rowCount: 10, pageCount: 5 });
      expect(result.models).to.have.lengthOf(2);
      expect(result.models[0].assessment.id).to.equal(competenceEvaluations[4].assessmentId);
      expect(result.models[1].assessment.id).to.equal(competenceEvaluations[5].assessmentId);
    });
  });

  describe('get', function() {
    let expectedCompetenceEvaluation;

    beforeEach(() => {
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
        include: ['assessment']
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
