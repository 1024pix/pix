import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({

  currentUser: service(),
  student: null,
  isShowingModal: false,

  actions: {

    openPasswordReset(student) {
      this.set('student', student);
      this.set('isShowingModal', true);
    },

    closePasswordReset() {
      this.set('isShowingModal', false);
    },

  }

});
