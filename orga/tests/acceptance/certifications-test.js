import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'pix-orga/tests/test-support/setup-mirage';
import { module, test } from 'qunit';
import sinon from 'sinon';

import authenticateSession from '../helpers/authenticate-session';
import { createPrescriberByUser, createUserManagingStudents } from '../helpers/test-init';

module('Acceptance | Certifications page', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async () => {
    const user = createUserManagingStudents('ADMIN');
    createPrescriberByUser({ user });
    await authenticateSession(user.id);
  });

  module('When user arrives on certifications page', function () {
    test('should display certification banner when it is time to', async function (assert) {
      sinon.useFakeTimers({ now: new Date('2001-04-01T10:42:00Z'), shouldAdvanceTime: true });

      // given / when
      await visit('/certifications');
      // then
      assert.ok('.pix-notification-alert');
    });

    test('should not show any banner outside certification period', async function (assert) {
      sinon.useFakeTimers({ now: new Date('2001-10-01T10:42:00Z'), shouldAdvanceTime: true });
      // given / when
      await visit('/certifications');

      // then
      assert.dom('.pix-notification-alert ').doesNotExist();
    });

    module('When organizations has no students imported yet', function () {
      test('should show warning message inviting user to import students on Certifications page', async function (assert) {
        // given / when
        const screen = await visit('/certifications');

        // then
        assert.ok(
          screen.getByText(
            'Dans cet onglet, vous retrouverez les résultats et les certificats des élèves. Vous devez, dans un premier temps, importer la base élèves de votre établissement.',
          ),
        );
      });
    });

    module('When organizations has imported students', function (hooks) {
      hooks.beforeEach(async () => {
        const division = server.create('division', {
          name: '3eme',
        });
        const organization = server.schema.organizations.all().models[0];
        organization.update({ divisions: [division] });
      });

      test('should show Certifications page', async function (assert) {
        // given / when
        const screen = await visit('/certifications');

        // then
        assert.ok(
          screen.getByText(
            'Sélectionnez la classe pour laquelle vous souhaitez exporter les résultats de certification (.csv) ou télécharger les certificats (.pdf). Vous pouvez filtrer cette liste en renseignant le nom de la classe directement dans le champ.',
          ),
        );
        assert.ok(screen.getByText('Exporter les résultats'));
        assert.ok(screen.getByText('Certifications'));
        assert.ok(screen.getByText('Classe'));
      });

      test('should show documentation about certification results link', async function (assert) {
        // given / when
        const screen = await visit('/certifications');

        // then
        assert
          .dom(screen.getByRole('link', { name: 'Interprétation des résultats Ouverture dans une nouvelle fenêtre' }))
          .hasAttribute('href', 'https://cloud.pix.fr/s/oqnYJWHoSXz8LJk');
      });

      test('should display attestation download button', async function (assert) {
        // when
        await visit('/certifications');

        // then
        assert.ok('button[id="download_attestations"]');
      });
    });
  });
});
