import { computed } from '@ember/object';
import Component from '@ember/component';

const CourseItem = Component.extend({

  course: null,

  tagName: 'article',
  classNames: ['course-item', 'rounded-panel'],
  attributeBindings: ['tabindex'],
  tabindex: 0,

  imageUrl: computed('course', function() {
    const imageUrl = this.get('course.imageUrl');
    return imageUrl ? imageUrl : '/images/course-default-image.png';
  }),

  actions: {
    startCourse(course) {
      this.sendAction('startCourse', course);
    }
  }

});

export default CourseItem;
