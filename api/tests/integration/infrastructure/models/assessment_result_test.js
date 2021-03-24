const { sinon, knex } = require('../../../test-helper');
const BookshelfAssessmentResults = require('../../../../lib/infrastructure/data/assessment-result');

describe('Integration | Infrastructure | Models | BookshelfAssessmentResult', function() {
  describe('validation', function() {
    let rawData;

    beforeEach(function() {
      rawData = {
        emitter: '',
        status: null,
      };
    });

    afterEach(function() { return knex('assessment-results').delete(); });

    describe('the status field validated', function() {
      it('should be saved', function() {
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

    describe('the status field rejected', function() {
      it('should be saved', function() {
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
