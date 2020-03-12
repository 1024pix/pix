import { computed } from '@ember/object';
import Component from '@ember/component';

export default class CollectiveResultsTab extends Component {

  @computed('campaignCollectiveResults')
  get averageValidatedSkills() {
    return this.get('campaignCollectiveResults.campaignCompetenceCollectiveResults');
  }
}
