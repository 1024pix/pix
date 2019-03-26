const { sinon } = require('../../../test-helper');
const BookshelfAssessmentResults = require('../../../../lib/infrastructure/data/assessment-result');

describe('Integration | Infrastructure | Models | BookshelfAssessmentResult', () => {

  describe('validation', () => {

    let rawData;

    beforeEach(() => {
      rawData = {
        emitter: '',
        status: null
      };
    });

    describe('the status field', () => {

      ['validated', 'rejected'].forEach((status) => {
        it('should be saved when organisation type is ${organizationType}', () => {
          // given
          rawData.status = status;
          const certification = new BookshelfAssessmentResults(rawData);

          // when
          const promise = certification.save();

          // then
          return promise.catch((_) => {
            sinon.assert.fail(new Error(`Should not fail with ${status} type`));
          });
        });
      });
    });
  });
});
