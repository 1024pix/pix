import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, waitForElementToBeRemoved } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { click } from '@ember/test-helpers';
import setupIntl from '../../../helpers/setup-intl';

module('Integration | Component | certification-center-invitations-action', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it should create certification-center invitation with default language', async function (assert) {
    // given
    const createInvitationStub = sinon.stub();
    this.set('createInvitation', createInvitationStub);
    this.set('noop', () => {});

    // when
    const screen = await render(
      hbs`<CertificationCenters::InvitationsAction
  @createInvitation={{this.createInvitation}}
  @onChangeUserEmailToInvite={{this.noop}}
/>`,
    );
    await click(screen.getByRole('button', { name: 'Inviter un membre' }));

    // then
    assert.ok(createInvitationStub.calledWith('fr-fr'));
  });

  test('it creates a certification-center invitation with choosen language and choosen role', async function (assert) {
    // given
    const createInvitationStub = sinon.stub();
    this.set('createInvitation', createInvitationStub);
    this.set('noop', () => {});

    // when
    const screen = await render(
      hbs`<CertificationCenters::InvitationsAction
  @createInvitation={{this.createInvitation}}
  @onChangeUserEmailToInvite={{this.noop}}
/>`,
    );

    await click(screen.getByRole('button', { name: 'Choisir la langue de l’email d’invitation' }));
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: 'Anglais' }));
    await waitForElementToBeRemoved(() => screen.queryByRole('listbox'));

    await click(screen.getByRole('button', { name: 'Choisir le rôle du membre' }));
    await screen.findAllByRole('listbox');
    await click(screen.getByRole('option', { name: 'Membre' }));

    await click(screen.getByRole('button', { name: 'Inviter un membre' }));

    // then
    sinon.assert.calledWith(createInvitationStub, 'en', 'MEMBER');
    assert.ok(true);
  });
});
