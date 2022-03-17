import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { optionsCategoryList } from '../../models/target-profile';

export default class UpdateTargetProfile extends Component {
  @service notifications;

  constructor() {
    super(...arguments);
    this.optionsList = optionsCategoryList;
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
}
