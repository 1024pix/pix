import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import UserDetailPersonalInformation from 'pix-admin/components/users/user-detail-personal-information';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | users | user-detail-personal-information', function (hooks) {
  setupIntlRenderingTest(hooks);

  class AccessControlStub extends Service {
    hasAccessToUsersActionsScope = true;
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

      this.owner.register('service:access-control', AccessControlStub);

      const screen = await render(<template><UserDetailPersonalInformation @user={{user}} /></template>);
      await click(screen.getByRole('button', { name: 'Dissocier' }));

      await screen.findByRole('dialog');

      // when
      await click(screen.getByRole('button', { name: 'Annuler' }));

      // then
      // TODO Add Aria-hidden to PixUI before fix this test
      //assert.dom(screen.queryByRole('heading', { name: 'Confirmer la dissociation' })).doesNotExist();
      assert.ok(destroyRecordStub.notCalled);
    });

    test('should call destroyRecord on click on confirm button', async function (assert) {
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
      await click(screen.getByRole('button', { name: 'Dissocier' }));

      await screen.findByRole('dialog');

      // when
      await click(screen.getByRole('button', { name: 'Oui, je dissocie' }));

      // then
      assert.ok(destroyRecordStub.called);
    });
  });
});
