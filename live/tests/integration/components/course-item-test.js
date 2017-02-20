import Ember from 'ember';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | course item', function () {

  setupComponentTest('course-item', {
    integration: true
  });

  describe('rendering:', function () {

    it('renders', function () {
      this.render(hbs`{{course-item}}`);
      expect(this.$()).to.have.length(1);
    });

    it('should render course picture if it is defined', function () {
      // given
      const course = Ember.Object.create({ imageUrl: 'image_src' });
      this.set('course', course);

      // when
      this.render(hbs`{{course-item course=course}}`);

      // then
      const $picture = this.$('.course-item__picture');
      expect($picture.attr('src')).to.equal(course.get('imageUrl'));
    });

    it('should render default picture if course picture is not defined', function () {
      // given
      const course = Ember.Object.create();
      this.set('course', course);

      // when
      this.render(hbs`{{course-item course=course}}`);

      // then
      const $picture = this.$('.course-item__picture');
      expect($picture.attr('src')).to.equal('/assets/images/course-default-image.png');
    });

    it('should render course name', function () {
      // given
      const course = Ember.Object.create({ name: 'name_value'});
      this.set('course', course);

      // when
      this.render(hbs`{{course-item course=course}}`);

      // then
      const $name = this.$('.course-item__name');
      expect($name.text().trim()).to.equal(course.get('name'));
    });

    it('should render course description', function () {
      // given
      const course = Ember.Object.create({ description: 'description_value'});
      this.set('course', course);

      // when
      this.render(hbs`{{course-item course=course}}`);

      // then
      const $description = this.$('.course-item__description');
      expect($description.text().trim()).to.equal(course.get('description'));
    });

    it('should render a "start" button', function () {
      // given
      const course = Ember.Object.create();
      this.set('course', course);

      // when
      this.render(hbs`{{course-item course=course}}`);

      // then
      const $startAction = this.$('.course-item__action--start');
      expect($startAction.text().trim()).to.equal('Démarrer le test');
    });
  });

  describe('behaviours:', function () {

    it('should send action "startCourse" with course in argument when clicking on "start" button', function () {
      // given
      const course = Ember.Object.create({ id: 'course_id'});
      this.set('course', course);
      let actualCourse;
      this.on('actionHandler', function(receivedCourse) {
        actualCourse = receivedCourse;
      });

      // when
      this.render(hbs`{{course-item course=course startCourse="actionHandler"}}`);

      // then
      const $startAction = this.$('.course-item__action--start');
      $startAction.click();
      expect(actualCourse.get('id')).to.equal(course.get('id'));
    });

  });


});
