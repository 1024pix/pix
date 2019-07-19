import Component from '@ember/component';
import { computed } from '@ember/object';
import ENV from 'mon-pix/config/environment';

export default Component.extend({

  // Data props
  course: null,
  withHomeLink: false,
  urlHome: ENV.APP.HOME_HOST,

  // CPs
  courseName: computed('course.name', function() {
    const courseName = this.get('course.name');
    return courseName ? courseName : '';
  })
});
