import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';

export default class Tab extends Component {
  @service intl;

  get campaignCollectiveResultLabel() {
    return htmlSafe(this.intl.t('pages.campaign-collective-results.table.column.competences',
      { count: this.args.sharedParticipationsCount ? this.args.campaignCollectiveResult.get('campaignCompetenceCollectiveResults').length : '-' },
    ));
  }
}
