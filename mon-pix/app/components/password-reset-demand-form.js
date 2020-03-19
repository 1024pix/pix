import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';
import ENV from 'mon-pix/config/environment';

@classic
export default class PasswordResetDemandForm extends Component {
  @service store;

  email = '';
  _displayErrorMessage = false;
  _displaySuccessMessage = false;
  urlHome = ENV.APP.HOME_HOST;

  @action
  savePasswordResetDemand() {
    this.set('_displayErrorMessage', false);
    this.set('_displaySuccessMessage', false);

    const trimedEmail = this.email ? this.email.trim() : '';

    this.store.createRecord('password-reset-demand', { email: trimedEmail })
      .save()
      .then(() => {
        this.set('_displaySuccessMessage', true);
      })
      .catch(() => {
        this.set('_displayErrorMessage', true);
      });
  }
}
