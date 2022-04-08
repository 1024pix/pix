import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { clickByName, render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

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
      const screen = await render(
        hbs`<Users::UserDetailPersonalInformation::SchoolingRegistrationInformation @user={{this.user}} @toggleDisplayDissociateModal={{this.toggleDisplayDissociateModal}} />`
      );

      // then
      assert.dom(screen.getByText('John')).exists();
      assert.dom(screen.getByText('Doe')).exists();
      assert.dom(screen.getByText('02/10/2020')).exists();
    });

    test('should display schooling registration’s division', async function (assert) {
      // given
      this.toggleDisplayDissociateModal = sinon.spy();
      this.set('user', {
        schoolingRegistrations: [{ division: '3A' }],
      });

      // when
      const screen = await render(
        hbs`<Users::UserDetailPersonalInformation::SchoolingRegistrationInformation @user={{this.user}} @toggleDisplayDissociateModal={{this.toggleDisplayDissociateModal}} />`
      );

      // then
      assert.dom(screen.getByText('3A')).exists();
    });

    test('should display schooling registration’s group', async function (assert) {
      // given
      this.toggleDisplayDissociateModal = sinon.spy();
      this.set('user', {
        schoolingRegistrations: [{ division: 'groupe 2' }],
      });

      // when
      const screen = await render(
        hbs`<Users::UserDetailPersonalInformation::SchoolingRegistrationInformation @user={{this.user}} @toggleDisplayDissociateModal={{this.toggleDisplayDissociateModal}} />`
      );

      // then
      assert.dom(screen.getByText('groupe 2')).exists();
    });

    test('should display schooling registration’s organization info', async function (assert) {
      // given
      this.toggleDisplayDissociateModal = sinon.spy();
      this.set('user', {
        schoolingRegistrations: [{ organizationId: 42, organizationName: 'Dragon & Co' }],
      });

      // when
      const screen = await render(
        hbs`<Users::UserDetailPersonalInformation::SchoolingRegistrationInformation @user={{this.user}} @toggleDisplayDissociateModal={{this.toggleDisplayDissociateModal}} />`
      );

      // then
      assert.dom(screen.getByText('Dragon & Co')).exists();
      assert.dom('[href="/organizations/42"]').exists();
    });

    test('should display schooling registration’s import date and re-import date', async function (assert) {
      // given
      this.toggleDisplayDissociateModal = sinon.spy();
      this.set('user', {
        schoolingRegistrations: [{ createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-02') }],
      });

      // when
      const screen = await render(
        hbs`<Users::UserDetailPersonalInformation::SchoolingRegistrationInformation @user={{this.user}} @toggleDisplayDissociateModal={{this.toggleDisplayDissociateModal}} />`
      );

      // then
      assert.dom(screen.getByText('01/01/2020')).exists();
      assert.dom(screen.getByText('02/01/2020')).exists();
    });

    test('should display schooling registration as active', async function (assert) {
      // given
      this.toggleDisplayDissociateModal = sinon.spy();
      this.set('user', {
        schoolingRegistrations: [{ isDisabled: false }],
      });

      // when
      const screen = await render(
        hbs`<Users::UserDetailPersonalInformation::SchoolingRegistrationInformation @user={{this.user}} @toggleDisplayDissociateModal={{this.toggleDisplayDissociateModal}} />`
      );

      // then
      assert.dom(screen.getByLabelText('Inscription activée')).exists();
    });

    test('should display schooling registration as inactive', async function (assert) {
      // given
      this.toggleDisplayDissociateModal = sinon.spy();
      this.set('user', {
        schoolingRegistrations: [{ isDisabled: true }],
      });

      // when
      const screen = await render(
        hbs`<Users::UserDetailPersonalInformation::SchoolingRegistrationInformation @user={{this.user}} @toggleDisplayDissociateModal={{this.toggleDisplayDissociateModal}} />`
      );

      // then
      assert.dom(screen.getByLabelText('Inscription désactivée')).exists();
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
      await clickByName('Dissocier');

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
      const screen = await render(
        hbs`<Users::UserDetailPersonalInformation::SchoolingRegistrationInformation @user={{this.user}} @toggleDisplayDissociateModal={{this.toggleDisplayDissociateModal}} />`
      );

      // then
      assert.dom(screen.queryByText('Dissocier')).doesNotExist();
    });
  }
);
