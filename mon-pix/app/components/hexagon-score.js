import { action, computed } from '@ember/object';
import { isNone } from '@ember/response-objects';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

@classic
export default class HexagonScore extends Component {
  displayHelp = 'hexagon-score__information--hidden';

  @computed('pixScore')
  get score() {
    return (isNone(this.pixScore) || this.pixScore === 0) ? '–' : Math.floor(this.pixScore);
  }

  @action
  hideHelp() {
    this.set('displayHelp', 'hexagon-score__information--hidden');
  }

  @action
  showHelp() {
    this.set('displayHelp', 'hexagon-score__information--visible');
  }
}
