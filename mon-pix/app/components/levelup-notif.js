import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import Component from '@glimmer/component';

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
