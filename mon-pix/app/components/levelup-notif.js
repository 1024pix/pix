import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class LevelupNotif extends Component {
  @tracked closeLevelup = false;

  resetLevelUp() {
    this.closeLevelup = false;
  }

  @action
  close() {
    this.closeLevelup = true;
  }
}
