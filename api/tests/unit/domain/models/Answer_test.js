const Answer = require('../../../../lib/domain/models/Answer');
const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | Answer', () => {

  describe('constructor', () => {

    it('should build an Answer from raw JSON', () => {
      // given
      const rawData = {
        id: 2,
        value: 'Avast, Norton',
        result: 'ok',
        resultDetails: 'champs1 : ok \n champs2 : ko',
        elapsedTime: 100,
        timeout: 0,
        challengeId: 'redRecordId',
        assessmentId: 82,
        correction: 'OK'
      };

      const expectedProperties = {
        id: 2,
        elapsedTime: 100,
        result: { status: 'ok' },
        resultDetails: 'champs1 : ok \n champs2 : ko',
        timeout: 0,
        value: 'Avast, Norton',
        correction: 'OK',
        assessmentId: 82,
        challengeId: 'redRecordId',
      };

      // when
      const answer = new Answer(rawData);

      // then
      expect(answer).to.deep.include(expectedProperties);
    });
  });

  describe('isOK', () => {

    it('should return true if answer is ok', () => {
      // given
      const answer = new Answer({ result: 'ok' });

      // when/then
      expect(answer.isOk()).to.be.true;
    });

    it('should return false if answer is different than ok', () => {
      // given
      const answer = new Answer({ result: 'notok' });

      // when/then
      expect(answer.isOk()).to.be.false;
    });
  });

  describe('isPartially', () => {

    it('should return true if answer is partially', () => {
      // given
      const answer = new Answer({ result: 'partially' });

      // when
      expect(answer.isPartially()).to.be.true;
    });

    it('should return false if answer is different than partially', () => {
      // given
      const answer = new Answer({ result: 'notok' });

      // when
      expect(answer.isPartially()).to.be.false;
    });
  });

  describe('#binaryOutcome', () => {

    it('should exist', () => {
      // given
      const answer = new Answer({ result: 'ko' });

      // then
      expect(answer.binaryOutcome).to.exist;
    });

    it('should return 1 if answer is correct', () => {
      // given
      const answer = new Answer({ result: 'ok' });

      // when
      const maxDifficulty = answer.binaryOutcome;

      // then
      expect(maxDifficulty).to.equal(1);
    });

    it('should return 0 if answer is not correct', () => {
      // given
      const answer = new Answer({ result: 'ko' });

      // when
      const maxDifficulty = answer.binaryOutcome;

      // then
      expect(maxDifficulty).to.equal(0);
    });
  });

  describe('#hasTimedOut', () => {

    it('should return true if answer has timed out', () => {
      // given
      const answer = domainBuilder.buildAnswer({ timeout: -1 });

      // when
      const hasTimedOut = answer.hasTimedOut;

      // then
      expect(hasTimedOut).to.be.true;
    });

    it('should return false if answer has not timed out', () => {
      // given
      const answer = domainBuilder.buildAnswer({ timeout: 1 });

      // when
      const hasTimedOut = answer.hasTimedOut;

      // then
      expect(hasTimedOut).to.be.false;
    });
  });
});
