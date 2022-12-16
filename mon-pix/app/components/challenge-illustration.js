import Component from '@glimmer/component';
import { trySet, action } from '@ember/object';

export default class ChallengeIllustration extends Component {
  hiddenClass = 'challenge-illustration__loaded-image--hidden';
  displayPlaceholder = true;

  @action
  onImageLoaded() {
    trySet(this, 'displayPlaceholder', false);
    trySet(this, 'hiddenClass', null);
  }
}
