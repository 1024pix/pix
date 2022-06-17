const { expect, knex, databaseBuilder } = require('../../../test-helper');
const tutorialEvaluationRepository = require('../../../../lib/infrastructure/repositories/tutorial-evaluation-repository');
const TutorialEvaluation = require('../../../../lib/domain/models/TutorialEvaluation');

describe('Integration | Infrastructure | Repository | tutorialEvaluationRepository', function () {
  let userId, tutorialId, status;

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser().id;
    tutorialId = 'tutorialId';
    status = TutorialEvaluation.status.LIKED;
    await databaseBuilder.commit();
  });

  afterEach(async function () {
    await knex('tutorial-evaluations').delete();
  });

  describe('#addEvaluation', function () {
    it('should store the tutorialId in the users list', async function () {
      // when
      await tutorialEvaluationRepository.addEvaluation({ userId, tutorialId, status });

      // then
      const tutorialEvaluations = await knex('tutorial-evaluations').where({ userId, tutorialId });
      expect(tutorialEvaluations).to.have.length(1);
    });

    it('should return the created tutorial evaluation', async function () {
      // when
      const tutorialEvaluation = await tutorialEvaluationRepository.addEvaluation({
        userId,
        tutorialId,
        status: TutorialEvaluation.status.LIKED,
      });

      // then
      const tutorialEvaluations = await knex('tutorial-evaluations').where({
        userId,
        tutorialId,
        status: TutorialEvaluation.status.LIKED,
      });
      expect(tutorialEvaluation.id).to.deep.equal(tutorialEvaluations[0].id);
      expect(tutorialEvaluation.userId).to.deep.equal(tutorialEvaluations[0].userId);
      expect(tutorialEvaluation.tutorialId).to.deep.equal(tutorialEvaluations[0].tutorialId);
      expect(tutorialEvaluation.status).to.deep.equal(tutorialEvaluations[0].status);
    });

    context('when the tutorialId already exists in the user list', function () {
      it('should not store the tutorialId', async function () {
        // given
        databaseBuilder.factory.buildTutorialEvaluation({ tutorialId, userId, status });
        await databaseBuilder.commit();

        // when
        const tutorialEvaluation = await tutorialEvaluationRepository.addEvaluation({ userId, tutorialId, status });

        // then
        const tutorialEvaluations = await knex('tutorial-evaluations').where({ userId, tutorialId });
        expect(tutorialEvaluations).to.have.length(1);
        expect(tutorialEvaluation.id).to.deep.equal(tutorialEvaluations[0].id);
        expect(tutorialEvaluation.userId).to.deep.equal(tutorialEvaluations[0].userId);
        expect(tutorialEvaluation.tutorialId).to.deep.equal(tutorialEvaluations[0].tutorialId);
      });
    });
  });

  describe('#find', function () {
    context('when user has evaluated some tutorials', function () {
      it('should return tutorial-evaluations belonging to given user', async function () {
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

    context('when user has not evaluated tutorial', function () {
      it('should empty array', async function () {
        const tutorialEvaluations = await tutorialEvaluationRepository.find({ userId });

        // then
        expect(tutorialEvaluations).to.deep.equal([]);
      });
    });
  });
});
