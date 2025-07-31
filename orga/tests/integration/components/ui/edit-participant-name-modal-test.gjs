import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import EditParticipantNameModal from 'pix-orga/components/ui/edit-participant-name-modal';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Ui::EditParticipantNameModal', function (hooks) {
  setupIntlRenderingTest(hooks);
  let closeStub;
  let notificationsStub;
  let storeStub;
  let currentUserStub;
  let adapterStub;
  let participant;
  let lastNameLabel;
  let firstNameLabel;

  hooks.beforeEach(function () {
    participant = {
      id: '123',
      firstName: 'Jean',
      lastName: 'Dupont',
    };

    closeStub = sinon.stub();
    notificationsStub = this.owner.lookup('service:notifications');
    storeStub = this.owner.lookup('service:store');
    currentUserStub = this.owner.lookup('service:current-user');

    adapterStub = {
      updateParticipantName: sinon.stub(),
    };

    sinon.stub(notificationsStub, 'success');
    sinon.stub(notificationsStub, 'error');
    sinon.stub(storeStub, 'adapterFor').returns(adapterStub);

    firstNameLabel = t('components.ui.edit-participant-name-modal.fields.first-name') + ' *';
    lastNameLabel = t('components.ui.edit-participant-name-modal.fields.last-name') + ' *';
    lastNameLabel = t('components.ui.edit-participant-name-modal.fields.last-name') + ' *';

    currentUserStub.organization = { id: 'org-123' };
  });

  test('should render modal with participant data', async function (assert) {
    const screen = await render(
      <template>
        <EditParticipantNameModal @show={{true}} @onClose={{closeStub}} @participant={{participant}} />
      </template>,
    );

    assert.ok(screen.getByDisplayValue('Jean'));
    assert.ok(screen.getByDisplayValue('Dupont'));
  });

  test('should pre-fill input fields with participant data', async function (assert) {
    const screen = await render(
      <template>
        <EditParticipantNameModal @show={{true}} @onClose={{closeStub}} @participant={{participant}} />
      </template>,
    );

    const firstNameInput = screen.getByDisplayValue('Jean');
    const lastNameInput = screen.getByDisplayValue('Dupont');

    assert.ok(firstNameInput);
    assert.ok(lastNameInput);
  });

  test('should update firstName when typing in first name input', async function (assert) {
    const screen = await render(
      <template>
        <EditParticipantNameModal @show={{true}} @onClose={{closeStub}} @participant={{participant}} />
      </template>,
    );

    await fillByLabel(firstNameLabel, 'Pierre');

    const firstNameInput = screen.getByDisplayValue('Pierre');
    assert.ok(firstNameInput);
  });

  test('should update lastName when typing in last name input', async function (assert) {
    const screen = await render(
      <template>
        <EditParticipantNameModal @show={{true}} @onClose={{closeStub}} @participant={{participant}} />
      </template>,
    );

    await fillByLabel(lastNameLabel, 'Martin');

    const lastNameInput = screen.getByDisplayValue('Martin');
    assert.ok(lastNameInput);
  });

  module('validation', function () {
    test('should show error message when first name is empty', async function (assert) {
      const screen = await render(
        <template>
          <EditParticipantNameModal @show={{true}} @onClose={{closeStub}} @participant={{participant}} />
        </template>,
      );

      await fillByLabel(firstNameLabel, '');

      assert.ok(screen.getByText(t('components.ui.edit-participant-name-modal.error-message')));
    });

    test('should show error message when last name is empty', async function (assert) {
      const screen = await render(
        <template>
          <EditParticipantNameModal @show={{true}} @onClose={{closeStub}} @participant={{participant}} />
        </template>,
      );

      await fillByLabel(lastNameLabel, '');

      assert.ok(screen.getByText(t('components.ui.edit-participant-name-modal.error-message')));
    });

    test('should show error message when both names are empty', async function (assert) {
      const screen = await render(
        <template>
          <EditParticipantNameModal @show={{true}} @onClose={{closeStub}} @participant={{participant}} />
        </template>,
      );

      await fillByLabel(firstNameLabel, '');
      await fillByLabel(lastNameLabel, '');

      assert.ok(screen.getByText(t('components.ui.edit-participant-name-modal.error-message')));
    });

    test('should not show error message when both fields are filled', async function (assert) {
      const screen = await render(
        <template>
          <EditParticipantNameModal @show={{true}} @onClose={{closeStub}} @participant={{participant}} />
        </template>,
      );

      await fillByLabel(firstNameLabel, 'Pierre');
      await fillByLabel(lastNameLabel, 'Martin');

      assert.notOk(screen.queryByText(t('components.ui.edit-participant-name-modal.error-message')));
    });
  });

  module('save', function () {
    test('should not call API when no changes are made', async function (assert) {
      await render(
        <template>
          <EditParticipantNameModal @show={{true}} @onClose={{closeStub}} @participant={{participant}} />
        </template>,
      );

      await clickByName(t('common.actions.save'));

      sinon.assert.notCalled(adapterStub.updateParticipantName);
      sinon.assert.calledWith(notificationsStub.success, 'Nom mis à jour avec succès');
      sinon.assert.calledOnce(closeStub);
      assert.ok(true); // QUnit assertion for test completion
    });

    test('should call API when changes are made', async function (assert) {
      adapterStub.updateParticipantName.resolves();

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
      sinon.assert.calledWith(notificationsStub.success, 'Nom mis à jour avec succès');
      sinon.assert.calledOnce(closeStub);
    });

    test('should show error notification on API failure', async function (assert) {
      const error = new Error('API Error');
      adapterStub.updateParticipantName.rejects(error);

      await render(
        <template>
          <EditParticipantNameModal @show={{true}} @onClose={{closeStub}} @participant={{participant}} />
        </template>,
      );

      await fillByLabel(firstNameLabel, 'Pierre');
      await clickByName(t('common.actions.save'));

      sinon.assert.calledWith(notificationsStub.error, 'Une erreur est survenue lors de la mise à jour du nom');
      sinon.assert.notCalled(closeStub);
      assert.ok(true); // QUnit assertion for test completion
    });

    test('should not call API when fields are invalid', async function (assert) {
      await render(
        <template>
          <EditParticipantNameModal @show={{true}} @onClose={{closeStub}} @participant={{participant}} />
        </template>,
      );

      await fillByLabel(firstNameLabel, '');
      await clickByName(t('common.actions.save'));

      sinon.assert.notCalled(adapterStub.updateParticipantName);
      sinon.assert.notCalled(notificationsStub.success);
      sinon.assert.notCalled(closeStub);
      assert.ok(true); // QUnit assertion for test completion
    });

    test('should trim whitespace from names before saving', async function (assert) {
      adapterStub.updateParticipantName.resolves();

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
