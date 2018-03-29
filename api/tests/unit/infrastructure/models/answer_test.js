const { expect } = require('../../../test-helper');

const BookshelfAnswer = require('../../../../lib/infrastructure/data/answer');
const Answer = require('../../../../lib/domain/models/Answer');

describe('Unit | Infrastructure | Models | BookshelfAnswer', () => {

  describe('#toDomainEntity', () => {

    it('should convert a Bookshelf object into a Domain entity', () => {
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
      const bookshelfAnswer = new BookshelfAnswer(rawData);

      // when
      const answer = bookshelfAnswer.toDomainEntity();

      // then
      expect(answer).to.be.an.instanceof(Answer);
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

});

