import { clickByName, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { module, test } from 'qunit';

import { createLearningContent } from '../../../../../mirage/helpers/create-learning-content';
import setupIntl from '../../../../helpers/setup-intl';

module('Acceptance | Target Profile copy', function (hooks) {
  setupApplicationTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);

  test('it should copy target profile information and tubes', async function (assert) {
    // given
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    createLearningContent(server);
    server.get('/admin/frameworks', (schema) => schema.frameworks.all());

    server.create('target-profile', {
      id: 1,
      name: 'nom initial',
      description: 'description initiale',
      comment: 'commentaire initial',
      category: 'OTHER',
      hasLinkedCampaign: false,
      cappedTubes: [{ id: 'tube_f2_a1_c1_th1_tu1', level: 1 }],
    });
    const screen = await visit('/target-profiles/1');

    // when
    await clickByName('Dupliquer ce profil cible');

    // then
    await screen.findByRole('button', { name: 'Valider' });
    await clickByName('Valider');
    await screen.findByRole('heading', { name: '[Copie] nom initial', level: 1 });
    assert.dom(screen.getByRole('heading', { name: '[Copie] nom initial', level: 1 })).exists();
    assert.dom(screen.getByRole('heading', { name: '[Copie] nom initial', level: 2 })).exists();
    await clickByName('1 · areaUn');
    await clickByName('1.1 competenceUn');
    assert.dom(screen.getByText('@tubeNiveauDeux : Mon tube de niveau deux')).exists();
    assert.strictEqual(currentURL(), '/target-profiles/2/details');
  });
});
