const Answer = require('../../../../lib/domain/models/Answer');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Skill = require('../../../../lib/domain/models/Skill');
const { expect } = require('../../../test-helper');

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
        assessmentId: 82
      };

      const expectedAnswer = {
        id: 2,
        value: 'Avast, Norton',
        result: { status: 'ok' },
        resultDetails: 'champs1 : ok \n champs2 : ko',
        elapsedTime: 100,
        timeout: 0,
        challengeId: 'redRecordId',
        assessmentId: 82
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

  describe('#maxDifficulty', function() {
    it('should exist', function() {
      // given
      const challenge = new Challenge();
      const answer = new Answer({ result: 'ko' });
      answer.challenge = challenge;
      // then
      expect(answer.maxDifficulty).to.exist;
    });

    it('should return the maximal skill difficulty of a challenge', function() {
      // given
      const web5 = new Skill({ name: '@web5' });
      const url1 = new Skill({ name: '@url1' });
      const challenge = new Challenge();
      challenge.addSkill(web5);
      challenge.addSkill(url1);
      const answer = new Answer({ result: 'ko' });
      answer.challenge = challenge;

      // when
      const maxDifficulty = answer.maxDifficulty();

      // then
      expect(maxDifficulty).to.equal(5);
    });

    it('should return the base difficulty if the challenge is undefined', function() {
      // given
      const answer = new Answer({ });

      const baseDifficulty = 2;
      // when
      const maxDifficulty = answer.maxDifficulty(baseDifficulty);

      // then
      expect(maxDifficulty).to.equal(baseDifficulty);
    });
  });

  describe('#binaryOutcome', function() {
    it('should exist', function() {
      // given
      const answer = new Answer({ result: 'ko' });

      // then
      expect(answer.binaryOutcome).to.exist;
    });

    it('should return 1 if answer is correct', function() {
      // given
      const answer = new Answer({ result: 'ok' });

      // when
      const maxDifficulty = answer.binaryOutcome;

      // then
      expect(maxDifficulty).to.equal(1);
    });

    it('should return 0 if answer is not correct', function() {
      // given
      const answer = new Answer({ result: 'ko' });

      // when
      const maxDifficulty = answer.binaryOutcome;

      // then
      expect(maxDifficulty).to.equal(0);
    });
  });

});
