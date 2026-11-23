import { fillByLabel, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import TeamInviteForm from 'pix-orga/components/team/invite-form';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { waitForDialog } from '../../../helpers/wait-for';

module('Integration | Component | Team::InviteForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should contain email input and validation button', async function (assert) {
    // given
    const inviteSpy = () => {};
    const cancelSpy = () => {};
    const updateEmail = sinon.spy();

    // when
    const screen = await render(
      <template>
        <TeamInviteForm @onSubmit={{inviteSpy}} @onCancel={{cancelSpy}} @onUpdateEmail={{updateEmail}} />
      </template>,
    );

    // then
    assert.dom('#email').exists();
    assert.dom('#email').isRequired();
    assert.ok(screen.getByText(t('pages.team-new-item.invite-button')));
    assert.dom(screen.queryByRole('dialog')).doesNotExist();
  });

  test('it should bind organizationInvitation properties with email form input', async function (assert) {
    // given
    const inviteSpy = () => {};
    const cancelSpy = () => {};
    const updateEmail = sinon.spy();
    const email = 'toto@org.fr';
    await render(
      <template>
        <TeamInviteForm
          @email={{email}}
          @onSubmit={{inviteSpy}}
          @onCancel={{cancelSpy}}
          @onUpdateEmail={{updateEmail}}
        />
      </template>,
    );

    // when
    const inputLabel = `${t('pages.team-new-item.input-label')} *`;
    await fillByLabel(inputLabel, 'dev@example.net');

    // then
    assert.ok(updateEmail.called);
  });

  test('it should open confirmation modal when invite button is clicked', async function (assert) {
    // given
    const inviteSpy = () => {};
    const cancelSpy = () => {};
    const updateEmail = sinon.spy();
    const email = 'toto@org.fr';
    const screen = await render(
      <template>
        <TeamInviteForm
          @email={{email}}
          @onSubmit={{inviteSpy}}
          @onCancel={{cancelSpy}}
          @onUpdateEmail={{updateEmail}}
        />
      </template>,
    );

    // when
    const inputLabel = `${t('pages.team-new-item.input-label')} *`;
    await fillByLabel(inputLabel, 'dev@example.net');
    const inviteButton = await screen.findByRole('button', {
      name: t('pages.team-new-item.invite-button'),
    });

    await click(inviteButton);
    await waitForDialog();

    // then
    assert.dom(screen.getByRole('dialog')).isVisible();
  });

  test('it should display error message when no email is in input and invite button is clicked', async function (assert) {
    // given
    const inviteSpy = () => {};
    const cancelSpy = () => {};
    const updateEmail = sinon.spy();
    const email = '';
    const errorMessage = t('pages.team-new.errors.mandatory-email-field');
    const screen = await render(
      <template>
        <TeamInviteForm
          @email={{email}}
          @onSubmit={{inviteSpy}}
          @onCancel={{cancelSpy}}
          @onUpdateEmail={{updateEmail}}
        />
      </template>,
    );

    // when
    const inputLabel = `${t('pages.team-new-item.input-label')} *`;
    await fillByLabel(inputLabel, '');
    const inviteButton = await screen.findByRole('button', {
      name: t('pages.team-new-item.invite-button'),
    });

    await click(inviteButton);

    // then
    assert.dom(await screen.findByText(errorMessage)).exists();
    assert.dom(screen.queryByRole('dialog')).doesNotExist();
  });

  test('it should display error message when email format is not correct', async function (assert) {
    // given
    const inviteSpy = () => {};
    const cancelSpy = () => {};
    const updateEmail = sinon.spy();
    const email = 'toto@org.fr;alex-mail.incorrect';
    const errorMessage = t('pages.team-new.errors.invalid-input');
    const screen = await render(
      <template>
        <TeamInviteForm
          @email={{email}}
          @onSubmit={{inviteSpy}}
          @onCancel={{cancelSpy}}
          @onUpdateEmail={{updateEmail}}
        />
      </template>,
    );

    // when
    const inviteButton = await screen.findByRole('button', {
      name: t('pages.team-new-item.invite-button'),
    });

    await click(inviteButton);

    // then
    assert.dom(await screen.findByText(errorMessage)).exists();
    assert.dom(screen.queryByRole('dialog')).doesNotExist();
  });
});
