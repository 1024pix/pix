import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { optionsCategoryList } from '../../../models/target-profile';
import { tracked } from '@glimmer/tracking';

export default class CreateTargetProfileFromTubeBased extends Component {
  @service router;
  @service notifications;

  @tracked selectedFrameworkIds;

  constructor(...args) {
    super(...args);
    const pixFramework = this.args.frameworks.find((framework) => framework.name === 'Pix');
    if (pixFramework) {
      this.selectedFrameworkIds = [pixFramework.id];
    }
  }

  get frameworkOptions() {
    return this.args.frameworks.map((framework) => {
      return { label: framework.name, value: framework.id };
    });
  }

  get selectedFrameworks() {
    return this.args.frameworks.filter((framework) => this.selectedFrameworkIds.includes(framework.id));
  }

  get categoryOptions() {
    return optionsCategoryList;
  }

  @action
  onCategoryChange(event) {
    this.args.targetProfile.category = event.target.value;
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
  setSelectedFrameworkIds(frameworkIds) {
    this.selectedFrameworkIds = frameworkIds;
  }
}
