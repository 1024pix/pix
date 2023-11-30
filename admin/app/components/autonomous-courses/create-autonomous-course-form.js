import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CreateAutonomousCourseForm extends Component {
  @tracked submitting = false;
  constructor() {
    super(...arguments);
  }

  @action
  updateAutonomousCourseValue(key, event) {
    this.args.autonomousCourse[key] = event.target.value;
  }

  @action
  selectTargetProfile(targetProfileId) {
    this.args.autonomousCourse.targetProfileId = targetProfileId;
  }

  get targetProfileListOptions() {
    const options = this.args.targetProfiles.map((targetProfile) => ({
      value: targetProfile.id,
      label: targetProfile.name,
      category: targetProfile.category,
      order: 'OTHER' === targetProfile.category ? 1 : 0,
    }));

    options.sort((targetProfileA, targetProfileB) => {
      if (targetProfileA.order !== targetProfileB.order) {
        return targetProfileA.order - targetProfileB.order;
      }
      if (targetProfileA.category !== targetProfileB.category) {
        return targetProfileA.category.localeCompare(targetProfileB.category);
      }
      return targetProfileA.label.localeCompare(targetProfileB.label);
    });

    return options;
  }

  @action
  async onSubmit(event) {
    const autonomousCourse = {
      internalTitle: this.args.autonomousCourse.internalTitle,
      publicTitle: this.args.autonomousCourse.publicTitle,
      targetProfileId: this.args.autonomousCourse.targetProfileId,
      customLandingPageText: this.args.autonomousCourse.customLandingPageText,
    };
    try {
      this.submitting = true;
      await this.args.onSubmit(event, autonomousCourse);
    } finally {
      this.submitting = false;
    }
  }
}
