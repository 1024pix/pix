import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { module, test } from 'qunit';

import { createLearningContent } from '../../../../../mirage/helpers/create-learning-content';
import setupIntl from '../../../../helpers/setup-intl';

module('Acceptance | Target Profile Management', function (hooks) {
  setupApplicationTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);

  let screen;

  hooks.beforeEach(async function () {
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

    // when
    screen = await visit('/target-profiles/1');
    await clickByName('Modifier');
  });

  test('it should edit target profile informations and selected tubes', async function (assert) {
    await fillByLabel(/Nom/, 'Un nouveau nom');

    await fillByLabel(/Référentiel/, 'Pi');
    await click(screen.getByLabelText('Pix + Cuisine'));
    await clickByName('area_f2_a1 code · area_f2_a1 title');
    await clickByName('competence_f2_a1_c1 index competence_f2_a1_c1 name');
    await click(
      screen.getByRole('button', {
        name: 'Sélection du niveau du sujet suivant : tube_f2_a1_c1_th1_tu1 practicalTitle',
      }),
    );
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: '6' }));

    await fillByLabel(/Description/, 'Une nouvelle description');

    await clickByName('Modifier le profil cible');

    // then
    assert.dom(screen.getByText('Le profil cible a été modifié avec succès.')).exists();

    assert.strictEqual(screen.getAllByRole('heading', { name: 'Un nouveau nom' }).length, 2);
    assert.dom(screen.getByText('Une nouvelle description')).exists();

    await clickByName('area_f2_a1 code · area_f2_a1 title');
    await clickByName('competence_f2_a1_c1 index competence_f2_a1_c1 name');
    assert.dom(screen.getByText('tube_f2_a1_c1_th1_tu1 name : tube_f2_a1_c1_th1_tu1 practicalTitle')).exists();
    assert.strictEqual(screen.getByTestId('level-tube_f2_a1_c1_th1_tu1').innerText, '6');
  });

  module('when no tubes are selected', function () {
    test('it should display an error notification', async function (assert) {
      // when
      await clickByName('Modifier le profil cible');

      // then
      assert.dom(screen.getByText('Vous devez sélectionner au moins 1 sujet !')).exists();
    });
  });
});
