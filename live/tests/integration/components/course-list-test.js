import Ember from 'ember';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | course list', function () {

  setupComponentTest('course-list', {
    integration: true
  });

  describe('rendering:', function () {

    it('renders', function () {
      this.render(hbs`{{course-list}}`);
      expect(this.$()).to.have.length(1);
    });

    it('should render as many course-item as courses elements', function () {
      // given
      const courses = [
        Ember.Object.create({ id: '1' }),
        Ember.Object.create({ id: '2' }),
        Ember.Object.create({ id: '3' })
      ];
      this.set('courses', courses);

      // when
      this.render(hbs`{{course-list courses=courses}}`);

      // then
      expect(this.$('.course-list__li')).to.have.length(courses.length);
    });
  });
});
