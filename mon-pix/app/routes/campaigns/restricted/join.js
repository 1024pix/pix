import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { isEmpty } from '@ember/utils';
import ENV from 'mon-pix/config/environment';
import get from 'lodash/get';

const AUTHENTICATED_SOURCE_FROM_MEDIACENTRE = ENV.APP.AUTHENTICATED_SOURCE_FROM_MEDIACENTRE;

export default class JoinRoute extends Route {
  @service currentUser;
  @service session;

  model() {
    return this.modelFor('campaigns');
  }

  async afterModel(campaign) {
    if (!this.session.get('data.externalUser')) {
      let schoolingRegistration = await this.store.queryRecord('schooling-registration-user-association', { userId: this.currentUser.user.id, campaignCode: campaign.code });

      if (isEmpty(schoolingRegistration) && campaign.organizationType === 'SCO') {
        try {
          schoolingRegistration = await this.store.createRecord('schooling-registration-user-association', { userId: this.currentUser.user.id, campaignCode: campaign.code })
            .save({ adapterOptions: { tryReconciliation: true } });
        } catch (error) {
          if (get(error, 'errors[0].status') !== '422') {
            throw error;
          }
        }
      }

      if (!isEmpty(schoolingRegistration)) {
        this.replaceWith('campaigns.start-or-resume', campaign.code, {
          queryParams: { associationDone: true },
        });
      }
    }
  }

  setupController(controller) {
    super.setupController(...arguments);
    if (this.session.data.authenticated.source === AUTHENTICATED_SOURCE_FROM_MEDIACENTRE) {
      controller.set('firstName', this.currentUser.user.firstName);
      controller.set('lastName', this.currentUser.user.lastName);
    }
  }
}
