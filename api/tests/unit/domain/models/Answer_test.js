import Answer from '../../../../lib/domain/models/Answer';
import Skill from '../../../../lib/domain/models/Skill';
import { expect, domainBuilder } from '../../../test-helper';

describe('Unit | Domain | Models | Answer', function () {
  describe('constructor', function () {
    it('should build an Answer from raw JSON', function () {
      // given
      const rawData = {
        id: 2,
        value: 'Avast, Norton',
        result: 'ok',
        resultDetails: 'champs1 : ok \n champs2 : ko',
        timeout: 0,
        challengeId: 'redRecordId',
        assessmentId: 82,
        levelup: {},
        timeSpent: 30,
        isFocusedOut: false,
      };

      const expectedAnswer = {
        id: 2,
        value: 'Avast, Norton',
        result: { status: 'ok' },
        resultDetails: 'champs1 : ok \n champs2 : ko',
        timeout: 0,
        challengeId: 'redRecordId',
        assessmentId: 82,
        levelup: {},
        timeSpent: 30,
        isFocusedOut: false,
      };

      // when
      const answer = new Answer(rawData);

      // then
      expect(answer).to.deep.equal(expectedAnswer);
    });
  });

  describe('isOK', function () {
    it('should return true if answer is ok', function () {
      // given
      const answer = new Answer({ result: 'ok' });

      // when/then
      expect(answer.isOk()).to.be.true;
    });

    it('should return false if answer is different than ok', function () {
      // given
      const answer = new Answer({ result: 'notok' });

      // when/then
      expect(answer.isOk()).to.be.false;
    });
  });

  describe('isPartially', function () {
    it('should return true if answer is partially', function () {
      // given
      const answer = new Answer({ result: 'partially' });

      // when
      expect(answer.isPartially()).to.be.true;
    });

    it('should return false if answer is different than partially', function () {
      // given
      const answer = new Answer({ result: 'notok' });

      // when
      expect(answer.isPartially()).to.be.false;
    });
  });

  describe('#maxDifficulty', function () {
    it('should exist', function () {
      // given
      const answer = new Answer({ result: 'ko' });
      answer.challenge = { skills: [] };

      // then
      expect(answer.maxDifficulty).to.exist;
    });

    it('should return the maximal skill difficulty of a challenge', function () {
      // given
      const web5 = new Skill({ name: '@web', difficulty: 5 });
      const url1 = new Skill({ name: '@url', difficulty: 1 });
      const challenge = { skills: [web5, url1] };
      const answer = new Answer({ result: 'ko' });
      answer.challenge = challenge;

      // when
      const maxDifficulty = answer.maxDifficulty();

      // then
      expect(maxDifficulty).to.equal(5);
    });

    it('should return the base difficulty if the challenge is undefined', function () {
      // given
      const answer = new Answer({});

      const baseDifficulty = 2;
      // when
      const maxDifficulty = answer.maxDifficulty(baseDifficulty);

      // then
      expect(maxDifficulty).to.equal(baseDifficulty);
    });
  });

  describe('#binaryOutcome', function () {
    it('should exist', function () {
      // given
      const answer = new Answer({ result: 'ko' });

      // then
      expect(answer.binaryOutcome).to.exist;
    });

    it('should return 1 if answer is correct', function () {
      // given
      const answer = new Answer({ result: 'ok' });

      // when
      const maxDifficulty = answer.binaryOutcome;

      // then
      expect(maxDifficulty).to.equal(1);
    });

    it('should return 0 if answer is not correct', function () {
      // given
      const answer = new Answer({ result: 'ko' });

      // when
      const maxDifficulty = answer.binaryOutcome;

      // then
      expect(maxDifficulty).to.equal(0);
    });
  });

  describe('#hasTimedOut', function () {
    it('should return true if answer has timed out', function () {
      // given
      const answer = domainBuilder.buildAnswer({ timeout: -1 });

      // when
      const hasTimedOut = answer.hasTimedOut;

      // then
      expect(hasTimedOut).to.be.true;
    });

    it('should return false if answer has not timed out', function () {
      // given
      const answer = domainBuilder.buildAnswer({ timeout: 1 });

      // when
      const hasTimedOut = answer.hasTimedOut;

      // then
      expect(hasTimedOut).to.be.false;
    });
  });

  describe('#setTimeSpentFrom', function () {
    it('should return the computed time spent on a challenge', function () {
      // given
      const answer = domainBuilder.buildAnswer();
      const lastQuestionDate = new Date('2021-03-11T11:00:00Z');
      const now = new Date('2021-03-11T11:00:04Z');
      now.setMilliseconds(1);

      // when
      answer.setTimeSpentFrom({ now, lastQuestionDate });

      // then
      expect(answer.timeSpent).to.equal(5);
    });
  });
});
