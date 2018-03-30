const { expect } = require('../../../test-helper');
const Answer = require('../../../../lib/domain/models/Answer');

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

      // when
      const answer = new Answer(rawData);

      // then
      expect(answer.id).to.equal(rawData.id);
      expect(answer.value).to.equal(rawData.value);
      expect(answer.result.status).to.equal(rawData.result);
      expect(answer.resultDetails).to.equal(rawData.resultDetails);
      expect(answer.elapsedTime).to.equal(rawData.elapsedTime);
      expect(answer.timeout).to.equal(rawData.timeout);
      expect(answer.challengeId).to.equal(rawData.challengeId);
      expect(answer.assessmentId).to.equal(rawData.assessmentId);
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

});
