import classic from 'ember-classic-decorator';
import Route from '@ember/routing/route';

@classic
export default class FillInCampaignCodeRoute extends Route {
  deactivate() {
    this.controller.set('campaignCode', null);
  }
}
