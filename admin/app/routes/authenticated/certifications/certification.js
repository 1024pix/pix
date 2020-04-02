import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class CertificationRoute extends Route {  
  @service notifications

  @action
  error(anError) {
    this.notifications.error(anError);
    this.transitionTo('authenticated.certifications');
  }
}
