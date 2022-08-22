import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ScoList extends Component {
  @service currentUser;

  @tracked student = null;
  @tracked isShowingAuthenticationMethodModal = false;

  loadDivisions = async () => {
    const divisions = await this.currentUser.organization.divisions;
    return divisions.map(({ name }) => {
      return {
        label: name,
        value: name,
      };
    });
  };

  @action
  openAuthenticationMethodModal(student) {
    this.student = student;
    this.isShowingAuthenticationMethodModal = true;
  }

  @action
  closeAuthenticationMethodModal() {
    this.isShowingAuthenticationMethodModal = false;
  }
}
