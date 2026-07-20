import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL, findAll } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import setupIntl from '../../../helpers/setup-intl';

module('Acceptance | Combined course blueprint | List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    server.create('combined-course-blueprint', {
      id: 1,
      name: 'parcours IA',
      internalName: 'schéma de parcours IA',
      illsutration: 'https://image.pix.fr/ia.svg',
      description: "Un parcours sur l'IA pour le collège",
      content: [
        {
          type: 'evaluation',
          value: 1234,
        },
        {
          type: 'module',
          value: 'shasha',
        },
      ],
    });
    server.create('combined-course-blueprint', {
      id: 2,
      name: 'parcours cyber',
      internalName: 'schéma de parcours cyber',
      illsutration: 'https://image.pix.fr/cyber.svg',
      description: 'Un parcours sur la cybersécurité',
      content: [],
    });
    server.create('combined-course-blueprint', {
      id: 10,
      name: 'parcours numérique',
      internalName: 'schéma de parcours numérique',
      illsutration: 'https://image.pix.fr/num.svg',
      description: 'Un parcours sur le numérique',
      content: [],
    });
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
  });

  test('it should navigate to details combined course blueprint route', async function (assert) {
    // given
    const screen = await visit('/combined-course-blueprints/list');
    const link = screen.getByRole('link', { name: 'schéma de parcours IA' });

    // when
    await click(link);
    // then
    assert.strictEqual(currentURL(), '/combined-course-blueprints/1/organizations');
  });

  test('it should display blueprints ordered by id descending', async function (assert) {
    // when
    await visit('/combined-course-blueprints/list');

    // then
    const idCells = findAll('tbody tr td:first-child').map((cell) => cell.textContent.trim());
    assert.deepEqual(idCells, ['10', '2', '1']);
  });
});
