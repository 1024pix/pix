import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | course list', function () {

  setupTest('component:course-list', {});

  describe('#filteredCourses', function () {

    let component;

    const oneCourseArray = [
      { id: 'course_id' }
    ];
    const fiveCoursesArray = [
      { id: 'course_1' },
      { id: 'course_2' },
      { id: 'course_3' },
      { id: 'course_4' },
      { id: 'course_5' }
    ];

    beforeEach(function () {
      component = this.subject();
    });

    it('should return an empty array when courses are null', function () {
      // given
      component.set('courses', null);

      // when
      const result = component.get('filteredCourses');

      // then
      expect(result).to.have.lengthOf(0);
    });

    it('should return all courses when limit is not defined', function () {
      // given
      component.set('courses', fiveCoursesArray);

      // when
      const result = component.get('filteredCourses');

      // then
      expect(result).to.have.lengthOf(5);
    });

    it('should return only 3 courses on 5 when limit is set to 2', function () {
      // given
      component.set('courses', fiveCoursesArray);
      component.set('limit', 3);

      // when
      const result = component.get('filteredCourses');

      // then
      expect(result).to.have.lengthOf(3);
    });

    it('should return only 1 course on 1 when limit is set to 3', function () {
      // given
      component.set('courses', oneCourseArray);
      component.set('limit', 3);

      // when
      const result = component.get('filteredCourses');

      // then
      expect(result).to.have.lengthOf(1);
    });
  });
});
