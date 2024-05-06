import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { optionsCategoryList } from '../../models/target-profile';

export default class CreateTargetProfileForm extends Component {
  @service notifications;
  @service router;

  @tracked submitting = false;
  selectedTubes = [];

  constructor() {
    super(...arguments);
    this.optionsList = optionsCategoryList;
  }

  @action
  updateTubes(tubesWithLevel) {
    this.selectedTubes = tubesWithLevel.map(({ id, level }) => ({
      id,
      level,
    }));
  }

  @action
  handleInputValue(key, event) {
    this.args.targetProfile[key] = event.target.value;
  }

  @action
  handleSelectChange(key, value) {
    this.args.targetProfile[key] = value;
  }

  @action
  handleCheckboxChange(key, event) {
    this.args.targetProfile[key] = event.target.checked;
  }

  @action
  async onSubmit(event) {
    event.preventDefault();

    try {
      this.submitting = true;
      await this.args.onSubmit(event, this.selectedTubes);
    } finally {
      this.submitting = false;
    }
  }
}
