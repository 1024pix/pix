import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { optionsCategoryList } from '../../models/target-profile';
import { tracked } from '@glimmer/tracking';

export default class UpdateTargetProfile extends Component {
  @service router;
  @service notifications;

  @tracked selectedFrameworkIds = this.args.selectedFrameworkIds;

  constructor() {
    super(...arguments);
    this.optionsList = optionsCategoryList;
    const pixFramework = this.args.frameworkOptions.find((framework) => framework.label === 'Pix');
    this.selectedFrameworkIds.push(pixFramework.value);
    this.router.replaceWith({ queryParams: { selectedFrameworkIds: [pixFramework.value] } });
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
  async selectFramework(frameworks) {
    this.selectedFrameworkIds = frameworks;
    this.router.replaceWith({ queryParams: { selectedFrameworkIds: frameworks } });
  }
}
