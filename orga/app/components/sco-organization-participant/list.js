import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { CONNECTION_TYPES } from '../../helpers/connection-types';
import { guidFor } from '@ember/object/internals';

export default class ScoList extends Component {
  @service currentUser;
  @service intl;
  @tracked isLoadingDivisions;
  @tracked student = null;
  @tracked isShowingAuthenticationMethodModal = false;

  constructor() {
    super(...arguments);

    this.isLoadingDivisions = true;
    this.currentUser.organization.divisions.then(() => {
      this.isLoadingDivisions = false;
    });
  }

  get divisions() {
    return this.currentUser.organization.divisions.map(({ name }) => ({
      label: name,
      value: name,
    }));
  }

  get connectionTypes() {
    return CONNECTION_TYPES;
  }

  get connectionTypesOptions() {
    return [
      { value: 'none', label: this.intl.t(CONNECTION_TYPES.none) },
      { value: 'email', label: this.intl.t(CONNECTION_TYPES.email) },
      { value: 'identifiant', label: this.intl.t(CONNECTION_TYPES.identifiant) },
      { value: 'mediacentre', label: this.intl.t(CONNECTION_TYPES.mediacentre) },
    ];
  }

  get showCheckbox() {
    return this.currentUser?.organization.type === 'SCO' && this.currentUser?.organization.isManagingStudents;
  }

  get headerId() {
    return guidFor(this) + 'mainCheckbox';
  }

  get hasStudents() {
    return Boolean(this.args.students.length);
  }

  @action
  openAuthenticationMethodModal(student, event) {
    event.stopPropagation();
    this.student = student;
    this.isShowingAuthenticationMethodModal = true;
  }

  @action
  closeAuthenticationMethodModal() {
    this.isShowingAuthenticationMethodModal = false;
  }

  @action
  addStopPropagationOnFunction(toggleStudent, event) {
    event.stopPropagation();
    toggleStudent();
  }
}
