const { expect, knex, domainBuilder, databaseBuilder, sinon, catchErr, compareDatabaseObject } = require('../../../test-helper');
const Answer = require('../../../../lib/domain/models/Answer');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const answerStatusDatabaseAdapter = require('../../../../lib/infrastructure/adapters/answer-status-database-adapter');
const BookshelfKnowledgeElement = require('../../../../lib/infrastructure/orm-models/KnowledgeElement');

const { NotFoundError } = require('../../../../lib/domain/errors');
const _ = require('lodash');

const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');

describe('Integration | Repository | answerRepository', () => {
  let assessmentId, otherAssessmentId, userId;
  const challengeId = 'challenge_1234';
  const otherChallengeId = 'challenge_4567';

  beforeEach(() => {
    assessmentId = databaseBuilder.factory.buildAssessment().id;
    userId = databaseBuilder.factory.buildUser().id;
    otherAssessmentId = databaseBuilder.factory.buildAssessment().id;
    return databaseBuilder.commit();
  });

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
    let expectedAnswer;

    beforeEach(() => {
      expectedAnswer = domainBuilder.buildAnswer({ id: 1, value: 'answer value', challengeId, assessmentId, result: AnswerStatus.OK });
      _.each([
        expectedAnswer,
        domainBuilder.buildAnswer({ id: 2, challengeId: otherChallengeId, assessmentId }),
        domainBuilder.buildAnswer({ id: 3, challengeId, assessmentId: otherAssessmentId }),
      ], (answer) => (databaseBuilder.factory.buildAnswer({ ...answer, result: 'ok' })));
      return databaseBuilder.commit();
    });

    it('should find the answer by challenge and assessment and return its in an object', async () => {
      // when
      const foundAnswer = await answerRepository.findByChallengeAndAssessment({
        challengeId,
        assessmentId,
      });

      // then
      expect(foundAnswer).to.be.an.instanceOf(Answer);
      expect(foundAnswer).to.deep.equal(expectedAnswer);
    });

    it('should returns null if there is no assessment matching', async () => {
      const foundAnswer = await answerRepository.findByChallengeAndAssessment({
        challengeId,
        assessmentId: 4,
      });

      // then
      expect(foundAnswer).to.be.null;
    });

    it('should returns null if there is no challengeId matching', async () => {
      const foundAnswer = await answerRepository.findByChallengeAndAssessment({
        challengeId: 'myNonExistentChallengeid',
        assessmentId,
      });

      // then
      expect(foundAnswer).to.be.null;
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

  describe('#findCorrectAnswersByAssessmentId', () => {

    beforeEach(() => {
      _.each([
        { result: 'ok', challengeId, assessmentId },
        { result: 'ok', challengeId, assessmentId: otherAssessmentId },
        { result: 'ko', challengeId: otherChallengeId, assessmentId },
      ], (answer) => (databaseBuilder.factory.buildAnswer(answer)));
      return databaseBuilder.commit();
    });

    it('should retrieve answers with ok status from assessment id provided', async () => {
      // given
      const expectedStatus = {
        status: 'ok',
      };

      // when
      const answers = await answerRepository.findCorrectAnswersByAssessmentId(assessmentId);

      // then
      expect(answers).to.exist;
      expect(answers).to.have.length.of(1);

      const foundAnswer = answers[0];

      expect(foundAnswer.assessmentId).to.be.equal(assessmentId);
      expect(foundAnswer.result).to.deep.equal(expectedStatus);
    });
  });

  describe('#saveWithKnowledgeElements', () => {

    let answer, firstKnowledgeElement, secondeKnowledgeElements;
    let savedAnswer;

    beforeEach(() => {
      answer = domainBuilder.buildAnswer({ assessmentId });
      answer.id = undefined;
      firstKnowledgeElement = domainBuilder.buildKnowledgeElement({ answerId: answer.id, assessmentId, userId });
      secondeKnowledgeElements = domainBuilder.buildKnowledgeElement({ answerId: answer.id, assessmentId, userId });
    });

    afterEach(async () => {
      await knex('knowledge-elements').delete();
      await knex('answers').delete();
    });

    context('when the database works correctly', () => {

      beforeEach(async () => {
        // when
        savedAnswer = await answerRepository.saveWithKnowledgeElements(answer, [firstKnowledgeElement, secondeKnowledgeElements]);
      });

      it('should save the answer in db', async () => {
        // then
        const expectedRawAnswerWithoutIdNorDates = {
          value: answer.value,
          result: answerStatusDatabaseAdapter.toSQLString(answer.result),
          assessmentId: answer.assessmentId,
          challengeId: answer.challengeId,
          timeout: answer.timeout,
          resultDetails: `${answer.resultDetails}\n`,
          timeSpent: answer.timeSpent,
        };
        const answerInDB = await knex('answers').first();
        return compareDatabaseObject(answerInDB, expectedRawAnswerWithoutIdNorDates);
      });

      it('should save knowledge elements', async () => {
        const knowledgeElementsInDB = await knex('knowledge-elements').where({ answerId: savedAnswer.id }).orderBy('id');

        expect(knowledgeElementsInDB).to.length(2);
        compareDatabaseObject(knowledgeElementsInDB[0], firstKnowledgeElement);
        compareDatabaseObject(knowledgeElementsInDB[1], secondeKnowledgeElements);

      });

      it('should return the answer', () => {
        expect(savedAnswer.id).to.not.equal(undefined);
        expect(savedAnswer).to.be.an.instanceOf(Answer);

        expect(_.omit(savedAnswer, ['id', 'resultDetails'])).to.deep.equal(_.omit(answer, ['id', 'resultDetails']));
      });
    });
    context('when the database do not works correctly', () => {
      it('should not save the answer nor knowledge-elements', async () => {
        // given
        sinon.stub(BookshelfKnowledgeElement.prototype, 'save').rejects();

        //when
        savedAnswer = await catchErr(answerRepository.saveWithKnowledgeElements)(answer, [firstKnowledgeElement, secondeKnowledgeElements]);

        // then
        const answerInDB = await knex('answers');
        const knowledgeElementsInDB = await knex('knowledge-elements');
        expect(answerInDB).to.have.length(0);
        expect(knowledgeElementsInDB).to.have.length(0);
      });

    });
  });

});
