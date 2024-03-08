import { visit } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

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

  module('When requesting next page from pagination', function () {
    test('it should display next page jury certificate summary', async function (assert) {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      const juryCertificationSummaries = server.createList('jury-certification-summary', 11);
      server.create('session', {
        id: '1',
        juryCertificationSummaries,
      });

      // when
      const screen = await visit('/sessions/1/certifications');
      await click(screen.getByRole('button', { name: 'Aller à la page suivante' }));

      // then
      assert.strictEqual(currentURL(), '/sessions/1/certifications?pageNumber=2');
      const lastSummary = juryCertificationSummaries.at(-1);
      assert.dom(screen.queryByText(lastSummary.id)).exists();
      const numberOfLineForHeadAndBody = 2;
      assert.strictEqual(screen.queryAllByRole('row').length, numberOfLineForHeadAndBody);
    });
  });

  module('When requesting page 2 of certification from url', function () {
    test('it should display page 2 jury certificate summary', async function (assert) {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      const juryCertificationSummaries = server.createList('jury-certification-summary', 11);
      server.create('session', {
        id: '1',
        juryCertificationSummaries,
      });

      // when
      const screen = await visit('/sessions/1/certifications?pageNumber=2&pageSize=10');

      // then
      const lastSummary = juryCertificationSummaries.at(-1);
      assert.dom(screen.queryByText(lastSummary.id)).exists();
      const numberOfLineForHeadAndBody = 2;
      assert.strictEqual(screen.queryAllByRole('row').length, numberOfLineForHeadAndBody);
    });
  });
});
