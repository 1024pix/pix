import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserManagingStudents, createPrescriberByUser } from '../helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Certifications page', (hooks) => {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async () => {
    const user = createUserManagingStudents('ADMIN');
    createPrescriberByUser(user);

    await authenticateSession({
      user_id: user.id,
      access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
      expires_in: 3600,
      token_type: 'Bearer token type',
    });
  });

  module('When feature toggle for exporting certification results is enabled', () => {
    hooks.beforeEach(async () => {
      server.create('feature-toggle', { id: 0, isCertificationResultsInOrgaEnabled: true });
    });

    module('When user arrives on certifications page', () => {

      test('should show Certifications page', async function(assert) {
        // given / when
        await visit('/certifications');

        // then
        assert.dom('.certifications-page__text').containsText('Sélectionnez la classe pour laquelle vous souhaitez exporter les résultats de certification au format csv. Vous pouvez filtrer cette liste en renseignant le nom de la classe directement dans le champ.');
        assert.contains('Exporter les résultats');
        assert.contains('Certifications');
        assert.contains('Classe');
      });

      test('should not show any banner', async function(assert) {
        // given / when
        await visit('/certifications');

        // then
        assert.dom('.information-banner').doesNotExist();
        assert.dom('.pix-banner').doesNotExist();
      });

      test('should show documentation about certification results link', async function(assert) {
        // given / when
        await visit('/certifications');

        // then
        assert.dom('a[href="https://cloud.pix.fr/s/cRaeKT4ErrXs4X8"]').exists();
      });
    });
  });
});

