import { Feedbacks } from '../../../../../src/devcomp/domain/models/Feedbacks.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Feedbacks', function () {
  describe('#constructor', function () {
    it('should instanciate a Feedbacks with right properties', function () {
      // Given
      const valid = 'valid';
      const invalid = 'invalid';

      // When
      const feedbacks = new Feedbacks({
        valid,
        invalid,
      });

      // Then
      expect(feedbacks.valid).equal(valid);
      expect(feedbacks.invalid).equal(invalid);
    });
  });

  describe('An empty Feedbacks', function () {
    it('should throw an error', function () {
      expect(() => new Feedbacks({})).to.throw('The feedback message for the field valid is required');
    });
  });

  describe('A Feedbacks without invalid key', function () {
    it('should throw an error', function () {
      expect(() => new Feedbacks({ valid: 'valid' })).to.throw(
        'The feedback message for the field invalid is required',
      );
    });
  });
});
