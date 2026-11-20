import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import UserDetailPersonalInformation from 'pix-admin/components/users/user-detail-personal-information';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | users | user-detail-personal-information', function (hooks) {
  setupIntlRenderingTest(hooks);

  class AccessControlStub extends Service {
    hasAccessToUsersActionsScope = true;
    hasAccessToDeleteOrganizationLearnerScope = true;
  }

  module('when the admin member click on dissociate button', function () {
    test('should display dissociate confirm modal', async function (assert) {
      // given
      const destroyRecordStub = sinon.stub();
      const organizationLearner = EmberObject.create({
        id: 1,
        firstName: 'John',
        lastName: 'Harry',
        canBeDissociated: true,
        destroyRecord: destroyRecordStub,
      });
      const user = EmberObject.create({
        firstName: 'John',
        lastName: 'Harry',
        username: 'user.name0112',
        isAuthenticatedFromGAR: false,
        organizationLearners: [organizationLearner],
        authenticationMethods: [{ identityProvider: 'PIX' }],
      });
      this.owner.register('service:access-control', AccessControlStub);

      const screen = await render(<template><UserDetailPersonalInformation @user={{user}} /></template>);

      // when
      await click(screen.getByRole('button', { name: 'Dissocier' }));

      await screen.findByRole('dialog');

      // then
      assert.dom(screen.getByText('Confirmer la dissociation')).exists();
    });

    test('should close the modal on click on cancel button', async function (assert) {
      // given
      const destroyRecordStub = sinon.stub();
      const organizationLearner = EmberObject.create({
        id: 1,
        firstName: 'John',
        lastName: 'Harry',
        canBeDissociated: true,
        destroyRecord: destroyRecordStub,
      });
      const user = EmberObject.create({
        firstName: 'John',
        lastName: 'Harry',
        username: 'user.name0112',
        isAuthenticatedFromGAR: false,
        organizationLearners: [organizationLearner],
        authenticationMethods: [{ identityProvider: 'PIX' }],
      });
      const store = this.owner.lookup('service:store');
      const adapter = store.adapterFor('organization-learner');
      const dissociateAdapterStub = sinon.stub(adapter, 'dissociate');
      this.owner.register('service:access-control', AccessControlStub);

      const screen = await render(<template><UserDetailPersonalInformation @user={{user}} /></template>);
      await click(screen.getByRole('button', { name: 'Dissocier' }));

      await screen.findByRole('dialog');

      // when
      await click(screen.getByRole('button', { name: 'Annuler' }));

      // then
      // TODO Add Aria-hidden to PixUI before fix this test
      //assert.dom(screen.queryByRole('heading', { name: 'Confirmer la dissociation' })).doesNotExist();
      assert.ok(dissociateAdapterStub.notCalled);
    });

    test('should call dissociate action on click on confirm button', async function (assert) {
      // given
      const destroyRecordStub = sinon.stub();
      const organizationLearner = EmberObject.create({
        id: 1,
        firstName: 'John',
        lastName: 'Harry',
        canBeDissociated: true,
        destroyRecord: destroyRecordStub,
      });
      const user = EmberObject.create({
        firstName: 'John',
        lastName: 'Harry',
        username: 'user.name0112',
        isAuthenticatedFromGAR: false,
        organizationLearners: [organizationLearner],
        authenticationMethods: [{ identityProvider: 'PIX' }],
      });

      const store = this.owner.lookup('service:store');
      const adapter = store.adapterFor('organization-learner');
      const dissociateAdapterStub = sinon.stub(adapter, 'dissociate');

      this.owner.register('service:access-control', AccessControlStub);

      const screen = await render(<template><UserDetailPersonalInformation @user={{user}} /></template>);
      await click(screen.getByRole('button', { name: 'Dissocier' }));

      await screen.findByRole('dialog');

      // when
      await click(screen.getByRole('button', { name: 'Oui, je dissocie' }));

      // then
      assert.ok(dissociateAdapterStub.called);
    });
  });

  module('when the admin member click on delete button', function () {
    test('should display deletion confirm modal', async function (assert) {
      // given
      const destroyRecordStub = sinon.stub();
      const organizationLearner = EmberObject.create({
        id: 1,
        firstName: 'John',
        lastName: 'Harry',
        canBeDissociated: true,
        destroyRecord: destroyRecordStub,
      });
      const user = EmberObject.create({
        firstName: 'John',
        lastName: 'Harry',
        username: 'user.name0112',
        isAuthenticatedFromGAR: false,
        organizationLearners: [organizationLearner],
        authenticationMethods: [{ identityProvider: 'PIX' }],
      });
      this.owner.register('service:access-control', AccessControlStub);

      const screen = await render(<template><UserDetailPersonalInformation @user={{user}} /></template>);

      // when
      await click(
        screen.getByRole('button', { name: t('components.organization-learner-information.table.actions.delete') }),
      );

      await screen.findByRole('dialog');

      // then
      assert.dom(screen.getByText(t('components.organization-learner-information.deletion-modal.title'))).exists();
    });

    test('should close the modal on click on cancel button', async function (assert) {
      // given
      const destroyRecordStub = sinon.stub();
      const organizationLearner = EmberObject.create({
        id: 1,
        firstName: 'John',
        lastName: 'Harry',
        canBeDissociated: true,
        destroyRecord: destroyRecordStub,
      });
      const user = EmberObject.create({
        firstName: 'John',
        lastName: 'Harry',
        username: 'user.name0112',
        isAuthenticatedFromGAR: false,
        organizationLearners: [organizationLearner],
        authenticationMethods: [{ identityProvider: 'PIX' }],
      });

      this.owner.register('service:access-control', AccessControlStub);

      const screen = await render(<template><UserDetailPersonalInformation @user={{user}} /></template>);
      await click(
        screen.getByRole('button', { name: t('components.organization-learner-information.table.actions.delete') }),
      );

      await screen.findByRole('dialog');

      // when
      await click(screen.getByRole('button', { name: t('common.actions.cancel') }));

      // then
      // TODO Add Aria-hidden to PixUI before fix this test
      //assert.dom(screen.queryByRole('heading', { name: 'Confirmer la dissociation' })).doesNotExist();
      assert.ok(destroyRecordStub.notCalled);
    });

    test('should call delete action on click on confirm button', async function (assert) {
      // given
      const destroyRecordStub = sinon.stub();
      const organizationLearner = EmberObject.create({
        id: 1,
        firstName: 'John',
        lastName: 'Harry',
        canBeDissociated: true,
        destroyRecord: destroyRecordStub,
      });
      const user = EmberObject.create({
        firstName: 'John',
        lastName: 'Harry',
        username: 'user.name0112',
        isAuthenticatedFromGAR: false,
        organizationLearners: [organizationLearner],
        authenticationMethods: [{ identityProvider: 'PIX' }],
      });

      this.owner.register('service:access-control', AccessControlStub);

      const screen = await render(<template><UserDetailPersonalInformation @user={{user}} /></template>);
      await click(
        screen.getByRole('button', { name: t('components.organization-learner-information.table.actions.delete') }),
      );

      await screen.findByRole('dialog');

      // when
      await click(screen.getByRole('checkbox', { name: t('common.actions.are-you-sure') }));
      await click(screen.getByRole('button', { name: t('common.actions.confirm-deletion') }));

      // then
      assert.ok(destroyRecordStub.called);
    });
  });
});
