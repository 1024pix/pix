import { clickByName, render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import GenerateUsernamePasswordModal from 'pix-orga/components/sco-organization-participant/generate-username-password-modal';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | ScoOrganizationParticipant::GenerateUsernamePasswordModal', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders the modal', async function (assert) {
    const onCloseModal = sinon.spy();
    const onTriggerAction = sinon.spy();
    const totalAffectedStudents = 1;

    const screen = await render(
      <template>
        <GenerateUsernamePasswordModal
          @showModal={{true}}
          @onCloseModal={{onCloseModal}}
          @onTriggerAction={{onTriggerAction}}
          @totalAffectedStudents={{totalAffectedStudents}}
        />
      </template>,
    );

    assert.ok(
      screen.getByRole('heading', {
        name: t('pages.sco-organization-participants.generate-username-password-modal.title'),
      }),
    );

    await clickByName(t('common.actions.confirm'));
    assert.ok(onTriggerAction.calledOnce);
  });

  test('disable submit button when no affected students', async function (assert) {
    const onCloseModal = sinon.spy();
    const onTriggerAction = sinon.spy();
    const totalAffectedStudents = 0;

    const screen = await render(
      <template>
        <GenerateUsernamePasswordModal
          @showModal={{true}}
          @onCloseModal={{onCloseModal}}
          @onTriggerAction={{onTriggerAction}}
          @totalAffectedStudents={{totalAffectedStudents}}
        />
      </template>,
    );

    const heading = screen.getByRole('heading', {
      name: t('pages.sco-organization-participants.generate-username-password-modal.title'),
    });
    const button = screen.getByRole('button', { name: t('common.actions.confirm') });

    assert.ok(heading);
    assert.dom(button).hasAttribute('disabled');
  });

  test('close the modal', async function (assert) {
    const onCloseModal = sinon.spy();
    const onTriggerAction = sinon.spy();
    const totalAffectedStudents = 1;

    await render(
      <template>
        <GenerateUsernamePasswordModal
          @showModal={{true}}
          @onCloseModal={{onCloseModal}}
          @onTriggerAction={{onTriggerAction}}
          @totalAffectedStudents={{totalAffectedStudents}}
        />
      </template>,
    );

    await clickByName(t('common.actions.cancel'));
    assert.ok(onCloseModal.calledOnce);
  });
});
