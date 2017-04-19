import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | CourseItemComponent', function () {

  setupTest('component:course-item', {});

  describe('Computed property "imageUrl"', function () {
    let component;

    const COURSE_WITH_IMAGE = {imageUrl:'any_image.png'};
    const COURSE_WITHOUT_IMAGE = {imageUrl:null};

    function initComponentWithImage() {
      component = this.subject();
      component.set('course', COURSE_WITH_IMAGE);
    }

    function initComponentWithoutImage() {
      component = this.subject();
      component.set('course', COURSE_WITHOUT_IMAGE);
    }

    it('should display the image of the course', function () {
      // given
      initComponentWithImage.call(this);

      // when
      const imageUrl = component.get('imageUrl');

      // then
      expect(imageUrl).to.exists;
      expect(imageUrl).to.equal('any_image.png');
    });

    it('should display a default image if no image url is given', function () {
      // given
      initComponentWithoutImage.call(this);

      // when
      const imageUrl = component.get('imageUrl');

      // then
      expect(imageUrl).to.exists;
      expect(imageUrl).to.equal('/images/course-default-image.png');
    });

  });

});
