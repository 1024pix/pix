import Component from '@ember/component';
import { classNames } from '@ember-decorators/component';
import { trySet, action } from '@ember/object';
import classic from 'ember-classic-decorator';

@classic
@classNames('challenge-illustration')
export default class ChallengeIllustration extends Component {
  src = null;
  alt = null;
  hiddenClass = 'challenge-illustration__loaded-image--hidden';
  displayPlaceholder = true;

  @action
  onImageLoaded() {
    trySet(this, 'displayPlaceholder', false);
    trySet(this, 'hiddenClass', null);
  }
}
