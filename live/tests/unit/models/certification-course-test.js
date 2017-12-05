import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | certification course', function() {
  setupModelTest('certification-course', {
    // Specify the other units that are required for this test.
    needs: []
  });

  describe('@type', function() {

    it('should be "CERTIFICATION"', function() {
      // given
      const certificationCourse = this.subject();

      // when
      const result = certificationCourse.get('type');

      // then
      expect(result).to.equal('CERTIFICATION');

    });
  });
});
