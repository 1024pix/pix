import { module, test } from 'qunit';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateAdminMemberWithRole } from '../../../../helpers/test-init';

module('Acceptance | authenticated/sessions/session/certifications', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user has role metier', function () {
    test('it should not show publish button', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isMetier: true })(server);
      server.create('session', { id: '1' });

      // when
      const screen = await visit('/sessions/1/certifications');

      // then
      assert.dom(screen.queryByText('Publier la session')).doesNotExist();
    });
  });
});
