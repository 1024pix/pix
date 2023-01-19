import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from '@ember/test-helpers';

module('Integration | Component | certification-center-invitations-action', function (hooks) {
  setupRenderingTest(hooks);

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
/>`
    );
    await click(screen.getByRole('button', { name: 'Inviter un membre' }));

    // then
    assert.ok(createInvitationStub.calledWith('fr-fr'));
  });

  test('it should create certification-center invitation with choosen language', async function (assert) {
    // given
    const createInvitationStub = sinon.stub();
    this.set('createInvitation', createInvitationStub);
    this.set('noop', () => {});

    // when
    const screen = await render(
      hbs`<CertificationCenters::InvitationsAction
  @createInvitation={{this.createInvitation}}
  @onChangeUserEmailToInvite={{this.noop}}
/>`
    );

    await click(screen.getByRole('button', { name: 'Choisir la langue de l’email d’invitation' }));
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: 'Anglais' }));

    await click(screen.getByRole('button', { name: 'Inviter un membre' }));

    // then
    assert.ok(createInvitationStub.calledWith('en'));
  });
});
