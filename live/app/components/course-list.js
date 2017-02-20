import Ember from 'ember';
import ENV from 'pix-live/config/environment';


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

const CourseList = Ember.Component.extend({

  courses: null,
  selectedCourse: null,

  didInsertElement () {
    const that = this;
    Ember.run.scheduleOnce('afterRender', this, function () {
      $('button[data-confirm]').click(function () {
        $('#js-modal-mobile').modal('hide');
        that.sendAction('startCourse', that.get('selectedCourse'));
      });
    });

    if (ENV.environment === 'test') {
      this.$().on('simulateMobileScreen', function () {
        that.set('isSimulatedMobileScreen', 'true');
      });
    }
  },

  _isMobile () {
    if (ENV.environment !== 'test') {
      return $(window).width() < 767;
    } else {
      return this.get('isSimulatedMobileScreen');
    }
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
