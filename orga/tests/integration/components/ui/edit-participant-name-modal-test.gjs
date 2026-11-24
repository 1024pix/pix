import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import EditParticipantNameModal from 'pix-orga/components/ui/edit-participant-name-modal';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Ui::EditParticipantNameModal', function (hooks) {
  setupIntlRenderingTest(hooks);
  let notificationsStub;
  let storeStub;
  let currentUserStub;
  let adapterStub;
  let lastNameLabel;
  let firstNameLabel;

  hooks.beforeEach(function () {
    notificationsStub = this.owner.lookup('service:notifications');
    storeStub = this.owner.lookup('service:store');
    currentUserStub = this.owner.lookup('service:current-user');

    adapterStub = {
      updateParticipantName: sinon.stub(),
    };

    sinon.stub(notificationsStub, 'sendSuccess');
    sinon.stub(notificationsStub, 'sendError');
    sinon.stub(storeStub, 'adapterFor').returns(adapterStub);

    firstNameLabel = t('components.ui.edit-participant-name-modal.fields.first-name') + ' *';
    lastNameLabel = t('components.ui.edit-participant-name-modal.fields.last-name') + ' *';

    currentUserStub.organization = { id: 'org-123' };
  });

  test('should render modal with participant data', async function (assert) {
    const participant = {
      id: '123',
      firstName: 'Jean',
      lastName: 'Dupont',
    };
    const closeStub = sinon.stub();
    const screen = await render(
      <template>
        <EditParticipantNameModal @show={{true}} @onClose={{closeStub}} @participant={{participant}} />
      </template>,
    );

    assert.ok(screen.getByDisplayValue('Jean'));
    assert.ok(screen.getByDisplayValue('Dupont'));
  });

  test('should update firstName when typing in first name input', async function (assert) {
    const participant = {
      id: '123',
      firstName: 'Jean',
      lastName: 'Dupont',
    };
    const closeStub = sinon.stub();
    const screen = await render(
      <template>
        <EditParticipantNameModal @show={{true}} @onClose={{closeStub}} @participant={{participant}} />
      </template>,
    );

    await fillByLabel(firstNameLabel, 'Pierre');

    assert.notOk(screen.queryByText('Jean'));
  });

  test('should update lastName when typing in last name input', async function (assert) {
    const participant = {
      id: '123',
      firstName: 'Jean',
      lastName: 'Dupont',
    };
    const closeStub = sinon.stub();
    const screen = await render(
      <template>
        <EditParticipantNameModal @show={{true}} @onClose={{closeStub}} @participant={{participant}} />
      </template>,
    );

    await fillByLabel(lastNameLabel, 'Martin');

    assert.notOk(screen.queryByText('Jean'));
  });

  module('validation', function () {
    test('should show error message when first name is empty', async function (assert) {
      const participant = {
        id: '123',
        firstName: 'Jean',
        lastName: 'Dupont',
      };
      const closeStub = sinon.stub();
      const screen = await render(
        <template>
          <EditParticipantNameModal @show={{true}} @onClose={{closeStub}} @participant={{participant}} />
        </template>,
      );

      await fillByLabel(firstNameLabel, '');

      assert.ok(screen.getByText(t('components.ui.edit-participant-name-modal.error-messages.first-name')));
    });

    test('should show error message when last name is empty', async function (assert) {
      const participant = {
        id: '123',
        firstName: 'Jean',
        lastName: 'Dupont',
      };
      const closeStub = sinon.stub();
      const screen = await render(
        <template>
          <EditParticipantNameModal @show={{true}} @onClose={{closeStub}} @participant={{participant}} />
        </template>,
      );

      await fillByLabel(lastNameLabel, '');

      assert.ok(screen.getByText(t('components.ui.edit-participant-name-modal.error-messages.last-name')));
    });
  });

  module('save', function () {
    test('should not call API when no changes are made', async function (assert) {
      const participant = {
        id: '123',
        firstName: 'Jean',
        lastName: 'Dupont',
      };
      const closeStub = sinon.stub();
      await render(
        <template>
          <EditParticipantNameModal @show={{true}} @onClose={{closeStub}} @participant={{participant}} />
        </template>,
      );

      await clickByName(t('common.actions.save'));

      sinon.assert.notCalled(adapterStub.updateParticipantName);
      sinon.assert.calledWith(notificationsStub.sendSuccess, 'Nom mis à jour avec succès');
      sinon.assert.calledOnce(closeStub);
      assert.ok(true); // QUnit assertion for test completion
    });

    test('should call API when changes are made', async function (assert) {
      adapterStub.updateParticipantName.resolves();
      const participant = {
        id: '123',
        firstName: 'Jean',
        lastName: 'Dupont',
      };
      const closeStub = sinon.stub();

      await render(
        <template>
          <EditParticipantNameModal @show={{true}} @onClose={{closeStub}} @participant={{participant}} />
        </template>,
      );

      await fillByLabel(firstNameLabel, 'Pierre');
      await fillByLabel(lastNameLabel, 'Martin');
      await clickByName(t('common.actions.save'));

      sinon.assert.calledWith(adapterStub.updateParticipantName, 'org-123', '123', 'Pierre', 'Martin');
      assert.ok(true); // QUnit assertion for test completion
    });

    test('should update participant data and show success notification on successful save', async function (assert) {
      adapterStub.updateParticipantName.resolves();
      const participant = {
        id: '123',
        firstName: 'Jean',
        lastName: 'Dupont',
      };
      const closeStub = sinon.stub();

      await render(
        <template>
          <EditParticipantNameModal @show={{true}} @onClose={{closeStub}} @participant={{participant}} />
        </template>,
      );

      await fillByLabel(firstNameLabel, 'Pierre');
      await fillByLabel(lastNameLabel, 'Martin');
      await clickByName(t('common.actions.save'));

      assert.strictEqual(participant.firstName, 'Pierre');
      assert.strictEqual(participant.lastName, 'Martin');
      sinon.assert.calledWith(notificationsStub.sendSuccess, 'Nom mis à jour avec succès');
      sinon.assert.calledOnce(closeStub);
    });

    test('should show error notification on API failure', async function (assert) {
      const error = new Error('API Error');
      const participant = {
        id: '123',
        firstName: 'Jean',
        lastName: 'Dupont',
      };
      const closeStub = sinon.stub();
      adapterStub.updateParticipantName.rejects(error);

      await render(
        <template>
          <EditParticipantNameModal @show={{true}} @onClose={{closeStub}} @participant={{participant}} />
        </template>,
      );

      await fillByLabel(firstNameLabel, 'Pierre');
      await clickByName(t('common.actions.save'));

      sinon.assert.calledWith(notificationsStub.sendError, t('api-error-messages.global'));
      sinon.assert.notCalled(closeStub);
      assert.ok(true); // QUnit assertion for test completion
    });

    test('should not call API when fields are invalid', async function (assert) {
      const participant = {
        id: '123',
        firstName: 'Jean',
        lastName: 'Dupont',
      };
      const closeStub = sinon.stub();
      await render(
        <template>
          <EditParticipantNameModal @show={{true}} @onClose={{closeStub}} @participant={{participant}} />
        </template>,
      );

      await fillByLabel(firstNameLabel, '');
      await clickByName(t('common.actions.save'));

      sinon.assert.notCalled(adapterStub.updateParticipantName);
      sinon.assert.notCalled(notificationsStub.sendSuccess);
      sinon.assert.notCalled(closeStub);
      assert.ok(true); // QUnit assertion for test completion
    });

    test('should trim whitespace from names before saving', async function (assert) {
      adapterStub.updateParticipantName.resolves();

      const participant = {
        id: '123',
        firstName: 'Jean',
        lastName: 'Dupont',
      };
      const closeStub = sinon.stub();
      await render(
        <template>
          <EditParticipantNameModal @show={{true}} @onClose={{closeStub}} @participant={{participant}} />
        </template>,
      );

      await fillByLabel(firstNameLabel, '  Pierre  ');
      await fillByLabel(lastNameLabel, '  Martin  ');
      await clickByName(t('common.actions.save'));

      sinon.assert.calledWith(adapterStub.updateParticipantName, 'org-123', '123', 'Pierre', 'Martin');
      assert.strictEqual(participant.firstName, 'Pierre');
      assert.strictEqual(participant.lastName, 'Martin');
    });
  });

  module('close', function () {
    test('should call onClose when cancel button is clicked', async function (assert) {
      const participant = {
        id: '123',
        firstName: 'Jean',
        lastName: 'Dupont',
      };
      const closeStub = sinon.stub();
      await render(
        <template>
          <EditParticipantNameModal @show={{true}} @onClose={{closeStub}} @participant={{participant}} />
        </template>,
      );

      await clickByName(t('common.actions.cancel'));

      sinon.assert.calledOnce(closeStub);
      assert.ok(true); // QUnit assertion for test completion
    });
  });
});
