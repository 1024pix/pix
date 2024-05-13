import { action, trySet } from '@ember/object';
import Component from '@glimmer/component';

export default class ChallengeIllustration extends Component {
  hiddenClass = 'challenge-illustration__loaded-image--hidden';
  displayPlaceholder = true;

  get alt() {
    return this.args.alt ?? '';
  }

  @action
  onImageLoaded() {
    trySet(this, 'displayPlaceholder', false);
    trySet(this, 'hiddenClass', null);
  }
}
