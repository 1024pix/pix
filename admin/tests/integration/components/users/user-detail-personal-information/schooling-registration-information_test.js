import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import clickByLabel from '../../../../helpers/extended-ember-test-helpers/click-by-label';

module(
  'Integration | Component | users | user-detail-personal-information/schooling-registration-information',
  function (hooks) {
    setupRenderingTest(hooks);

    test('should display schooling registration’s info', async function (assert) {
      // given
      this.toggleDisplayDissociateModal = sinon.spy();
      this.set('user', {
        schoolingRegistrations: [{ firstName: 'John', lastName: 'Doe', birthdate: new Date('2020-10-02') }],
      });

      // when
      await render(
        hbs`<Users::UserDetailPersonalInformation::SchoolingRegistrationInformation @user={{this.user}} @toggleDisplayDissociateModal={{this.toggleDisplayDissociateModal}} />`
      );

      // then
      assert.contains('John');
      assert.contains('Doe');
      assert.contains('02/10/2020');
    });

    test('should display schooling registration’s division', async function (assert) {
      // given
      this.toggleDisplayDissociateModal = sinon.spy();
      this.set('user', {
        schoolingRegistrations: [{ division: '3A' }],
      });

      // when
      await render(
        hbs`<Users::UserDetailPersonalInformation::SchoolingRegistrationInformation @user={{this.user}} @toggleDisplayDissociateModal={{this.toggleDisplayDissociateModal}} />`
      );

      // then
      assert.contains('3A');
    });

    test('should display schooling registration’s group', async function (assert) {
      // given
      this.toggleDisplayDissociateModal = sinon.spy();
      this.set('user', {
        schoolingRegistrations: [{ division: 'groupe 2' }],
      });

      // when
      await render(
        hbs`<Users::UserDetailPersonalInformation::SchoolingRegistrationInformation @user={{this.user}} @toggleDisplayDissociateModal={{this.toggleDisplayDissociateModal}} />`
      );

      // then
      assert.contains('groupe 2');
    });

    test('should display schooling registration’s organization info', async function (assert) {
      // given
      this.toggleDisplayDissociateModal = sinon.spy();
      this.set('user', {
        schoolingRegistrations: [{ organizationId: 42, organizationName: 'Dragon & Co' }],
      });

      // when
      await render(
        hbs`<Users::UserDetailPersonalInformation::SchoolingRegistrationInformation @user={{this.user}} @toggleDisplayDissociateModal={{this.toggleDisplayDissociateModal}} />`
      );

      // then
      assert.contains('Dragon & Co');
      assert.dom('[href="/organizations/42"]').exists();
    });

    test('should display schooling registration’s import date and re-import date', async function (assert) {
      // given
      this.toggleDisplayDissociateModal = sinon.spy();
      this.set('user', {
        schoolingRegistrations: [{ createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-02') }],
      });

      // when
      await render(
        hbs`<Users::UserDetailPersonalInformation::SchoolingRegistrationInformation @user={{this.user}} @toggleDisplayDissociateModal={{this.toggleDisplayDissociateModal}} />`
      );

      // then
      assert.contains('01/01/2020');
      assert.contains('02/01/2020');
    });

    test('should display schooling registration as active', async function (assert) {
      // given
      this.toggleDisplayDissociateModal = sinon.spy();
      this.set('user', {
        schoolingRegistrations: [{ isDisabled: false }],
      });

      // when
      await render(
        hbs`<Users::UserDetailPersonalInformation::SchoolingRegistrationInformation @user={{this.user}} @toggleDisplayDissociateModal={{this.toggleDisplayDissociateModal}} />`
      );

      // then
      assert.dom('[aria-label="Inscription activée"]').exists();
    });

    test('should display schooling registration as inactive', async function (assert) {
      // given
      this.toggleDisplayDissociateModal = sinon.spy();
      this.set('user', {
        schoolingRegistrations: [{ isDisabled: true }],
      });

      // when
      await render(
        hbs`<Users::UserDetailPersonalInformation::SchoolingRegistrationInformation @user={{this.user}} @toggleDisplayDissociateModal={{this.toggleDisplayDissociateModal}} />`
      );

      // then
      assert.dom('[aria-label="Inscription désactivée"]').exists();
    });

    test('should be able to dissociate user if it is enabled', async function (assert) {
      // given
      const toggleDisplayDissociateModal = sinon.stub();
      this.set('toggleDisplayDissociateModal', toggleDisplayDissociateModal);
      this.set('user', {
        schoolingRegistrations: [{ firstName: 'some name', canBeDissociated: true }],
      });

      // when
      await render(
        hbs`<Users::UserDetailPersonalInformation::SchoolingRegistrationInformation @user={{this.user}} @toggleDisplayDissociateModal={{this.toggleDisplayDissociateModal}} />`
      );
      await clickByLabel('Dissocier');

      // then
      sinon.assert.called(this.toggleDisplayDissociateModal);
      assert.ok(true);
    });

    test('should not be able to dissociate user if it is disabled', async function (assert) {
      // given
      const toggleDisplayDissociateModal = sinon.stub();
      this.set('toggleDisplayDissociateModal', toggleDisplayDissociateModal);
      this.set('user', {
        schoolingRegistrations: [{ firstName: 'some name', canBeDissociated: false }],
      });

      // when
      await render(
        hbs`<Users::UserDetailPersonalInformation::SchoolingRegistrationInformation @user={{this.user}} @toggleDisplayDissociateModal={{this.toggleDisplayDissociateModal}} />`
      );

      // then
      assert.notContains('Dissocier');
    });
  }
);
