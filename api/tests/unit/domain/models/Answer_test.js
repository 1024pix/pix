const Answer = require('../../../../lib/domain/models/Answer');
const Skill = require('../../../../lib/domain/models/Skill');
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
        correction: 'OK',
        levelup: {}
      };

      const expectedAnswer = {
        id: 2,
        value: 'Avast, Norton',
        result: { status: 'ok' },
        resultDetails: 'champs1 : ok \n champs2 : ko',
        elapsedTime: 100,
        timeout: 0,
        challengeId: 'redRecordId',
        assessmentId: 82,
        correction: 'OK',
        levelup: {}
      };

      // when
      const answer = new Answer(rawData);

      // then
      expect(answer).to.deep.equal(expectedAnswer);
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

  describe('#maxDifficulty', () => {

    it('should exist', () => {
      // given
      const answer = new Answer({ result: 'ko' });
      answer.challenge = { skills: [] };

      // then
      expect(answer.maxDifficulty).to.exist;
    });

    it('should return the maximal skill difficulty of a challenge', () => {
      // given
      const web5 = new Skill({ name: '@web5' });
      const url1 = new Skill({ name: '@url1' });
      const challenge = { skills: [web5, url1] };
      const answer = new Answer({ result: 'ko' });
      answer.challenge = challenge;

      // when
      const maxDifficulty = answer.maxDifficulty();

      // then
      expect(maxDifficulty).to.equal(5);
    });

    it('should return the base difficulty if the challenge is undefined', () => {
      // given
      const answer = new Answer({});

      const baseDifficulty = 2;
      // when
      const maxDifficulty = answer.maxDifficulty(baseDifficulty);

      // then
      expect(maxDifficulty).to.equal(baseDifficulty);
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
