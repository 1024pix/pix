const { expect, sinon } = require('../../../test-helper');
const BookshelfCertificationCourse = require('../../../../lib/infrastructure/data/certification-course');

describe('Unit | Infrastructure | Models | BookshelfCertificationCourse', () => {

  describe('validation', () => {

    let rawData;

    beforeEach(() => {
      rawData = {
        status: null
      };
    });

    describe('the status field', () => {

      it('should only accept specific values', () => {
        // Given
        rawData.status = 'not_a_correct_status';
        const certification = new BookshelfCertificationCourse(rawData);

        // When
        const promise = certification.save();

        // Then
        return promise
          .then(() => {
            sinon.assert.fail('Cannot succeed');
          })
          .catch((err) => {
            const status = err.data['status'];
            expect(status).to.exist.and.to.deep.equal(['Le status de la certification n\'est pas valide']);
          });
      });

      ['started', 'completed', 'validated', 'rejected'].forEach((organizationType) => {
        it(`should be saved when organisation type is ${organizationType}`, () => {
          // Given
          rawData.status = organizationType;
          const certification = new BookshelfCertificationCourse(rawData);

          // When
          const promise = certification.save();

          // Then
          return promise
            .catch(_ => {
              sinon.assert.fail(new Error(`Should not fail with ${organizationType} type`));
            });
        });
      });
    });
  });
});
