const { expect, sinon } = require('./test-helpers');
const AlgoResult = require('../AlgoResult');
const AnswerStatus = require('../../../api/lib/domain/models/AnswerStatus');
const CsvFile = require('../utils/CsvFile');

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

  describe('#getResults', () => {
    let results;

    beforeEach(() => {
      // given
      const algoResult = new AlgoResult();
      const challenge1 = { id: 'rec1', skills: [{ name: 'skill1' }] };
      const challenge2 = { id: 'rec2', skills: [{ name: 'skill2' }] };
      algoResult.addChallenge(challenge1);
      algoResult.addChallenge(challenge2);
      algoResult.addChallengeLevel(2);
      algoResult.addChallengeLevel(4);
      algoResult.addEstimatedLevels(2);
      algoResult.addEstimatedLevels(4);
      algoResult.addAnswerStatus({ status: 'ko' });
      algoResult.addAnswerStatus({ status: 'ok' });
      const testSet = 'test-set';

      // when
      results = algoResult._getResults(testSet);
    });

    it('should return an array with same size as asked challenge', () => {
      // expect
      expect(results.length).to.equal(2);
    });

    it('should return result with number of challenge', () => {
      // expect
      expect(results[0].nChallenge).to.equal(1);
      expect(results[1].nChallenge).to.equal(2);
    });

    it('should return result with challengeId', () => {
      // expect
      expect(results[0].challengeId).to.equal('rec1');
      expect(results[1].challengeId).to.equal('rec2');
    });

    it('should return result with challengeLevel', () => {
      // expect
      expect(results[0].challengeLevel).to.equal(2);
      expect(results[1].challengeLevel).to.equal(4);
    });

    it('should return result with estimatedLevel', () => {
      // expect
      expect(results[0].estimatedLevel).to.equal(2);
      expect(results[1].estimatedLevel).to.equal(4);
    });

    it('should return result with answerStatus', () => {
      // expect
      expect(results[0].answerStatus).to.equal('ko');
      expect(results[1].answerStatus).to.equal('ok');
    });

    it('should return result with skill name', () => {
      // expect
      expect(results[0].skillName).to.equal('skill1');
      expect(results[1].skillName).to.equal('skill2');
    });

    it('should return result with testSet', () => {
      // expect
      expect(results[0].testSet).to.equal('test-set');
      expect(results[1].testSet).to.equal('test-set');
    });
  });

  describe('#writeCsvFile', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should get results and write it in file', () => {
      // given
      const algoResult = new AlgoResult();
      const challenge1 = { id: 'rec1', skills: [{ name: 'skill1' }] };
      const challenge2 = { id: 'rec2', skills: [{ name: 'skill2' }] };
      algoResult.addChallenge(challenge1);
      algoResult.addChallenge(challenge2);
      algoResult.addChallengeLevel(2);
      algoResult.addChallengeLevel(4);
      algoResult.addEstimatedLevels(2);
      algoResult.addEstimatedLevels(4);
      algoResult.addAnswerStatus({ status: 'ko' });
      algoResult.addAnswerStatus({ status: 'ok' });
      const csvFileCreateStub = sinon.stub(CsvFile.prototype, '_createAndAddHeadersIfNotExisting');
      const csvFileAppendStub = sinon.stub(CsvFile.prototype, 'append');
      algoResult._id = 'fixed-id';
      const testSet = 'test-set';

      // when
      algoResult.writeCsvFile(testSet);

      // then
      const expectedResults = [
        {
          id: 'fixed-id',
          nChallenge: 1,
          challengeId: 'rec1',
          challengeLevel: 2,
          skillName: 'skill1',
          estimatedLevel: 2,
          answerStatus: 'ko',
          testSet,
        },
        {
          id: 'fixed-id',
          nChallenge: 2,
          challengeId: 'rec2',
          challengeLevel: 4,
          skillName: 'skill2',
          estimatedLevel: 4,
          answerStatus: 'ok',
          testSet,
        },
      ];
      expect(csvFileCreateStub).to.have.been.called;
      expect(csvFileAppendStub).to.have.been.calledWith(expectedResults);
    });
  });
});
