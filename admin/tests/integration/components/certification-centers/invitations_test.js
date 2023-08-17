import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | Certification Centers | Invitations', function (hooks) {
  setupRenderingTest(hooks);

  module('when there is no certification center invitations', function () {
    test('should show "Aucune invitation en attente"', async function (assert) {
      // given
      this.certificationCenterInvitations = [];

      // when
      const screen = await render(
        hbs`<CertificationCenters::Invitations @certificationCenterInvitations={{this.certificationCenterInvitations}} />`,
      );

      // then
      assert.dom(screen.getByText('Aucune invitation en attente')).exists();
    });
  });

  module('when there is one or more certification center invitations', function () {
    test('should show invitations list', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificationCenterInvitation1 = store.createRecord('certification-center-invitation', {
        email: 'elo.dela@example.net',
        updatedAt: new Date('2020-02-02'),
      });
      const certificationCenterInvitation2 = store.createRecord('certification-center-invitation', {
        email: 'alain.finis@example.net',
        updatedAt: new Date('2022-02-02'),
      });
      this.certificationCenterInvitations = [certificationCenterInvitation1, certificationCenterInvitation2];
      this.cancelCertificationCenterInvitation = sinon.stub();

      // when
      const screen = await render(
        hbs`<CertificationCenters::Invitations
  @certificationCenterInvitations={{this.certificationCenterInvitations}}
  @onCancelCertificationCenterInvitation={{this.cancelCertificationCenterInvitation}}
/>`,
      );

      // then
      assert.dom(screen.getByRole('heading', { name: 'Invitations' })).exists();
      assert.dom(screen.getByRole('columnheader', { name: 'Adresse e-mail' })).exists();
      assert.dom(screen.getByRole('columnheader', { name: 'Date de dernier envoi' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'elo.dela@example.net' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'alain.finis@example.net' })).exists();
    });
  });
});
