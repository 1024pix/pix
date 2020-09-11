const { expect, sinon } = require('../../../test-helper');
const BookshelfAssessmentResults = require('../../../../lib/infrastructure/data/assessment-result');

describe('Unit | Domain | Models | BookshelfAssessmentResult', () => {

  describe('validation', () => {

    let rawData;

    beforeEach(() => {
      rawData = {
        emitter: '',
        status: null,
      };
    });

    describe('the status field', () => {

      it('should only accept specific values', () => {
        // given
        rawData.status = 'not_a_correct_status';
        const certification = new BookshelfAssessmentResults(rawData);

        // when
        const promise = certification.save();

        // then
        return promise
          .then(() => {
            sinon.assert.fail('Cannot succeed');
          })
          .catch((err) => {
            const status = err.data['status'];
            expect(status).to.exist.and.to.deep.equal(['Le status de la certification n\'est pas valide']);
          });
      });
    });
  });
});
