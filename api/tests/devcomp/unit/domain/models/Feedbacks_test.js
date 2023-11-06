import { expect } from '../../../../test-helper.js';
import { Feedbacks } from '../../../../../src/devcomp/domain/models/Feedbacks.js';

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
      expect(() => new Feedbacks({})).to.throw('Le message de feedback valide est obligatoire');
    });
  });

  describe('A Feedbacks without invalid key', function () {
    it('should throw an error', function () {
      expect(() => new Feedbacks({ valid: 'valid' })).to.throw('Le message de feedback invalide est obligatoire');
    });
  });
});
