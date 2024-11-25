import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
export default class Ended extends Component {
  @service router;
  @service metrics;

  get hasStages() {
    return this.args.model.totalStagesCount > 0;
  }

  get count() {
    return this.args.model.validatedStagesCount - 1;
  }

  get total() {
    return this.args.model.totalStagesCount - 1;
  }

  @action
  onClick() {
    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Campaign participation',
      'pix-event-action': `Voir le détail d'une participation partagée`,
      'pix-event-name': `Voir le détail d'une participation partagée`,
    });
    this.router.transitionTo('campaigns.entry-point', this.args.model.campaignCode);
  }
}
