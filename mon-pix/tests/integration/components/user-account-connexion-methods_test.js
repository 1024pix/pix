/* eslint ember/no-classic-classes: 0 */

import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { contains } from '../../helpers/contains';
import sinon from 'sinon';
import Service from '@ember/service';
import { clickByLabel } from '../../helpers/click-by-label';

describe('Integration | Component | user-account-connexion-methods', function() {
  setupIntlRenderingTest();

  beforeEach(function() {
    const featureTogglesStub = Service.extend({
      featureToggles: {
        isEmailValidationEnabled: false,
      },
    });
    this.owner.register('service:featureToggles', featureTogglesStub);
  });

  context('when isEmailValidationEnabled feature toggle is enabled', function() {

    it('should display edit button', async function() {
      // given
      const featureTogglesStub = Service.extend({
        featureToggles: {
          isEmailValidationEnabled: true,
        },
      });

      this.owner.register('service:featureToggles', featureTogglesStub);

      const user = {
        firstName: 'John',
        lastName: 'DOE',
        email: 'john.doe@example.net',
        lang: 'fr',
      };
      this.set('user', user);

      // when
      await render(hbs`<UserAccountConnexionMethods @user={{user}} />`);

      // then
      expect(contains(this.intl.t('pages.user-account.connexion-methods.edit-button'))).to.exist;
    });
  });

  it('should display user\'s email and username', async function() {
    // given
    const user = {
      firstName: 'John',
      lastName: 'DOE',
      email: 'john.doe@example.net',
      username: 'john.doe0101',
      lang: 'fr',
    };
    this.set('user', user);

    // when
    await render(hbs`<UserAccountConnexionMethods @user={{this.user}} />`);

    // then
    expect(contains(user.email)).to.exist;
    expect(contains(user.username)).to.exist;
  });

  context('when user does not have a email', function() {

    it('should not display email', async function() {
      // given
      const user = {
        firstName: 'John',
        lastName: 'DOE',
        username: 'john.doe0101',
        lang: 'fr',
      };
      this.set('user', user);

      // when
      await render(hbs`<UserAccountConnexionMethods @user={{user}} />`);

      // then
      expect(contains(this.intl.t('pages.user-account.connexion-methods.email'))).to.not.exist;
    });
  });

  context('when user does not have a username', function() {

    it('should not display username', async function() {
      // given
      const user = {
        firstName: 'John',
        lastName: 'DOE',
        email: 'john.doe@example.net',
        lang: 'fr',
      };
      this.set('user', user);

      // when
      await render(hbs`<UserAccountConnexionMethods @user={{this.user}} />`);

      // then
      expect(contains(this.intl.t('pages.user-account.connexion-methods.username'))).to.not.exist;
    });
  });

  it('should call enableEmailEdition method', async function() {
    // given
    const user = {
      firstName: 'John',
      lastName: 'DOE',
      email: 'john.doe@example.net',
      username: 'john.doe0101',
      lang: 'fr',
    };
    const enableEmailEditionMode = sinon.stub();
    this.set('user', user);
    this.set('enableEmailEditionMode', enableEmailEditionMode);

    await render(hbs `<UserAccountConnexionMethods @user={{this.user}} @enableEmailEditionMode={{this.enableEmailEditionMode}} />`);

    // when
    await clickByLabel(this.intl.t('pages.user-account.connexion-methods.edit-button'));

    // then
    sinon.assert.called(enableEmailEditionMode);
  });
});
