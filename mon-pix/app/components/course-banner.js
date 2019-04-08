import Component from '@ember/component';
import { computed } from '@ember/object';
import { getHomeHost } from '../helpers/get-home-host';

export default Component.extend({

  // Element
  classNames: ['course-banner'],

  // Data props
  course: null,
  withHomeLink: false,
  urlHome: getHomeHost(),

  // CPs
  courseName: computed('course.name', function() {
    const courseName = this.get('course.name');
    return courseName ? courseName : '';
  })
});
