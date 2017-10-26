import Ember from 'ember';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | course item', function() {

  setupComponentTest('course-item', {
    integration: true
  });

  describe('rendering:', function() {

    it('renders', function() {
      this.render(hbs`{{course-item}}`);
      expect(this.$()).to.have.lengthOf(1);
    });

    it('should render course picture if it is defined', function() {
      // given
      const course = Ember.Object.create({ imageUrl: '/images/pix-logo.svg' });
      this.set('course', course);

      // when
      this.render(hbs`{{course-item course=course}}`);

      // then
      const $picture = this.$('.course-item__picture');
      expect($picture.attr('src')).to.equal(course.get('imageUrl'));
    });

    it('should render default picture if course picture is not defined', function() {
      // given
      const course = Ember.Object.create();
      this.set('course', course);

      // when
      this.render(hbs`{{course-item course=course}}`);

      // then
      const $picture = this.$('.course-item__picture');
      expect($picture.attr('src')).to.equal('/images/course-default-image.png');
    });

    it('should render course name', function() {
      // given
      const course = Ember.Object.create({ name: 'name_value' });
      this.set('course', course);

      // when
      this.render(hbs`{{course-item course=course}}`);

      // then
      const $name = this.$('.course-item__name');
      expect($name.text().trim()).to.equal(course.get('name'));
    });

    it('should render course description', function() {
      // given
      const course = Ember.Object.create({ description: 'description_value' });
      this.set('course', course);

      // when
      this.render(hbs`{{course-item course=course}}`);

      // then
      const $description = this.$('.course-item__description');
      expect($description.text().trim()).to.equal(course.get('description'));
    });

    it('should render the number of challenges', function() {
      // given
      const course = Ember.Object.create({ challenges: ['c1', 'c2', 'c3', 'c4'] });
      this.set('course', course);

      // when
      this.render(hbs`{{course-item course=course}}`);

      // then
      const $nbChallenges = this.$('.course-item__challenges-number');
      expect($nbChallenges.text().trim()).to.equal('4 épreuves');
    });

    it('should render the number of challenges', function() {
      // given
      const course = Ember.Object.create({ challenges: [], nbChallenges: 2 });
      this.set('course', course);

      // when
      this.render(hbs`{{course-item course=course}}`);

      // then
      const $nbChallenges = this.$('.course-item__challenges-number');
      expect($nbChallenges.text().trim()).to.equal('2 épreuves');
    });

    it('should render a link to begin the course', function() {
      // given
      const course = Ember.Object.create();
      this.set('course', course);

      // when
      this.render(hbs`{{course-item course=course}}`);

      // then
      const $startAction = this.$('.course-item__begin-button');
      expect($startAction.text().trim()).to.equal('Commencer');
    });

    it('should render a link containing the course name in title', function() {
      // given
      const course = Ember.Object.create({ name: 'My course' });
      this.set('course', course);

      // when
      this.render(hbs`{{course-item course=course}}`);

      // then
      const $startAction = this.$('.course-item__begin-button');
      expect($startAction.attr('title')).to.equal('Commencer le test "My course"');
    });
  });

  describe('behaviours:', function() {

    it('should send action "startCourse" with course in argument when clicking on "start" button', function() {
      // given
      const course = Ember.Object.create({ id: 'course_id' });
      this.set('course', course);
      let actualCourse;
      this.on('actionHandler', function(receivedCourse) {
        actualCourse = receivedCourse;
      });

      // when
      this.render(hbs`{{course-item course=course startCourse="actionHandler"}}`);

      // then
      const $startAction = this.$('.course-item__begin-button');
      $startAction.click();
      expect(actualCourse.get('id')).to.equal(course.get('id'));
    });

  });

});
