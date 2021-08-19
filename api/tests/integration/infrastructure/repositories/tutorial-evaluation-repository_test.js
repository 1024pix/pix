const { expect, knex, databaseBuilder } = require('../../../test-helper');
const tutorialEvaluationRepository = require('../../../../lib/infrastructure/repositories/tutorial-evaluation-repository');

describe('Integration | Infrastructure | Repository | tutorialEvaluationRepository', function() {
  let userId;

  beforeEach(async function() {
    userId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();
  });

  afterEach(function() {
    knex('tutorial-evaluations').delete();
  });

  describe('#addEvaluation', function() {
    const tutorialId = 'tutorialId';

    it('should store the tutorialId in the users list', async function() {
      // when
      await tutorialEvaluationRepository.addEvaluation({ userId, tutorialId });

      // then
      const tutorialEvaluations = await knex('tutorial-evaluations').where({ userId, tutorialId });
      expect(tutorialEvaluations).to.have.length(1);
    });

    it('should return the created tutorial evaluation', async function() {
      // when
      const tutorialEvaluation = await tutorialEvaluationRepository.addEvaluation({ userId, tutorialId });

      // then
      const tutorialEvaluations = await knex('tutorial-evaluations').where({ userId, tutorialId });
      expect(tutorialEvaluation.id).to.deep.equal(tutorialEvaluations[0].id);
      expect(tutorialEvaluation.userId).to.deep.equal(tutorialEvaluations[0].userId);
      expect(tutorialEvaluation.tutorialId).to.deep.equal(tutorialEvaluations[0].tutorialId);
    });

    context('when the tutorialId already exists in the user list', function() {
      it('should not store the tutorialId', async function() {
        // given
        databaseBuilder.factory.buildTutorialEvaluation({ tutorialId, userId });
        await databaseBuilder.commit();

        // when
        const tutorialEvaluation = await tutorialEvaluationRepository.addEvaluation({ userId, tutorialId });

        // then
        const tutorialEvaluations = await knex('tutorial-evaluations').where({ userId, tutorialId });
        expect(tutorialEvaluations).to.have.length(1);
        expect(tutorialEvaluation.id).to.deep.equal(tutorialEvaluations[0].id);
        expect(tutorialEvaluation.userId).to.deep.equal(tutorialEvaluations[0].userId);
        expect(tutorialEvaluation.tutorialId).to.deep.equal(tutorialEvaluations[0].tutorialId);
      });
    });

  });

  describe('#find', function() {

    context('when user has evaluated some tutorials', function() {
      it('should return tutorial-evaluations belonging to given user', async function() {
        // given
        const tutorialId = 'recTutorial';
        databaseBuilder.factory.buildTutorialEvaluation({ tutorialId, userId });
        await databaseBuilder.commit();

        // when
        const tutorialEvaluations = await tutorialEvaluationRepository.find({ userId });

        // then
        expect(tutorialEvaluations).to.have.length(1);
        expect(tutorialEvaluations[0]).to.have.property('tutorialId', tutorialId);
        expect(tutorialEvaluations[0]).to.have.property('userId', userId);
      });
    });

    context('when user has not evaluated tutorial', function() {
      it('should empty array', async function() {
        const tutorialEvaluations = await tutorialEvaluationRepository.find({ userId });

        // then
        expect(tutorialEvaluations).to.deep.equal([]);
      });
    });

  });

});
