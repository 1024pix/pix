const { expect, knex } = require('../../../test-helper');
const CompetenceEvaluation = require('../../../../lib/domain/models/CompetenceEvaluation');
const competenceEvaluationRepository = require('../../../../lib/infrastructure/repositories/competence-evaluation-repository');

describe('Integration | Repository | Competence Evaluation', () => {
  describe('#save', () => {

    afterEach(() => {
      return knex('competence-evaluations').delete();
    });

    it('should return the given competence evaluation', () => {
      // given
      const competenceEvaluationToSave = new CompetenceEvaluation({
        assessmentId: 12,
        competenceId: 'recABCD1234',
        userId: 1,
      });

      // when
      const promise = competenceEvaluationRepository.save(competenceEvaluationToSave);

      // then
      return promise.then((savedCompetenceEvaluation) => {
        expect(savedCompetenceEvaluation).to.be.instanceof(CompetenceEvaluation);
        expect(savedCompetenceEvaluation.id).to.exist;
        expect(savedCompetenceEvaluation.createdAt).to.exist;
        expect(savedCompetenceEvaluation.assessmentId).to.equal(competenceEvaluationToSave.assessmentId);
        expect(savedCompetenceEvaluation.competenceId).to.equal(competenceEvaluationToSave.competenceId);
        expect(savedCompetenceEvaluation.userId).to.equal(competenceEvaluationToSave.userId);
      });
    });

    it('should save the given competence evaluation', () => {
      // given
      const competenceEvaluationToSave = new CompetenceEvaluation({
        assessmentId: 12,
        competenceId: 'recABCD1234',
        userId: 1,
      });

      // when
      const promise = competenceEvaluationRepository.save(competenceEvaluationToSave);

      // then
      return promise.then((savedCompetenceEvaluation) => {
        return knex.select('id', 'assessmentId', 'competenceId', 'userId')
          .from('competence-evaluations')
          .where({ id: savedCompetenceEvaluation.id })
          .then(([competenceEvaluationInDb]) => {
            expect(competenceEvaluationInDb.id).to.equal(savedCompetenceEvaluation.id);
            expect(competenceEvaluationInDb.assessmentId).to.equal(competenceEvaluationToSave.assessmentId);
            expect(competenceEvaluationInDb.competenceId).to.equal(competenceEvaluationToSave.competenceId);
            expect(competenceEvaluationInDb.userId).to.equal(competenceEvaluationToSave.userId);
          });
      });
    });

  });
});
