import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Criteria extends Component {
  @service store;
  @tracked hasCampaignCriterion = false;
  @tracked hasCappedTubesCriteria = false;

  @action
  onHasCampaignCriterionChange(e) {
    this.hasCampaignCriterion = e.target.checked;
    if (!this.hasCampaignCriterion) {
      this.args.badge.campaignThreshold = null;
    }
  }

  @action
  onHasCappedTubesCriteriaChange(e) {
    this.hasCappedTubesCriteria = e.target.checked;
    if (this.hasCappedTubesCriteria) {
      this.args.badge.cappedTubesCriteria.pushObject({});
    } else {
      this.args.badge.cappedTubesCriteria.clear();
    }
  }

  @action
  onCampaignThresholdChange(e) {
    this.args.badge.campaignThreshold = e.target.value;
  }

  @action
  onCappedTubesThresholdChange(criterion, e) {
    criterion.threshold = e.target.value;
  }

  @action
  onCappedTubesNameChange(criterion, e) {
    criterion.name = e.target.value;
  }

  @action
  onCappedTubesSelectionChange(criterion, selection) {
    criterion.cappedTubes = selection;
  }

  @action
  addCappedTubeCriterion() {
    this.args.badge.cappedTubesCriteria.pushObject({});
  }

  @action
  removeCappedTubeCriterion(index) {
    this.args.badge.cappedTubesCriteria.removeAt(index);
  }
}
