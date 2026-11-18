import { expect } from 'chai';

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
});
