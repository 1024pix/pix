import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  // Element
  classNames: ['course-banner'],

  // Data props
  course: null,
  withHomeLink: false,

  // CPs
  courseName: computed('course.name', function() {
    const courseName = this.get('course.name');
    return courseName ? courseName : 'Parcours e-pro';
  })
});
