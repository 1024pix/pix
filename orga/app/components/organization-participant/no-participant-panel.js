import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class List extends Component {
  @service currentUser;

  get isNotManagingStudents() {
    return !this.currentUser.isSCOManagingStudents && !this.currentUser.isSUPManagingStudents;
  }
}
