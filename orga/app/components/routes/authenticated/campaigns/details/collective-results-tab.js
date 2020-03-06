import { computed } from '@ember/object';
import Component from '@ember/component';

export default class CollectiveResultsTab extends Component {

  @computed('view')
  get displayCompetence() {
    return !this.view || this.view === 'competence';
  }
}
