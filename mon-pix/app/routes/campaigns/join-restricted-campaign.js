import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import { isEmpty } from '@ember/utils';

@classic
export default class JoinRestrictedCampaignRoute extends Route.extend(SecuredRouteMixin) {
  @service currentUser;
  @service session;

  _isReady = false;

  async beforeModel(transition) {
    this.set('_isReady', false);
    const campaignCode = transition.to.params.campaign_code;
    const student = await this.store.queryRecord('student-user-association', { userId: this.currentUser.user.id, campaignCode });

    if (!isEmpty(student)) {
      this.replaceWith('campaigns.start-or-resume', campaignCode, {
        queryParams: { associationDone: true }
      });
    }
  }

  model(params) {
    return params.campaign_code;
  }

  afterModel() {
    this.set('_isReady', true);
  }

  setupController(controller) {
    super.setupController(...arguments);
    if (this.session.data.authenticated.source === 'external') {
      controller.set('firstName', this.currentUser.user.firstName);
      controller.set('lastName', this.currentUser.user.lastName);
    }
  }

  @action
  loading() {
    return this._isReady;
  }
}
