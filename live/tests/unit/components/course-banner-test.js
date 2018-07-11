import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import EmberObject from '@ember/object';

describe('Unit | Component | course-banner', function() {

  setupComponentTest('course-banner', { unit: true });

  describe('@courseName', () => {

    it('should return course name when it exists', function() {
      // given
      const component = this.subject();
      const course = EmberObject.create({ name: 'On est en finale !!!' });
      component.set('course', course);

      // when
      const courseName = component.get('courseName');

      // then
      expect(courseName).to.equal('On est en finale !!!');
    });
    it('should return "Parcours e-pro" when it does not exist', function() {
      // given
      const component = this.subject();

      // when
      const courseName = component.get('courseName');

      // then
      expect(courseName).to.equal('Parcours e-pro');
    });
  });

});
