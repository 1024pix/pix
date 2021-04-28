import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { resolve, reject } from 'rsvp';

import { click, fillIn, find, render, triggerEvent } from '@ember/test-helpers';
import EmberObject from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { contains } from '../../helpers/contains';

const PASSWORD_INPUT_CLASS = '.form-textfield__input';

describe('Integration | Component | update-expired-password-form', function() {

  setupIntlRenderingTest();

  let isSaveMethodCalled;

  const save = () => {
    isSaveMethodCalled = true;
    return resolve();
  };

  const saveWithRejection = () => {
    isSaveMethodCalled = true;
    return reject();
  };

  const unloadRecord = () => {
    return resolve();
  };

  beforeEach(function() {
    isSaveMethodCalled = false;
  });

  it('renders', async function() {
    // when
    await render(hbs`{{update-expired-password-form}}`);

    //then
    expect(find('.update-expired-password-form__container')).to.exist;
  });

  context('successful cases', function() {

    it('should save the new password, when button is clicked', async function() {
      // given
      const resetExpiredPasswordDemand = EmberObject.create({ username: 'toto', password: 'Password123', save, unloadRecord });
      this.set('resetExpiredPasswordDemand', resetExpiredPasswordDemand);
      const newPassword = 'Pix12345!';

      await render(hbs `<UpdateExpiredPasswordForm @resetExpiredPasswordDemand={{this.resetExpiredPasswordDemand}} />`);

      // when
      await fillIn(PASSWORD_INPUT_CLASS, newPassword);
      await triggerEvent(PASSWORD_INPUT_CLASS, 'change');

      await click('.button');

      // then
      expect(isSaveMethodCalled).to.be.true;
      expect(find(PASSWORD_INPUT_CLASS)).to.not.exist;
      expect(find('.password-reset-demand-form__body')).to.exist;
    });

  });

  context('errors cases', function() {

    it('should display an error, when saving fails', async function() {
      // given
      const expectedErrorMessage = this.intl.t('api-error-messages.internal-server-error');

      const resetExpiredPasswordDemand = EmberObject.create({ username: 'toto', password: 'Password123', save: saveWithRejection, unloadRecord });
      this.set('resetExpiredPasswordDemand', resetExpiredPasswordDemand);
      const newPassword = 'Pix12345!';

      await render(hbs `<UpdateExpiredPasswordForm @resetExpiredPasswordDemand={{this.resetExpiredPasswordDemand}} />`);

      // when
      await fillIn(PASSWORD_INPUT_CLASS, newPassword);
      await triggerEvent(PASSWORD_INPUT_CLASS, 'change');

      await click('.button');

      // then
      expect(isSaveMethodCalled).to.be.true;
      expect(contains(expectedErrorMessage)).to.exist;
    });
  });

});
