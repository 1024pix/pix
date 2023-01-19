import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { optionsCategoryList } from '../../models/target-profile';
import { tracked } from '@glimmer/tracking';

export default class CreateTargetProfileForm extends Component {
  @service notifications;

  @tracked submitting = false;
  selectedTubes = [];

  constructor() {
    super(...arguments);
    this.optionsList = optionsCategoryList;
  }

  @action
  onCategoryChange(value) {
    this.args.targetProfile.category = value;
  }

  @action
  updateTargetProfileName(event) {
    this.args.targetProfile.name = event.target.value;
  }

  @action
  updateOwnerOrganizationId(event) {
    this.args.targetProfile.ownerOrganizationId = event.target.value;
  }

  @action
  updateImageUrl(event) {
    this.args.targetProfile.imageUrl = event.target.value;
  }

  @action
  updateTubes(tubesWithLevel) {
    this.selectedTubes = tubesWithLevel.map(({ id, level }) => ({
      id,
      level,
    }));
  }

  @action
  async onSubmit(event) {
    try {
      this.submitting = true;
      await this.args.onSubmit(event, this.selectedTubes);
    } finally {
      this.submitting = false;
    }
  }

  // on a une explication rationnelle
  noop() {}
}
