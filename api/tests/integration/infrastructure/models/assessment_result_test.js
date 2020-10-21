const { sinon, knex } = require('../../../test-helper');
const BookshelfAssessmentResults = require('../../../../lib/infrastructure/data/assessment-result');

describe('Integration | Infrastructure | Models | BookshelfAssessmentResult', () => {
  describe('validation', () => {
    let rawData;

    beforeEach(() => {
      rawData = {
        emitter: '',
        status: null,
      };
    });

    afterEach(() => knex('assessment-results').delete());

    describe('the status field validated', () => {
      it('should be saved', () => {
        // given
        rawData.status = 'validated';
        const assessmentResult = new BookshelfAssessmentResults(rawData);

        // when
        const promise = assessmentResult.save();

        // then
        return promise.catch((_) => {
          sinon.assert.fail(new Error('Should not fail with validated type'));
        });
      });
    });

    describe('the status field rejected', () => {
      it('should be saved', () => {
        // given
        rawData.status = 'rejected';
        const assessmentResult = new BookshelfAssessmentResults(rawData);

        // when
        const promise = assessmentResult.save();

        // then
        return promise.catch((_) => {
          sinon.assert.fail(new Error('Should not fail with rejected type'));
        });
      });
    });
  });
});
