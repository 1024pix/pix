import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Information extends Component {
  @tracked isEditMode = false;

  @action
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }
}
