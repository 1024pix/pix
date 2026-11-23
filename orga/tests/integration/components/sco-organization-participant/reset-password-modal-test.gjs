import { clickByName, render } from '@1024pix/ember-testing-library';
import ResetPasswordModal from 'pix-orga/components/sco-organization-participant/reset-password-modal';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | ScoOrganizationParticipant::ResetPasswordModal', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders the modal', async function (assert) {
    // given
    const onCloseModal = sinon.spy();
    const onTriggerAction = sinon.spy();
    const totalAffectedStudents = 3;
    const totalSelectedStudents = 3;

    const screen = await render(
      <template>
        <ResetPasswordModal
          @showModal={{true}}
          @totalSelectedStudents={{totalSelectedStudents}}
          @totalAffectedStudents={{totalAffectedStudents}}
          @onTriggerAction={{onTriggerAction}}
          @onCloseModal={{onCloseModal}}
        />
      </template>,
    );

    assert
      .dom(
        screen.getByRole('heading', {
          name: 'Réinitialisation des mots de passe des élèves avec identifiant',
        }),
      )
      .exists();

    // when
    await clickByName(t('common.actions.confirm'));

    // then
    assert.ok(onTriggerAction.calledOnce);
  });

  test('closes the modal', async function (assert) {
    // given
    const onCloseModal = sinon.spy();
    const onTriggerAction = sinon.spy();
    const totalAffectedStudents = 3;
    const totalSelectedStudents = 3;

    await render(
      <template>
        <ResetPasswordModal
          @showModal={{true}}
          @totalSelectedStudents={{totalSelectedStudents}}
          @totalAffectedStudents={{totalAffectedStudents}}
          @onTriggerAction={{onTriggerAction}}
          @onCloseModal={{onCloseModal}}
        />
      </template>,
    );

    // when
    await clickByName(t('common.actions.cancel'));

    // then
    assert.ok(onCloseModal.calledOnce);
  });
});
