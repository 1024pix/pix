const { expect } = require('chai');
const { beforeEach, describe, it } = require('mocha');
const AlgoResult = require('../AlgoResult');
const AnswerStatus = require('../../../api/lib/domain/models/AnswerStatus');

describe('AlgoResult', () => {

  describe('#log', () => {
    it('should return unique names of the skills', () => {
      // given
      const algoResult = new AlgoResult();
      const challenge1 = { skills: [{ name: 'skill1' }] };
      const challenge2 = { skills: [{ name: 'skill2' }] };
      const challenge3 = { skills: [{ name: 'skill2' }] };
      algoResult.addChallenge(challenge1);
      algoResult.addChallenge(challenge2);
      algoResult.addChallenge(challenge3);

      // when
      const skillNames = algoResult.skillNames;

      // expect
      expect(skillNames).to.be.deep.equal(new Set(['skill1', 'skill2']));
    });
  });

  describe('#print', () => {
    describe('#display correct answer count', () => {
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
  });

});
