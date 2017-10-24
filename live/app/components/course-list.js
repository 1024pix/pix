import { run } from '@ember/runloop';
import { computed } from '@ember/object';
import Component from '@ember/component';
import ENV from 'pix-live/config/environment';
import $ from 'jquery';

function _userNotAlreadyWarnedAboutMobileIncompleteSupport(that) {
  return that._isMobile() && !localStorage.getItem('pix-mobile-warning');
}

function _rememberThatUserIsNowAware() {
  localStorage.setItem('pix-mobile-warning', 'true');
}

function _storeCourseToDisplayAfterWarning(that, course) {
  that.set('selectedCourse', course);
}

function _displayWarningModal() {
  $('#js-modal-mobile').modal();
}

const CourseList = Component.extend({

  courses: null,
  selectedCourse: null,

  classNames: ['course-list'],

  isLoading: computed.readOnly('courses.isPending'),

  filteredCourses: computed('courses.[]', function() {
    const courses = this.get('courses');
    let filteredCourses = [];

    if (courses) {
      const limit = this.get('limit');
      filteredCourses = courses.toArray();
      if (limit) {
        filteredCourses = courses.slice(0, limit);
      }
    }
    return filteredCourses;
  }),

  didInsertElement() {
    const that = this;
    run.scheduleOnce('afterRender', this, () => {
      this.$('button[data-confirm]').click(() => {
        this.$('#js-modal-mobile').modal('hide');
        this.sendAction('startCourse', that.get('selectedCourse'));
      });
    });

    if (ENV.APP.isMobileSimulationEnabled) {
      this.$().on('simulateMobileScreen', function() {
        that.set('isSimulatedMobileScreen', 'true');
      });
    }
  },

  _isMobile() {
    if (ENV.APP.isMobileSimulationEnabled) {
      return this.get('isSimulatedMobileScreen');
    }
    return $(window).width() < 767;
  },

  actions: {
    startCourse(course) {
      if (_userNotAlreadyWarnedAboutMobileIncompleteSupport(this)) {
        _rememberThatUserIsNowAware();
        _storeCourseToDisplayAfterWarning(this, course);
        _displayWarningModal();
      } else {
        this.sendAction('startCourse', course);
      }
    }
  }

});

export default CourseList;
