import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default class ListItems extends Component {

  @service currentUser;

  student = null;
  isShowingModal = false;

  @action
  openPasswordReset(student) {
    this.set('student', student);
    this.set('isShowingModal', true);
  }

  @action
  closePasswordReset() {
    this.set('isShowingModal', false);
  }
}
