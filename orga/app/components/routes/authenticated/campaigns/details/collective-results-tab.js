import { action } from '@ember/object';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default class CollectiveResultsTab extends Component {

  @computed('view')
  get displayCompetence() {
    return !this.view || this.view === 'competence';
  }

  @action
  changeView() {
    if (this.view === 'tube') {
      return this.set('view', 'competence');
    }
    return this.set('view', 'tube');
  }
}
