import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import { createUserManagingStudents, createPrescriberByUser } from '../helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Certifications page', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async () => {
    const user = createUserManagingStudents('ADMIN');
    createPrescriberByUser(user);

    await authenticateSession(user.id);
  });

  module('When user arrives on certifications page', function () {
    test('should show Certifications page', async function (assert) {
      // given / when
      await visit('/certifications');

      // then
      assert
        .dom('.certifications-page__text')
        .containsText(
          'Sélectionnez la classe pour laquelle vous souhaitez exporter les résultats de certification (.csv) ou télécharger les attestations (.pdf). Vous pouvez filtrer cette liste en renseignant le nom de la classe directement dans le champ.'
        );
      assert.contains('Exporter les résultats');
      assert.contains('Certifications');
      assert.contains('Classe');
    });

    test('should not show any banner', async function (assert) {
      // given / when
      await visit('/certifications');

      // then
      assert.dom('.information-banner').doesNotExist();
      assert.dom('.pix-banner').doesNotExist();
    });

    test('should show documentation about certification results link', async function (assert) {
      // given / when
      await visit('/certifications');

      // then
      assert.dom('a[href="https://cloud.pix.fr/s/cRaeKT4ErrXs4X8"]').exists();
    });

    test('should display attestation download button', async function (assert) {
      // when
      await visit('/certifications');

      // then
      assert.dom('button[id="download_attestations"]').exists();
    });
  });
});
