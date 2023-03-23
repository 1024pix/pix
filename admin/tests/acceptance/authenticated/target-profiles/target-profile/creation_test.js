import { module, test } from 'qunit';
import { currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { clickByName, fillByLabel, visit } from '@1024pix/ember-testing-library';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { createLearningContent } from '../../../../../mirage/helpers/create-learning-content';

module('Acceptance | Target profile creation', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('Access restriction stuff', function () {
    module('When admin member is not logged in', function () {
      test('it should not be accessible by an unauthenticated user', async function (assert) {
        // when
        await visit('/target-profiles/new');

        // then
        assert.strictEqual(currentURL(), '/login');
      });
    });

    module('When admin member is logged in', function () {
      module('when admin member has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
        test('it should be accessible for an authenticated user', async function (assert) {
          // given
          server.create('framework', { id: 'framework', name: 'Pix' });
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

          // when
          await visit('/target-profiles/new');

          // then
          assert.strictEqual(currentURL(), '/target-profiles/new');
        });
      });

      module('when admin member has role "CERTIF"', function () {
        test('it should be redirect to Organizations page', async function (assert) {
          // given
          await authenticateAdminMemberWithRole({ isCertif: true })(server);

          // when
          await visit('/target-profiles/new');

          // then
          assert.strictEqual(currentURL(), '/organizations/list');
        });
      });
    });
  });

  module('target profile creation', function (hooks) {
    hooks.beforeEach(async function () {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      createLearningContent(server);
    });

    test('it should create the target profile', async function (assert) {
      // given
      server.get('/admin/frameworks', (schema) => schema.frameworks.all());
      const screen = await visit('/target-profiles/list');
      await clickByName('Nouveau profil cible');
      await fillByLabel('Nom (obligatoire) :', 'Un profil cible, et vite !');
      await fillByLabel("Identifiant de l'organisation de référence :", 1);
      await fillByLabel('Référentiel :', 'Pi');
      const otherFrameworkChoice = screen.getByLabelText('Pix + Cuisine');
      await click(otherFrameworkChoice);
      await _selectLearningContent(screen);

      // when
      await clickByName('Créer le profil cible');

      // then
      assert.strictEqual(currentURL(), '/target-profiles/1/details');
      await _unfoldLearningContent();
      assert.dom(screen.getByRole('heading', { name: 'Un profil cible, et vite !', level: 2 })).exists();
      let isMobileCompliant = screen.getByTestId('mobile-compliant-tube_f1_a1_c1_th1_tu1').getAttribute('aria-label');
      let isTabletCompliant = screen.getByTestId('tablet-compliant-tube_f1_a1_c1_th1_tu1').getAttribute('aria-label');
      assert.deepEqual(
        screen.getByTestId('title-tube_f1_a1_c1_th1_tu1').innerText,
        'tube_f1_a1_c1_th1_tu1 name : tube_f1_a1_c1_th1_tu1 practicalTitle'
      );
      assert.deepEqual(screen.getByTestId('level-tube_f1_a1_c1_th1_tu1').innerText, '8');
      assert.deepEqual(isMobileCompliant, 'compatible mobile');
      assert.deepEqual(isTabletCompliant, 'incompatible tablette');

      isMobileCompliant = screen.getByTestId('mobile-compliant-tube_f1_a1_c1_th1_tu2').getAttribute('aria-label');
      isTabletCompliant = screen.getByTestId('tablet-compliant-tube_f1_a1_c1_th1_tu2').getAttribute('aria-label');
      assert.deepEqual(
        screen.getByTestId('title-tube_f1_a1_c1_th1_tu2').innerText,
        'tube_f1_a1_c1_th1_tu2 name : tube_f1_a1_c1_th1_tu2 practicalTitle'
      );
      assert.deepEqual(screen.getByTestId('level-tube_f1_a1_c1_th1_tu2').innerText, '8');
      assert.deepEqual(isMobileCompliant, 'incompatible mobile');
      assert.deepEqual(isTabletCompliant, 'compatible tablette');

      isMobileCompliant = screen.getByTestId('mobile-compliant-tube_f1_a2_c1_th1_tu1').getAttribute('aria-label');
      isTabletCompliant = screen.getByTestId('tablet-compliant-tube_f1_a2_c1_th1_tu1').getAttribute('aria-label');
      assert.deepEqual(
        screen.getByTestId('title-tube_f1_a2_c1_th1_tu1').innerText,
        'tube_f1_a2_c1_th1_tu1 name : tube_f1_a2_c1_th1_tu1 practicalTitle'
      );
      assert.deepEqual(screen.getByTestId('level-tube_f1_a2_c1_th1_tu1').innerText, '2');
      assert.deepEqual(isMobileCompliant, 'compatible mobile');
      assert.deepEqual(isTabletCompliant, 'compatible tablette');

      isMobileCompliant = screen.getByTestId('mobile-compliant-tube_f2_a1_c1_th1_tu1').getAttribute('aria-label');
      isTabletCompliant = screen.getByTestId('tablet-compliant-tube_f2_a1_c1_th1_tu1').getAttribute('aria-label');
      assert.deepEqual(
        screen.getByTestId('title-tube_f2_a1_c1_th1_tu1').innerText,
        'tube_f2_a1_c1_th1_tu1 name : tube_f2_a1_c1_th1_tu1 practicalTitle'
      );
      assert.deepEqual(screen.getByTestId('level-tube_f2_a1_c1_th1_tu1').innerText, '8');
      assert.deepEqual(isMobileCompliant, 'incompatible mobile');
      assert.deepEqual(isTabletCompliant, 'incompatible tablette');
    });
  });
});

async function _unfoldLearningContent() {
  await clickByName('area_f1_a1 code · area_f1_a1 title');
  await clickByName('area_f1_a2 code · area_f1_a2 title');
  await clickByName('area_f2_a1 code · area_f2_a1 title');
  await clickByName('competence_f1_a1_c1 index competence_f1_a1_c1 name');
  await clickByName('competence_f1_a2_c1 index competence_f1_a2_c1 name');
  await clickByName('competence_f2_a1_c1 index competence_f2_a1_c1 name');
}

async function _selectLearningContent(screen) {
  await clickByName('area_f1_a1 code · area_f1_a1 title');
  await clickByName('competence_f1_a1_c1 index competence_f1_a1_c1 name');
  await clickByName('thematic_f1_a1_c1_th1 name');
  await clickByName('area_f1_a2 code · area_f1_a2 title');
  await clickByName('competence_f1_a2_c1 index competence_f1_a2_c1 name');
  await clickByName('tube_f1_a2_c1_th1_tu1 name : tube_f1_a2_c1_th1_tu1 practicalTitle');

  await click(
    screen.getByRole('button', { name: 'Sélection du niveau du sujet suivant : tube_f1_a2_c1_th1_tu1 practicalTitle' })
  );
  await screen.findByRole('listbox');
  await click(screen.getByRole('option', { name: '2' }));

  await clickByName('area_f2_a1 code · area_f2_a1 title');
  await clickByName('competence_f2_a1_c1 index competence_f2_a1_c1 name');
  await clickByName('thematic_f2_a1_c1_th1 name');
}
