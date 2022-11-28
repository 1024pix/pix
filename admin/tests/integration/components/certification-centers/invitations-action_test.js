import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, selectByLabelAndOption } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { clickByText } from '@1024pix/ember-testing-library';

module('Integration | Component | certification-center-invitations-action', function (hooks) {
  setupRenderingTest(hooks);

  test('it should create certification-center invitation with default language', async function (assert) {
    // given
    const createInvitationStub = sinon.stub();
    this.set('createInvitation', createInvitationStub);
    this.set('noop', () => {});

    // when
    await render(
      hbs`<CertificationCenters::InvitationsAction
  @createInvitation={{this.createInvitation}}
  @onChangeUserEmailToInvite={{this.noop}}
/>`
    );
    await clickByText('Inviter');

    // then
    assert.ok(createInvitationStub.calledWith('fr-fr'));
  });

  test('it should create certification-center invitation with choosen language', async function (assert) {
    // given
    const createInvitationStub = sinon.stub();
    this.set('createInvitation', createInvitationStub);
    this.set('noop', () => {});

    // when
    await render(
      hbs`<CertificationCenters::InvitationsAction
  @createInvitation={{this.createInvitation}}
  @onChangeUserEmailToInvite={{this.noop}}
/>`
    );
    await selectByLabelAndOption('Choisir la langue de l’email d’invitation', 'en');
    await clickByText('Inviter');

    // then
    assert.ok(createInvitationStub.calledWith('en'));
  });
});
