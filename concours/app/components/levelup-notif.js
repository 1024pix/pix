import { action } from '@ember/object';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

@classic
export default class LevelupNotif extends Component {
  closeLevelup = false;

  didUpdateAttrs() {
    super.didUpdateAttrs(...arguments);
    this.set('closeLevelup', false);
  }

  @action
  close() {
    this.set('closeLevelup', true);
  }
}
