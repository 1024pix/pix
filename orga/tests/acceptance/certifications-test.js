import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserManagingStudents, createPrescriberByUser } from '../helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Certifications page', function(hooks) {

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

  module('When feature toggle for exporting certification results is enabled', function() {
    hooks.beforeEach(async () => {
      server.create('feature-toggle', { id: 0, isCertificationResultsInOrgaEnabled: true });
    });

    module('When user arrives on certifications page', function() {

      test('should show Certifications page', async function(assert) {
        // given / when
        await visit('/certifications');

        // then
        assert.contains('Sélectionnez la classe pour laquelle vous souhaitez exporter les résultats de certification au format csv.');
        assert.contains('Exporter les résultats');
        assert.contains('Certifications');
        assert.contains('Classe');
      });
    });
  });
});

