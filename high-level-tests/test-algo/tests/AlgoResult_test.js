const { expect } = require('chai');
const { beforeEach, describe, it } = require('mocha');
const AlgoResult = require('../AlgoResult');
const AnswerStatus = require('../../../api/lib/domain/models/AnswerStatus');

describe('AlgoResult', () => {

  describe('#log', () => {
    it('should return total challenge asked', () => {
      // given
      const algoResult = new AlgoResult();
      const challenge1 = { id: 'rec1', skills: [] };
      const challenge2 = { id: 'rec2', skills: [] };
      algoResult.addChallenge(challenge1);
      algoResult.addChallenge(challenge2);

      // when
      const log = algoResult.log();

      // expect
      expect(log).contains('----- total challenges asked: 2');
    });

    it('should return challengeIds asked', () => {
      // given
      const algoResult = new AlgoResult();
      const challenge1 = { id: 'rec1', skills: [] };
      const challenge2 = { id: 'rec2', skills: [] };
      algoResult.addChallenge(challenge1);
      algoResult.addChallenge(challenge2);

      // when
      const log = algoResult.log();

      // expect
      expect(log).contains('----- challenge ids asked: rec1,rec2');
    });

    it('should return evolution of the estimated levels', () => {
      // given
      const algoResult = new AlgoResult();
      const challenge1 = '2';
      const challenge2 = '5';
      const challenge3 = '4.5';
      algoResult.addEstimatedLevels(challenge1);
      algoResult.addEstimatedLevels(challenge2);
      algoResult.addEstimatedLevels(challenge3);

      // when
      const log = algoResult.log();

      // expect
      expect(log).contains('----- estimated levels evolution: 2,5,4.5');
    });

    it('should return unique names of the skills', () => {
      // given
      const algoResult = new AlgoResult();
      const challenge1 = { skills: [{ name: 'skill1' }] };
      const challenge2 = { skills: [{ name: 'skill1' }] };
      const challenge3 = { skills: [{ name: 'skill2' }] };
      algoResult.addChallenge(challenge1);
      algoResult.addChallenge(challenge2);
      algoResult.addChallenge(challenge3);

      // when
      const log = algoResult.log();

      // expect
      expect(log).contains('----- skill names: skill1', 'skill2');
    });

    describe('display correct answer count', () => {
      let log;

      beforeEach(() => {
        const algoResult = new AlgoResult();
        algoResult.addAnswerStatus(new AnswerStatus({ status: 'ko' }));
        algoResult.addAnswerStatus(new AnswerStatus({ status: 'ok' }));
        algoResult.addAnswerStatus(new AnswerStatus({ status: 'ko' }));

        log = algoResult.log();
      });

      it('should return count of KO answers', () => {
        // expect
        expect(log).to.contains('----- total answer KO: 2');
      });

      it('should return count of OK answers', () => {
        // expect
        expect(log).to.contains('----- total answer OK: 1');
      });
    });

    describe('display first answer status', () => {

      it('should return N/A if there is no answer status', () => {
        // given
        const algoResult = new AlgoResult();

        // when
        const log = algoResult.log();

        // expect
        expect(log).contains('----- first challenge status: N/A');
      });

      it('should return the first challenge‘s answer status', () => {
        // given
        const algoResult = new AlgoResult();
        algoResult.addAnswerStatus(new AnswerStatus({ status: 'ko' }));
        algoResult.addAnswerStatus(new AnswerStatus({ status: 'ok' }));
        algoResult.addAnswerStatus(new AnswerStatus({ status: 'ok' }));

        // when
        const log = algoResult.log();

        // expect
        expect(log).contains('----- first challenge status: ko');
      });
    });

    describe('challenge level gap', () => {
      let algoResult;

      beforeEach(() => {
        algoResult = new AlgoResult();
        algoResult.addChallengeLevel(2);
        algoResult.addChallengeLevel(5);
        algoResult.addChallengeLevel(6);
        algoResult.addChallengeLevel(2);
      });

      it('should return the biggest ascending gap', () => {
        // when
        const log = algoResult.log();

        // expect
        expect(log).contains('----- biggest ASC gap: 3');
      });

      it('should return the biggest descending gap', () => {
        // when
        const log = algoResult.log();

        // expect
        expect(log).contains('----- biggest DESC gap: 4');
      });
    });

  });
});
