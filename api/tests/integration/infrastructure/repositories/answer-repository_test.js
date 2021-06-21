const { expect, knex, domainBuilder, databaseBuilder, catchErr } = require('../../../test-helper');
const Answer = require('../../../../lib/domain/models/Answer');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const { NotFoundError } = require('../../../../lib/domain/errors');
const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');

describe('Integration | Repository | answerRepository', () => {

  describe('#get', () => {

    context('when there are no answers', () => {

      it('should reject an error if nothing is found', async () => {
        // when
        const error = await catchErr(answerRepository.get)(100);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });

    context('when there is an answer', () => {

      it('should retrieve an answer from its id', async () => {
        // given
        const expectedAnswer = domainBuilder.buildAnswer({
          id: 1,
          result: AnswerStatus.OK,
          resultDetails: 'some details',
          timeout: 456,
          value: 'Fruits',
          assessmentId: 2,
          challengeId: 'recChallenge123',
          timeSpent: 20,
        });
        databaseBuilder.factory.buildAssessment({ id: 2 });
        databaseBuilder.factory.buildAnswer({
          ...expectedAnswer,
          result: 'ok',
        });
        await databaseBuilder.commit();

        // when
        const foundAnswer = await answerRepository.get(1);

        // then
        expect(foundAnswer).to.be.an.instanceof(Answer);
        expect(foundAnswer).to.deep.equal(expectedAnswer);
      });
    });
  });

  describe('#findByIds', () => {

    context('when there are no answers', () => {

      it('should return an empty list', async () => {
        // when
        const foundAnswers = await answerRepository.findByIds([100]);

        // then
        expect(foundAnswers).to.be.empty;
      });
    });

    context('when there are answers', () => {

      it('should retrieve all answers from its id', async () => {
        // given
        const firstAnswer = domainBuilder.buildAnswer({
          id: 1,
          result: AnswerStatus.OK,
          resultDetails: 'some details',
          timeout: 456,
          value: 'Fruits',
          assessmentId: 2,
          challengeId: 'recChallenge123',
          timeSpent: 20,
        });

        const secondAnswer = domainBuilder.buildAnswer({
          id: 2,
          result: AnswerStatus.KO,
          resultDetails: 'some details',
          timeout: null,
          value: 'Fruits',
          assessmentId: 2,
          challengeId: 'recChallenge456',
          timeSpent: 20,
        });
        databaseBuilder.factory.buildAssessment({ id: 2 });
        databaseBuilder.factory.buildAnswer({ ...secondAnswer, result: 'ko' });
        databaseBuilder.factory.buildAnswer({ ...firstAnswer, result: 'ok' });
        databaseBuilder.factory.buildAnswer();
        await databaseBuilder.commit();

        // when
        const foundAnswers = await answerRepository.findByIds([1, 2]);

        // then
        expect(foundAnswers[0]).to.be.an.instanceof(Answer);
        expect(foundAnswers).to.deep.equal([firstAnswer, secondAnswer]);
      });
    });
  });

  describe('#findByChallengeAndAssessment', () => {

    it('should returns null if there is no assessment matching', async () => {
      // given
      databaseBuilder.factory.buildAssessment({ id: 123 });
      databaseBuilder.factory.buildAnswer({ assessmentId: 123, challengeId: 'recChal1' });

      // when
      const foundAnswer = await answerRepository.findByChallengeAndAssessment({
        challengeId: 'recChal1',
        assessmentId: 456,
      });

      // then
      expect(foundAnswer).to.be.null;
    });

    it('should returns null if there is no challengeId matching', async () => {
      // given
      databaseBuilder.factory.buildAssessment({ id: 123 });
      databaseBuilder.factory.buildAnswer({ assessmentId: 123, challengeId: 'recChal1' });

      // when
      const foundAnswer = await answerRepository.findByChallengeAndAssessment({
        challengeId: 'recChal2',
        assessmentId: 123,
      });

      // then
      expect(foundAnswer).to.be.null;
    });

    it('should find the answer by challenge and assessment', async () => {
      // given
      const expectedAnswer = domainBuilder.buildAnswer({
        id: 1,
        result: AnswerStatus.OK,
        resultDetails: 'some details',
        timeout: 456,
        value: 'Fruits',
        assessmentId: 123,
        challengeId: 'recChallenge123',
        timeSpent: 20,
      });
      databaseBuilder.factory.buildAssessment({ id: 123 });
      databaseBuilder.factory.buildAnswer({
        ...expectedAnswer,
        result: 'ok',
      });
      await databaseBuilder.commit();

      // when
      const foundAnswer = await answerRepository.findByChallengeAndAssessment({
        challengeId: 'recChallenge123',
        assessmentId: 123,
      });

      // then
      expect(foundAnswer).to.be.an.instanceOf(Answer);
      expect(foundAnswer).to.deep.equal(expectedAnswer);
    });

    it('should return the most recent answer when several answers match with challenge and assessment', async () => {
      // given
      const olderAnswer = domainBuilder.buildAnswer({
        id: 1,
        result: AnswerStatus.OK,
        resultDetails: 'some details',
        timeout: 456,
        value: 'Fruits',
        assessmentId: 123,
        challengeId: 'recChallenge123',
        timeSpent: 20,
      });
      const newerAnswer = domainBuilder.buildAnswer({
        id: 2,
        result: AnswerStatus.KO,
        resultDetails: 'some other details',
        timeout: null,
        value: 'Légumes',
        assessmentId: 123,
        challengeId: 'recChallenge123',
        timeSpent: 25,
      });
      databaseBuilder.factory.buildAssessment({ id: 123 });
      databaseBuilder.factory.buildAnswer({
        ...olderAnswer,
        result: 'ok',
        createdAt: new Date('2020-01-01'),
      });
      databaseBuilder.factory.buildAnswer({
        ...newerAnswer,
        result: 'ko',
        createdAt: new Date('2021-01-01'),
      });
      await databaseBuilder.commit();

      // when
      const foundAnswer = await answerRepository.findByChallengeAndAssessment({
        challengeId: 'recChallenge123',
        assessmentId: 123,
      });

      // then
      expect(foundAnswer).to.be.an.instanceOf(Answer);
      expect(foundAnswer).to.deep.equal(newerAnswer);
    });
  });

  describe('#findByAssessment', () => {

    context('when assessment does not exist', () => {

      it('should return an empty array', async () => {
        // given
        databaseBuilder.factory.buildAssessment({ id: 123 });
        databaseBuilder.factory.buildAnswer({ assessmentId: 123 });
        await databaseBuilder.commit();

        // when
        const foundAnswers = await answerRepository.findByAssessment(456);

        // then
        expect(foundAnswers).to.be.empty;
      });
    });

    context('when assessment does not have any answers', () => {

      it('should return an empty array', async () => {
        // given
        databaseBuilder.factory.buildAssessment({ id: 123 });
        databaseBuilder.factory.buildAssessment({ id: 456 });
        databaseBuilder.factory.buildAnswer({ assessmentId: 456 });
        await databaseBuilder.commit();

        // when
        const foundAnswers = await answerRepository.findByAssessment(123);

        // then
        expect(foundAnswers).to.be.empty;
      });
    });

    context('when assessment has some answers', () => {

      it('should return the answers ordered by creation date', async () => {
        // given
        const firstAnswer = domainBuilder.buildAnswer({
          id: 1,
          result: AnswerStatus.OK,
          resultDetails: 'some details',
          timeout: 456,
          value: 'Fruits',
          assessmentId: 123,
          challengeId: 'recChallenge123',
          timeSpent: 20,
        });
        const secondAnswer = domainBuilder.buildAnswer({
          id: 2,
          result: AnswerStatus.KO,
          resultDetails: 'some details',
          timeout: null,
          value: 'Fruits',
          assessmentId: 123,
          challengeId: 'recChallenge456',
          timeSpent: 20,
        });
        databaseBuilder.factory.buildAssessment({ id: 123 });
        databaseBuilder.factory.buildAnswer({ ...secondAnswer, result: 'ko', createdAt: new Date('2020-01-01') });
        databaseBuilder.factory.buildAnswer({ ...firstAnswer, result: 'ok', createdAt: new Date('2019-01-01') });
        databaseBuilder.factory.buildAnswer();
        await databaseBuilder.commit();

        // when
        const foundAnswers = await answerRepository.findByAssessment(123);

        // then
        expect(foundAnswers[0]).to.be.an.instanceof(Answer);
        expect(foundAnswers).to.deep.equal([firstAnswer, secondAnswer]);
      });
    });
  });

  describe('#findLastByAssessment', () => {

    context('when assessment does not exist', () => {

      it('should return null', async () => {
        // given
        databaseBuilder.factory.buildAssessment({ id: 123 });
        databaseBuilder.factory.buildAnswer({ assessmentId: 123 });
        await databaseBuilder.commit();

        // when
        const foundAnswer = await answerRepository.findLastByAssessment(456);

        // then
        expect(foundAnswer).to.be.null;
      });
    });

    context('when assessment does not have any answers', () => {

      it('should return null', async () => {
        // given
        databaseBuilder.factory.buildAssessment({ id: 123 });
        databaseBuilder.factory.buildAssessment({ id: 456 });
        databaseBuilder.factory.buildAnswer({ assessmentId: 456 });
        await databaseBuilder.commit();

        // when
        const foundAnswer = await answerRepository.findLastByAssessment(123);

        // then
        expect(foundAnswer).to.be.null;
      });
    });

    context('when assessment has some answers', () => {

      it('should return the latest created answer', async () => {
        // given
        const olderAnswer = domainBuilder.buildAnswer({
          id: 1,
          result: AnswerStatus.OK,
          resultDetails: 'some details',
          timeout: 456,
          value: 'Fruits',
          assessmentId: 123,
          challengeId: 'recChallenge123',
          timeSpent: 20,
        });
        const newerAnswer = domainBuilder.buildAnswer({
          id: 2,
          result: AnswerStatus.KO,
          resultDetails: 'some details',
          timeout: null,
          value: 'Fruits',
          assessmentId: 123,
          challengeId: 'recChallenge456',
          timeSpent: 20,
        });
        databaseBuilder.factory.buildAssessment({ id: 123 });
        databaseBuilder.factory.buildAnswer({ ...newerAnswer, result: 'ko', createdAt: new Date('2020-01-01') });
        databaseBuilder.factory.buildAnswer({ ...olderAnswer, result: 'ok', createdAt: new Date('2019-01-01') });
        databaseBuilder.factory.buildAnswer();
        await databaseBuilder.commit();

        // when
        const foundAnswer = await answerRepository.findLastByAssessment(123);

        // then
        expect(foundAnswer).to.be.an.instanceof(Answer);
        expect(foundAnswer).to.deep.equal(newerAnswer);
      });
    });
  });

  describe('#findChallengeIdsFromAnswerIds', () => {

    context('when provided answerIds collection is empty', () => {

      it('should return an empty array', async () => {
        // when
        const challengeIds = await answerRepository.findChallengeIdsFromAnswerIds([]);

        // then
        expect(challengeIds).to.be.empty;
      });
    });

    context('when provided answerIds refer to non-existent answers', () => {

      it('should return an empty array', async () => {
        // when
        const challengeIds = await answerRepository.findChallengeIdsFromAnswerIds([1]);

        // then
        expect(challengeIds).to.be.empty;
      });
    });

    context('when provided answerIds list contains duplicate ids', () => {

      it('should return distinct challengeIds', async () => {
        // given
        databaseBuilder.factory.buildAnswer({ id: 123, challengeId: 'recABC' });
        await databaseBuilder.commit();

        // when
        const challengeIds = await answerRepository.findChallengeIdsFromAnswerIds([123, 123]);

        // then
        expect(challengeIds).to.have.length(1);
        expect(challengeIds[0]).to.equal('recABC');
      });
    });

    it('should return a list of corresponding distinct challenge ids ordered by challenge id', async () => {
      // given
      databaseBuilder.factory.buildAnswer({ id: 123, challengeId: 'recABC' });
      databaseBuilder.factory.buildAnswer({ id: 456, challengeId: 'recDEF' });
      databaseBuilder.factory.buildAnswer({ id: 789, challengeId: 'recGHI' });
      databaseBuilder.factory.buildAnswer({ id: 159, challengeId: 'recABC' });
      await databaseBuilder.commit();

      // when
      const challengeIds = await answerRepository.findChallengeIdsFromAnswerIds([456, 123, 789, 159]);

      // then
      expect(challengeIds).to.deep.equal(['recABC', 'recDEF', 'recGHI']);
    });
  });

  describe('#saveWithKnowledgeElements', () => {

    afterEach(async () => {
      await knex('knowledge-elements').delete();
      await knex('answers').delete();
    });

    it('should save and return the answer', async () => {
      // given
      const answerToSave = domainBuilder.buildAnswer({
        id: null,
        result: AnswerStatus.OK,
        resultDetails: 'some details',
        timeout: 456,
        value: 'Fruits',
        assessmentId: 123,
        challengeId: 'recChallenge123',
        timeSpent: 20,
      });
      databaseBuilder.factory.buildAssessment({ id: 123 });
      await databaseBuilder.commit();

      // when
      const savedAnswer = await answerRepository.saveWithKnowledgeElements(answerToSave, []);

      // then
      const answerInDB = await answerRepository.get(savedAnswer.id);
      expect(savedAnswer).to.be.instanceOf(Answer);
      expect(savedAnswer).to.deep.equal(answerInDB);
    });

    it('should save the knowledge elements', async () => {
      // given
      const answerToSave = domainBuilder.buildAnswer({
        id: null,
        assessmentId: 123,
      });
      const knowledgeElement1 = domainBuilder.buildKnowledgeElement({
        id: null,
        createdAt: null,
        source: KnowledgeElement.SourceType.DIRECT,
        status: KnowledgeElement.StatusType.VALIDATED,
        earnedPix: 45,
        answerId: null,
        assessmentId: 123,
        skillId: 'recSkill1',
        userId: 456,
        competenceId: 'recComp1',
      });
      const knowledgeElement2 = domainBuilder.buildKnowledgeElement({
        id: null,
        createdAt: null,
        source: KnowledgeElement.SourceType.INFERRED,
        status: KnowledgeElement.StatusType.INVALIDATED,
        earnedPix: 0,
        answerId: null,
        assessmentId: 123,
        skillId: 'recSkill2',
        userId: 456,
        competenceId: 'recComp2',
      });
      databaseBuilder.factory.buildUser({ id: 456 });
      databaseBuilder.factory.buildAssessment({ id: 123 });
      await databaseBuilder.commit();

      // when
      const savedAnswer = await answerRepository.saveWithKnowledgeElements(answerToSave, [knowledgeElement1, knowledgeElement2]);

      // then
      const knowledgeElementsDTOs = await knex
        .select('source', 'status', 'earnedPix', 'answerId', 'assessmentId', 'skillId', 'userId', 'competenceId')
        .from('knowledge-elements')
        .orderBy('skillId');
      expect(knowledgeElementsDTOs[0]).to.deep.equal({
        source: KnowledgeElement.SourceType.DIRECT,
        status: KnowledgeElement.StatusType.VALIDATED,
        earnedPix: 45,
        answerId: savedAnswer.id,
        assessmentId: 123,
        skillId: 'recSkill1',
        userId: 456,
        competenceId: 'recComp1',
      });
      expect(knowledgeElementsDTOs[1]).to.deep.equal({
        source: KnowledgeElement.SourceType.INFERRED,
        status: KnowledgeElement.StatusType.INVALIDATED,
        earnedPix: 0,
        answerId: savedAnswer.id,
        assessmentId: 123,
        skillId: 'recSkill2',
        userId: 456,
        competenceId: 'recComp2',
      });
    });

    context('when something goes wrong during the saving of the knowledge elements', () => {

      it('should not have saved anything', async () => {
        // given
        const answerToSave = domainBuilder.buildAnswer({
          id: null,
          assessmentId: 123,
        });
        const knowledgeElement = domainBuilder.buildKnowledgeElement({
          id: null,
          createdAt: null,
          assessmentId: 123,
          userId: 456, // constraint violation here
        });
        databaseBuilder.factory.buildAssessment({ id: 123 });
        await databaseBuilder.commit();

        // when
        await catchErr(answerRepository.saveWithKnowledgeElements)(answerToSave, [knowledgeElement]);

        // then
        const answerInDB = await knex('answers');
        const knowledgeElementsInDB = await knex('knowledge-elements');
        expect(answerInDB).to.have.length(0);
        expect(knowledgeElementsInDB).to.have.length(0);
      });
    });
  });
});
