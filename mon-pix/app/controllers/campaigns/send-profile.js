import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class SendProfileController extends Controller {

  isLoading = false;
  errorMessage = null;

  @action
  sendProfile() {
    this.set('errorMessage', null);
    this.set('isLoading', true);

    const campaignParticipation = this.get('model.campaignParticipation');
    campaignParticipation.set('isShared', true);

    return campaignParticipation.save()
      .then(() => {
        this.set('isLoading', false);
      })
      .catch(() => {
        campaignParticipation.rollbackAttributes();
        this.set('isLoading', false);
        this.set('errorMessage', true);
      });
  }
}
