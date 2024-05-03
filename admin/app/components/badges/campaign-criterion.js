import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class CampaignCriterion extends Component {
  @service notifications;

  @tracked isEditModalVisible = false;
  @tracked thresholdInputValue = this.previousTreshold;

  get previousTreshold() {
    return this.args.criterion.threshold;
  }

  @action
  toggleEditModal() {
    this.isEditModalVisible = !this.isEditModalVisible;
  }

  @action
  handleThresholdChange(event) {
    this.thresholdInputValue = Number(event.target.value);
  }

  @action
  async updateThreshold() {
    const criterion = this.args.criterion;
    criterion.threshold = this.thresholdInputValue;

    try {
      await criterion.save();
      this.notifications.success("Seuil d'obtention du critère modifié avec succès.");
      this.toggleEditModal();
    } catch (responseError) {
      responseError?.errors?.forEach((error) => {
        if (error?.detail) {
          this.notifications.error(error.detail);
        } else {
          this.notifications.error("Problème lors de la modification du seuil d'obtention du critère.");
        }
      });
    }
  }
}
