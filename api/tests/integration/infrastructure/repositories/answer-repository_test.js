const { expect, knex, domainBuilder, databaseBuilder } = require('../../../test-helper');
const Answer = require('../../../../lib/domain/models/Answer');
const answerStatusDatabaseAdapter = require('../../../../lib/infrastructure/adapters/answer-status-database-adapter');
const { NotFoundError } = require('../../../../lib/domain/errors');
const _ = require('lodash');
const moment = require('moment');

const AnswerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');

describe('Integration | Repository | AnswerRepository', () => {
  let assessmentId, otherAssessmentId;
  const challengeId = 'challenge_1234';
  const otherChallengeId = 'challenge_4567';
  const anotherChallengeId = 'challenge_89';

  beforeEach(() => {
    assessmentId = databaseBuilder.factory.buildAssessment().id;
    otherAssessmentId = databaseBuilder.factory.buildAssessment().id;
    return databaseBuilder.commit();
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

  describe('#findByChallenge', () => {

    beforeEach(() => {
      _.each([
        { value: '1,2', challengeId, assessmentId, }, // nominal case
        { value: '1', challengeId, assessmentId: otherAssessmentId, }, // same challenge different assessment
        { value: '1,2,3', challengeId: otherChallengeId, assessmentId: otherAssessmentId, }, //different challenge different assessment
      ], (answer) => (databaseBuilder.factory.buildAnswer(answer)));
      return databaseBuilder.commit();
    });

    it('should find all answers by challenge id', () => {
      // when
      const promise = AnswerRepository.findByChallenge('challenge_1234');

      // then
      return promise.then((foundAnswers) => {

        expect(foundAnswers).to.exist;

        expect(foundAnswers).to.have.length.of(2);

        const values = _.map(foundAnswers, 'value');
        expect(values).to.include.members(['1', '1,2']);

        const challengeIds = _.map(foundAnswers, 'challengeId');
        expect(challengeIds).to.include(challengeId);
        expect(challengeIds).to.not.include(otherChallengeId);
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

  describe('#save', () => {

    let answer;
    let savedAnswer;

    beforeEach(async () => {
      // XXX resultDetails is by default null which is saved as "null\n" in db.
      // To avoid problems in test it is fixed to another string.
      answer = domainBuilder.buildAnswer({ assessmentId, resultDetails: 'some random detail' });
      answer.id = undefined;

      // when
      savedAnswer = await AnswerRepository.save(answer);
    });

    afterEach(() => {
      return knex('answers').delete();
    });

    it('should save the answer in db', () => {
      // then
      // id, createdAt, and updatedAt are not present
      const expectedRawAnswerWithoutIdNorDates = {
        value: answer.value,
        result: answerStatusDatabaseAdapter.toSQLString(answer.result),
        assessmentId: answer.assessmentId,
        challengeId: answer.challengeId,
        timeout: answer.timeout,
        elapsedTime: answer.elapsedTime,
        resultDetails: `${answer.resultDetails}\n`, // XXX text fields are saved with a \n at the end
      };
      return knex('answers').first()
        .then((answer) => _.omit(answer, ['id', 'createdAt', 'updatedAt']))
        .then((answerWithoutIdNorDates) => {
          return expect(answerWithoutIdNorDates).to.deep.equal(expectedRawAnswerWithoutIdNorDates);
        });
    });

    it('should return a domain object with the id', () => {
      expect(savedAnswer.id).to.not.equal(undefined);
      expect(savedAnswer).to.be.an.instanceOf(Answer);
      // XXX text fields are saved with a \n at the end, so the test fails for that reason
      expect(_.omit(savedAnswer, ['id', 'resultDetails'])).to.deep.equal(_.omit(answer, ['id', 'resultDetails']));
    });
  });
});
