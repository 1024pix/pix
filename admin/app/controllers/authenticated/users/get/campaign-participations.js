import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class UserCampaignParticipationsController extends Controller {
  @service notifications;

  @action
  async removeParticipation(campaignParticipation) {
    try {
      await campaignParticipation.deleteRecord();
      await campaignParticipation.save();
      await this.model.hasMany('participations').reload();
      this.notifications.success('La participation du prescrit a été supprimée avec succès.');
    } catch (e) {
      this.notifications.error('Une erreur est survenue lors de la suppression de la participation.');
    }
  }
}
