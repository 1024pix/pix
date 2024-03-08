import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const DEFAULT_PAGE_NUMBER = 1;

export default class CampaignParticipationsController extends Controller {
  queryParams = ['pageNumber', 'pageSize'];

  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 10;

  @service notifications;

  @action
  async updateParticipantExternalId(campaignParticipation) {
    try {
      await campaignParticipation.save();
      this.notifications.success("L'id externe du participant été mis à jour avec succès.");
    } catch (e) {
      this.notifications.error("Une erreur est survenue lors de la mise à jour de l'id externe du participant.");
    }
  }
}
