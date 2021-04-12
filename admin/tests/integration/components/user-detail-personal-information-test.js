import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import sinon from 'sinon';

import clickByLabel from '../../helpers/extended-ember-test-helpers/click-by-label';

module('Integration | Component | user-detail-personal-information', function(hooks) {

  setupRenderingTest(hooks);

  module('When the administrator click on user details', async function() {

    module('update button', async function() {

      test('should display the update button', async function(assert) {
        // given
        this.set('user', {
          firstName: 'John',
          lastName: 'Harry',
          email: 'john.harry@example.net',
          username: 'john.harry0102',
        });

        // when
        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        // then
        assert.contains('Modifier');
      });
    });

    module('user authentication', async function() {

      test('should display user’s first name', async function(assert) {
        // given
        this.set('user', { firstName: 'John' });

        // when
        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        // then
        assert.dom('.user__first-name').hasText(this.user.firstName);
      });

      test('should display user’s last name', async function(assert) {
        // given
        this.set('user', { lastName: 'Snow' });

        // when
        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        // then
        assert.dom('.user__last-name').hasText(this.user.lastName);
      });

      test('should display user’s email', async function(assert) {
        // given
        this.set('user', { email: 'john.snow@winterfell.got' });

        // when
        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        // then
        assert.dom('.user__email').hasText(this.user.email);
      });

      test('should display user’s username', async function(assert) {
        // given
        this.set('user', { username: 'kingofthenorth' });

        // when
        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        // then
        assert.dom('.user__username').hasText(this.user.username);
      });
    });

    module('terms of service', async function() {

      test('should display "OUI" when user accepted Pix App terms of service', async function(assert) {
        // given
        this.set('user', { cgu: true });

        // when
        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        // then
        assert.dom('.user__cgu').hasText('OUI');
      });

      test('should display "NON" when user not accepted Pix App terms of service', async function(assert) {
        // given
        this.set('user', { cgu: false });

        // when
        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        // then
        assert.dom('.user__cgu').hasText('NON');
      });

      test('should display "OUI" when user accepted Pix Orga terms of service', async function(assert) {
        // given
        this.set('user', { pixOrgaTermsOfServiceAccepted: true });

        // when
        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        // then
        assert.dom('.user__pix-orga-terms-of-service-accepted').hasText('OUI');
      });

      test('should display "NON" when user not accepted Pix Orga terms of service', async function(assert) {
        // given
        this.set('user', { pixOrgaTermsOfServiceAccepted: false });

        // when
        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        // then
        assert.dom('.user__pix-orga-terms-of-service-accepted').hasText('NON');
      });

      test('should display "OUI" when user accepted Pix Certif terms of service', async function(assert) {
        // given
        this.set('user', { pixCertifTermsOfServiceAccepted: true });

        // when
        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        // then
        assert.dom('.user__pix-certif-terms-of-service-accepted').hasText('OUI');
      });

      test('should display "NON" when user not accepted Pix Certif terms of service', async function(assert) {
        // given
        this.set('user', { pixCertifTermsOfServiceAccepted: false });

        // when
        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

        // then
        assert.dom('.user__pix-certif-terms-of-service-accepted').hasText('NON');
      });
    });

    module('schooling registrations', async function() {

      module('When user has no schoolingRegistrations', function() {

        test('should display no result in schooling registrations table', async function(assert) {
          // given
          this.set('user', { schoolingRegistrations: [] });

          // when
          await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

          // then
          assert.contains('Aucun résultat');
        });
      });

      module('When user has schoolingRegistrations', function() {

        test('should display schooling registrations in table', async function(assert) {
          // given
          this.set('user', { schoolingRegistrations: [{ id: 1 }, { id: 2 }] });

          // when
          await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

          // then
          assert.dom('tr[aria-label="Inscription"]').exists({ count: 2 });
        });
      });
    });

    module('authentication methods', function() {

      module('When user has authentication methods', function() {

        test('should display user’s email authentication method', async function(assert) {
          // given
          this.set('user', { hasEmailAuthenticationMethod: true });

          // when
          await render(hbs `<UserDetailPersonalInformation @user={{this.user}}/>`);

          // then
          assert.dom('div[data-test-email] > div > svg').hasClass('user-authentication-method-item__check');
        });

        test('should display user’s username authentication method', async function(assert) {
          // given
          this.set('user', { hasUsernameAuthenticationMethod: true });

          // when
          await render(hbs `<UserDetailPersonalInformation @user={{this.user}}/>`);

          // then
          assert.dom('div[data-test-username] > div > svg').hasClass('user-authentication-method-item__check');
        });

        test('should display user’s Pole Emploi authentication method', async function(assert) {
          // given
          this.set('user', { hasPoleEmploiAuthenticationMethod: true });

          // when
          await render(hbs `<UserDetailPersonalInformation @user={{this.user}}/>`);

          // then
          assert.dom('div[data-test-pole-emploi] > div > svg').hasClass('user-authentication-method-item__check');
        });

        test('should display user’s GAR authentication method', async function(assert) {
          // given
          this.set('user', { hasGARAuthenticationMethod: true });

          // when
          await render(hbs `<UserDetailPersonalInformation @user={{this.user}}/>`);

          // then
          assert.dom('div[data-test-mediacentre] > div > svg').hasClass('user-authentication-method-item__check');
        });

        module('When user has only one authentication method', function() {

          test('it should not display a remove authentication method link', async function(assert) {
            // given
            this.set('user', { hasOnlyOneAuthenticationMethod: true });

            // when
            await render(hbs `<UserDetailPersonalInformation @user={{this.user}}/>`);

            // then
            assert.notOk(find('.user-authentication-method__remove-button'));
          });
        });
      });
    });
  });

  module('When the administrator click to update user details', async function() {

    let user = null;

    hooks.beforeEach(function() {
      user = EmberObject.create({
        lastName: 'Harry',
        firstName: 'John',
        email: 'john.harry@gmail.com',
        username: null,
      });
    });

    test('should display the edit and cancel buttons', async function(assert) {
      // given
      this.set('user', {
        firstName: 'John',
        lastName: 'Harry',
        email: 'john.harry@example.net',
        username: null,
      });

      // when
      await render(hbs`<UserDetailPersonalInformation @user={{this.user}} />`);
      await clickByLabel('Modifier');

      // then
      assert.dom('button[aria-label="Editer"]').exists();
      assert.dom('button[aria-label="Annuler"]').exists();
    });

    test('should display user’s first name and last name in edit mode', async function(assert) {
      // given
      this.set('user', user);

      // when
      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);
      await clickByLabel('Modifier');

      // then
      assert.dom('.user-edit-form__first-name').hasValue(this.user.firstName);
      assert.dom('.user-edit-form__last-name').hasValue(this.user.lastName);
    });

    module('when user has an email only', function() {

      test('should display user’s email in edit mode', async function(assert) {
        // given
        this.set('user', user);

        // when
        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);
        await clickByLabel('Modifier');

        // then
        assert.dom('.user-edit-form__email').hasValue(this.user.email);
      });

      test('should not display username in edit mode', async function(assert) {
        // given
        this.set('user', user);

        // when
        await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);
        await clickByLabel('Modifier');

        // then
        assert.dom('.user-edit-form__username').doesNotExist();
      });

    });

    module('when user has a username only', function() {

      test('should display user’s username in edit mode', async function(assert) {
        // given
        const user = EmberObject.create({
          lastName: 'Harry',
          firstName: 'John',
          email: null,
          username: 'user.name1212',
        });
        this.set('user', user);

        // when
        await render(hbs `<UserDetailPersonalInformation @user={{this.user}} />`);
        await clickByLabel('Modifier');

        // then
        assert.dom('.user-edit-form__username').hasValue(this.user.username);
      });

      test('should not display email', async function(assert) {
        // given
        const user = EmberObject.create({
          lastName: 'Harry',
          firstName: 'John',
          email: null,
          username: 'user.name1212',
        });
        this.set('user', user);

        // when
        await render(hbs `<UserDetailPersonalInformation @user={{this.user}} />`);
        await clickByLabel('Modifier');

        // then
        assert.dom('.user-edit-form__email').doesNotExist();
      });
    });

    test('should not display user’s terms of service', async function(assert) {
      // given
      this.set('user', user);

      // when
      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);
      await clickByLabel('Modifier');

      // then
      assert.dom('.user__cgu').doesNotExist();
      assert.dom('.user__pix-orga-terms-of-service-accepted').doesNotExist();
      assert.dom('.user__pix-certif-terms-of-service-accepted').doesNotExist();
    });
  });

  module('when the administrator click on anonymize button', async function() {

    let user = null;

    hooks.beforeEach(function() {
      user = EmberObject.create({
        lastName: 'Harry',
        firstName: 'John',
        email: 'john.harry@gmail.com',
        username: null,
      });
    });

    test('should show modal', async function(assert) {
      // given
      this.set('user', user);
      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      // when
      await clickByLabel('Anonymiser cet utilisateur');

      // then
      assert.dom('.modal-dialog').exists();
      assert.contains('Êtes-vous sûr de vouloir anonymiser cet utilisateur ? Ceci n’est pas réversible.');
    });

    test('should close the modal to cancel action', async function(assert) {
      // given
      this.set('user', user);
      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);
      await clickByLabel('Anonymiser cet utilisateur');

      // when
      await click('.modal-dialog .btn-secondary');

      // then
      assert.dom('.modal-dialog').doesNotExist();
    });
  });

  module('when the administrator click on dissociate button', async function() {

    test('should display dissociate confirm modal', async function(assert) {
      // given
      const destroyRecordStub = sinon.stub();
      const schoolingRegistration = EmberObject.create({
        id: 1,
        firstName: 'John',
        lastName: 'Harry',
        destroyRecord: destroyRecordStub,
      });
      const user = EmberObject.create({
        firstName: 'John',
        lastName: 'Harry',
        username: 'user.name0112',
        isAuthenticatedFromGAR: false,
        schoolingRegistrations: [schoolingRegistration],
      });
      this.set('user', user);

      await render(hbs `<UserDetailPersonalInformation @user={{this.user}} />`);

      // when
      await click('button[data-test-dissociate-schooling-registration]');

      // then
      assert.contains('Confirmer la dissociation');
    });

    test('should close the modal on click on cancel button', async function(assert) {
      // given
      const destroyRecordStub = sinon.stub();
      const schoolingRegistration = EmberObject.create({
        id: 1,
        firstName: 'John',
        lastName: 'Harry',
        destroyRecord: destroyRecordStub,
      });
      const user = EmberObject.create({
        firstName: 'John',
        lastName: 'Harry',
        username: 'user.name0112',
        isAuthenticatedFromGAR: false,
        schoolingRegistrations: [schoolingRegistration],
      });
      this.set('user', user);

      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);
      await click('button[data-test-dissociate-schooling-registration]');

      // when
      await clickByLabel('Annuler');

      // then
      assert.notContains('Confirmer la dissociation');
      assert.notOk(destroyRecordStub.called);
    });

    test('should call destroyRecord on click on confirm button', async function(assert) {
      // given
      const destroyRecordStub = sinon.stub();
      const schoolingRegistration = EmberObject.create({
        id: 1,
        firstName: 'John',
        lastName: 'Harry',
        destroyRecord: destroyRecordStub,
      });
      const user = EmberObject.create({
        firstName: 'John',
        lastName: 'Harry',
        username: 'user.name0112',
        isAuthenticatedFromGAR: false,
        schoolingRegistrations: [schoolingRegistration],
      });
      this.set('user', user);

      await render(hbs `<UserDetailPersonalInformation @user={{this.user}} />`);
      await click('button[data-test-dissociate-schooling-registration]');

      // when
      await clickByLabel('Oui, je dissocie');

      // then
      assert.ok(destroyRecordStub.called);
    });
  });

  module('when the administrator click on remove authentication method button', function() {

    test('should display remove authentication methode confirm modal', async function(assert) {
      // given
      const user = EmberObject.create({
        lastName: 'Harry',
        firstName: 'John',
        email: 'john.harry@gmail.com',
        username: 'john.harry.1010',
        hasEmailAuthenticationMethod: true,
      });

      this.set('user', user);
      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);

      // when
      await click('button[data-test-remove-email]');

      // then
      assert.contains('Confirmer la suppression');
    });

    // eslint-disable-next-line mocha/no-identical-title
    test('should close the modal on click on cancel button', async function(assert) {
      // given
      const user = EmberObject.create({
        lastName: 'Harry',
        firstName: 'John',
        email: 'john.harry@gmail.com',
        username: 'john.harry.1010',
        hasEmailAuthenticationMethod: true,
      });

      this.set('user', user);
      await render(hbs`<UserDetailPersonalInformation @user={{this.user}}/>`);
      await click('button[data-test-remove-email]');

      // when
      await click('.modal-dialog .btn-secondary');

      // then
      assert.dom('.modal-dialog').doesNotExist();
    });

    module('when the administrator confirm the removal', function() {

      test('should call removeAuthenticationMethod parameter', async function(assert) {
        // given
        const user = EmberObject.create({
          lastName: 'Harry',
          firstName: 'John',
          email: 'john.harry@gmail.com',
          username: 'john.harry.1010',
          hasEmailAuthenticationMethod: true,
        });
        this.set('user', user);
        const removeAuthenticationMethodStub = sinon.stub();
        this.set('removeAuthenticationMethod', removeAuthenticationMethodStub);

        await render(hbs`<UserDetailPersonalInformation @user={{this.user}} @removeAuthenticationMethod={{this.removeAuthenticationMethod}}/>`);
        await click('button[data-test-remove-email]');

        // when
        await click('.modal-dialog .btn-primary');

        // then
        assert.ok(removeAuthenticationMethodStub.called);
        assert.dom('.modal-dialog').doesNotExist();
      });

      test('should display an error message when the administrator try to remove the last authentication method', async function(assert) {
        // given
        const user = EmberObject.create({
          lastName: 'Harry',
          firstName: 'John',
          email: 'john.harry@gmail.com',
          hasEmailAuthenticationMethod: true,
        });
        this.set('user', user);
        const removeAuthenticationMethodStub = sinon.stub();
        this.set('removeAuthenticationMethod', removeAuthenticationMethodStub);

        const notificationErrorStub = sinon.stub();
        class NotificationsStub extends Service {
          error = notificationErrorStub;
        }
        this.owner.register('service:notifications', NotificationsStub);

        removeAuthenticationMethodStub.rejects({ errors: [{ status: '403' }] });

        await render(hbs`<UserDetailPersonalInformation @user={{this.user}} @removeAuthenticationMethod={{this.removeAuthenticationMethod}}/>`);
        await click('button[data-test-remove-email]');

        // when
        await click('.modal-dialog .btn-primary');

        // then
        sinon.assert.calledWith(notificationErrorStub, 'Vous ne pouvez pas supprimer la dernière méthode de connexion de cet utilisateur');
        assert.dom('.modal-dialog').doesNotExist();
      });
    });
  });
});
