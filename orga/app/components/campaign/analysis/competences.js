import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';

export default class CompetencesAnalysis extends Component {
  @service intl;

  get campaignCollectiveResultLabel() {
    const competenceCollectiveResultsCount = this.args.campaignCollectiveResult.get(
      'campaignCompetenceCollectiveResults'
    ).length;
    return htmlSafe(
      this.intl.t('pages.campaign-review.table.competences.column.competences', {
        count: competenceCollectiveResultsCount ? competenceCollectiveResultsCount : '-',
      })
    );
  }
}
