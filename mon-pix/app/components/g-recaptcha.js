/* eslint ember/no-classic-components: 0 */
/* eslint ember/no-component-lifecycle-hooks: 0 */
/* eslint ember/require-tagless-components: 0 */

import { classNames } from '@ember-decorators/component';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

@classic
@classNames('gg-recaptcha')
export default class GRecaptcha extends Component {
  @service googleRecaptcha;

  validateRecaptcha = null; // action
  resetRecaptcha = null; // action
  tokenHasBeenUsed = null;
  validation = null;

  didInsertElement() {
    super.didInsertElement(...arguments);
    const component = this;
    this.googleRecaptcha.loadScript().then(function() {
      component.renderRecaptcha();
    });
  }

  didUpdateAttrs() {
    super.didUpdateAttrs(...arguments);
    if (this.tokenHasBeenUsed) {
      this.googleRecaptcha.reset();
    }
  }

  renderRecaptcha() {
    const callback = this.validateCallback.bind(this);
    const expiredCallback = this.expiredCallback.bind(this);
    this.googleRecaptcha.render('g-recaptcha-container', callback, expiredCallback);
  }

  validateCallback(recaptchaResponse) {
    this.set('recaptchaToken', recaptchaResponse);
    this.set('tokenHasBeenUsed', false);
  }

  expiredCallback() {
    this.set('recaptchaToken', null);
    this.set('tokenHasBeenUsed', false);
  }
}
