import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';

describe('Unit | Component | course-banner', function() {

  setupTest();

  describe('@courseName', () => {

    it('should return course name when it exists', function() {
      // given
      const component = this.owner.lookup('component:course-banner');
      const course = EmberObject.create({ name: 'On est en finale !!!' });
      component.set('course', course);

      // when
      const courseName = component.get('courseName');

      // then
      expect(courseName).to.equal('On est en finale !!!');
    });
    it('should return empty string when it does not exist', function() {
      // given
      const component = this.owner.lookup('component:course-banner');

      // when
      const courseName = component.get('courseName');

      // then
      expect(courseName).to.equal('');
    });
  });

});
