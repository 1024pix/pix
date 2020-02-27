const { expect, knex, domainBuilder, databaseBuilder, sinon, catchErr, compareDatabaseObject } = require('../../../test-helper');
const Answer = require('../../../../lib/domain/models/Answer');
const answerStatusDatabaseAdapter = require('../../../../lib/infrastructure/adapters/answer-status-database-adapter');
const BookshelfKnowledgeElement = require('../../../../lib/infrastructure/data/knowledge-element');

const { NotFoundError } = require('../../../../lib/domain/errors');
const _ = require('lodash');
const moment = require('moment');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');

const AnswerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');

describe('Integration | Repository | AnswerRepository', () => {
  let assessmentId, otherAssessmentId, userId;
  const challengeId = 'challenge_1234';
  const otherChallengeId = 'challenge_4567';
  const anotherChallengeId = 'challenge_89';

  beforeEach(() => {
    assessmentId = databaseBuilder.factory.buildAssessment().id;
    userId = databaseBuilder.factory.buildUser().id;
    otherAssessmentId = databaseBuilder.factory.buildAssessment().id;
    return databaseBuilder.commit();
  });

  afterEach(() => {
    return cache.flushAll();
  });

  describe('#get', () => {

    context('when there are no answers', () => {

      it('should reject an error if nothing is found', () => {
        // when
        const promise = AnswerRepository.get(100);

        // then
        return expect(promise).to.be.rejectedWith(NotFoundError);
      });
    });

    context('when there is an answer', () => {
      let answerId;

      beforeEach(() => {
        answerId = databaseBuilder.factory.buildAnswer({ assessmentId: assessmentId }).id;
        return databaseBuilder.commit();
      });

      it('should retrieve an answer from its id', () => {
        // when
        const promise = AnswerRepository.get(answerId);

        // then
        return promise.then((foundAnswer) => {
          expect(foundAnswer).to.be.an.instanceof(Answer);
          expect(foundAnswer.id).to.equal(answerId);
        });
      });
    });
  });

  describe('#findByChallengeAndAssessment', () => {

    beforeEach(() => {
      _.each([
        { value: 'answer value', challengeId, assessmentId, }, // nominal case
        { challengeId: otherChallengeId, assessmentId, }, // same assessmentId, different challengeId
        { challengeId, assessmentId: otherAssessmentId, }, // different assessmentId, same challengeId
      ], (answer) => (databaseBuilder.factory.buildAnswer(answer)));
      return databaseBuilder.commit();
    });

    it('should find the answer by challenge and assessment and return its in an object', () => {
      // when
      const promise = AnswerRepository.findByChallengeAndAssessment({
        challengeId,
        assessmentId
      });

      // then
      return promise.then((foundAnswers) => {
        expect(foundAnswers).to.exist;
        expect(foundAnswers).to.be.an.instanceOf(Answer);
        expect(foundAnswers.value).to.equal('answer value');
      });
    });
  });

  describe('#findChallengeIdsFromAnswerIds', () => {
    it('should return a list of corresponding challenge ids', async () => {
      // given
      const answerIds = [1, 2, 3, 4];
      _.each(answerIds, (id) => (databaseBuilder.factory.buildAnswer({ id, challengeId: 'rec' + id })));
      await databaseBuilder.commit();

      const expectedChallengeIds = ['rec1', 'rec2', 'rec3', 'rec4'];

      // when
      const challengeIds = await AnswerRepository.findChallengeIdsFromAnswerIds(answerIds);

      // then
      expect(challengeIds).to.deep.equal(expectedChallengeIds);
    });

    it('should return an empty list when given an empty list', async () => {
      // given
      const answerIds = [];

      // when
      const challengeIds = await AnswerRepository.findChallengeIdsFromAnswerIds(answerIds);

      // then
      expect(challengeIds).to.deep.equal([]);
    });

    it('should ignore a non existing answer', async () => {
      // given
      const answerIds = [1, 2, 3, 4];
      _.each(answerIds, (id) => (databaseBuilder.factory.buildAnswer({ id, challengeId: 'rec' + id })));
      await databaseBuilder.commit();

      const nonExistingAnswerId = 1234;

      const expectedChallengeIds = ['rec1', 'rec2', 'rec3', 'rec4'];

      // when
      const challengeIds = await AnswerRepository.findChallengeIdsFromAnswerIds(
        answerIds.concat([nonExistingAnswerId])
      );

      // then
      expect(challengeIds).to.deep.equal(expectedChallengeIds);
    });

    it('should return one challenge which valid 2 distinct skills', async () => {
      // given
      const answerIds = [1, 1];

      databaseBuilder.factory.buildAnswer({ id: 1, challengeId: 'rec10' });
      await databaseBuilder.commit();

      const expectedChallengeIds = ['rec10'];

      // when
      const challengeIds = await AnswerRepository.findChallengeIdsFromAnswerIds(answerIds);

      // then
      expect(challengeIds).to.deep.equal(expectedChallengeIds);
    });

    it('should return only once a challengeId answered twice', async () => {
      // given
      const answerIds = [1, 2];
      _.each(answerIds, (id) => (databaseBuilder.factory.buildAnswer({ id, challengeId: 'recChallenge10' })));
      await databaseBuilder.commit();

      const expectedChallengeIds = ['recChallenge10'];

      // when
      const challengeIds = await AnswerRepository.findChallengeIdsFromAnswerIds(answerIds);

      // then
      expect(challengeIds).to.deep.equal(expectedChallengeIds);
    });
  });

  describe('#findByAssessment', () => {

    beforeEach(() => {
      _.each([
        { challengeId, assessmentId, },
        { challengeId, assessmentId: otherAssessmentId, },
        { challengeId: otherChallengeId, assessmentId, },
      ], (answer) => (databaseBuilder.factory.buildAnswer(answer)));
      return databaseBuilder.commit();
    });

    it('should resolves answers with assessment id provided', () => {
      // when
      const promise = AnswerRepository.findByAssessment(assessmentId);

      // then
      return promise.then((answers) => {
        expect(answers.length).to.be.equal(2);
        expect(answers[0].assessmentId).to.be.equal(assessmentId);
        expect(answers[1].assessmentId).to.be.equal(assessmentId);
      });
    });

    it('should return answers as domain objects', () => {
      // when
      const promise = AnswerRepository.findByAssessment(assessmentId);

      // then
      return promise.then((answers) => {
        expect(answers[0]).to.be.instanceof(Answer);
        expect(answers[1]).to.be.instanceof(Answer);
      });
    });
  });

  describe('#findLastByAssessment', () => {
    const expectedAnswerId = 42;

    beforeEach(() => {
      _.each([
        { id: 1, challengeId, assessmentId, createdAt: moment().subtract(2, 'day').toDate() },
        { id: 2, challengeId, assessmentId: otherAssessmentId, createdAt: moment().subtract(1, 'day').toDate() },
        { id: expectedAnswerId, challengeId: anotherChallengeId, assessmentId, createdAt: moment().subtract(1, 'day').toDate() },
        { id: 4, challengeId: otherChallengeId, assessmentId, createdAt: moment().subtract(3, 'day').toDate() },
      ], (answer) => (databaseBuilder.factory.buildAnswer(answer)));
      return databaseBuilder.commit();
    });

    it('should resolves the last answers with assessment id provided', () => {
      // when
      const promise = AnswerRepository.findLastByAssessment(assessmentId);

      // then
      return promise.then((answer) => {
        expect(answer).to.be.instanceof(Answer);
        expect(answer.assessmentId).to.be.equal(assessmentId);
        expect(answer.id).to.be.equal(expectedAnswerId);
      });
    });
  });

  describe('#findCorrectAnswersByAssessmentId', () => {

    beforeEach(() => {
      _.each([
        { result: 'ok', challengeId, assessmentId, },
        { result: 'ok', challengeId, assessmentId: otherAssessmentId, },
        { result: 'ko', challengeId: otherChallengeId, assessmentId, },
      ], (answer) => (databaseBuilder.factory.buildAnswer(answer)));
      return databaseBuilder.commit();
    });

    it('should retrieve answers with ok status from assessment id provided', () => {
      // given
      const expectedStatus = {
        status: 'ok'
      };

      // when
      const promise = AnswerRepository.findCorrectAnswersByAssessmentId(assessmentId);

      // then
      return promise.then((answers) => {
        expect(answers).to.exist;
        expect(answers).to.have.length.of(1);

        const foundAnswer = answers[0];

        expect(foundAnswer.assessmentId).to.be.equal(assessmentId);
        expect(foundAnswer.result).to.deep.equal(expectedStatus);
      });
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
        savedAnswer = await AnswerRepository.saveWithKnowledgeElements(answer, [firstKnowledgeElement, secondeKnowledgeElements]);
      });

      it('should save the answer in db', async () => {
        // then
        const expectedRawAnswerWithoutIdNorDates = {
          value: answer.value,
          result: answerStatusDatabaseAdapter.toSQLString(answer.result),
          assessmentId: answer.assessmentId,
          challengeId: answer.challengeId,
          timeout: answer.timeout,
          elapsedTime: answer.elapsedTime,
          resultDetails: `${answer.resultDetails}\n`,
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
        savedAnswer = await catchErr(AnswerRepository.saveWithKnowledgeElements)(answer, [firstKnowledgeElement, secondeKnowledgeElements]);

        // then
        const answerInDB = await knex('answers');
        const knowledgeElementsInDB = await knex('knowledge-elements');
        expect(answerInDB).to.have.length(0);
        expect(knowledgeElementsInDB).to.have.length(0);
      });

    });
  });

});
