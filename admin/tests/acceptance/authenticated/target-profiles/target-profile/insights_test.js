import { click, currentURL, fillIn, findAll, visit } from '@ember/test-helpers';
import { visit as visitScreen } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { module, test } from 'qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | Target Profiles | Target Profile | Insights', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let currentUser;
  let targetProfile;

  hooks.beforeEach(async function () {
    currentUser = server.create('user');
    await createAuthenticateSession({ userId: currentUser.id });

    targetProfile = this.server.create('target-profile', { name: 'Profil cible du ghetto' });
    this.server.create('badge', { id: 100, title: 'My badge', imageUrl: 'http://images.pix.fr/badges/ag2r.svg' });
    this.server.create('badge', { id: 101, title: 'My badge 2', imageUrl: 'http://images.pix.fr/badges/ag2r.svg' });

    this.server.create('stage', { title: 'My stage' });
  });

  test('should list badges and stages', async function (assert) {
    await visit(`/target-profiles/${targetProfile.id}/insights`);

    assert.dom('[data-test="badges-table"] tbody tr').exists({ count: 2 });
    assert.dom('[data-test="badges-table"] tbody').containsText('My badge');
    assert.dom('[data-test="badges-table"] tbody').containsText('My badge 2');

    assert.dom('.stages-table tbody tr').exists({ count: 1 });
    assert.dom('.stages-table tbody').containsText('My stage');
  });

  module('badges', function () {
    test('should be able to see the details of a badge', async function (assert) {
      await visit(`/target-profiles/${targetProfile.id}/insights`);

      await click('.insights__section:nth-child(1) a');

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/badges/100');
    });

    test('should redirect to badge creation page on link click', async function (assert) {
      await visit(`/target-profiles/${targetProfile.id}/insights`);

      await click('[data-test="badges-creation-redirect"]');

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), `/target-profiles/${targetProfile.id}/badges/new`);
    });

    test('should redirect to insights parent page when badge creation is cancelled', async function (assert) {
      // given
      await visit(`/target-profiles/${targetProfile.id}/badges/new`);

      // when
      await click('[data-test="badge-form-cancel-button"]');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), `/target-profiles/${targetProfile.id}/insights`);
    });

    test('should redirect to insights parent page when badge creation is done', async function (assert) {
      // given
      await visit(`/target-profiles/${targetProfile.id}/badges/new`);

      // when
      await fillIn('input#badge-key', 'clé_du_badge');
      await fillIn('input#image-name', 'nom_de_limage');
      await fillIn('input#alt-message', 'texte alternatif à l‘image');
      await fillIn('input#campaignParticipationThreshold', '65');
      await click('[data-test="badge-form-submit-button"]');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), `/target-profiles/${targetProfile.id}/insights`);
    });
  });

  module('stages', function () {
    test('should be able to add a new stage', async function (assert) {
      const screen = await visitScreen(`/target-profiles/${targetProfile.id}/insights`);

      const stageCount = findAll('.insights__section:nth-child(2) tbody tr').length;
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(stageCount, 1);

      assert.dom(screen.queryByText('Enregistrer')).doesNotExist();

      await click("button[data-test='Nouveau palier']");

      assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      const newTableRowCount = findAll('.insights__section:nth-child(2) tbody tr').length;
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(newTableRowCount, 2);

      fillIn('.insights__section:nth-child(2) tbody tr td:nth-child(3) input', '0');
      fillIn('.insights__section:nth-child(2) tbody tr td:nth-child(4) input', 'My stage title');
      fillIn('.insights__section:nth-child(2) tbody tr td:nth-child(5) input', 'My stage message');

      await click('button[data-test="form-action-submit"]');
      assert.dom(screen.queryByText('Enregistrer')).doesNotExist();

      const newStageCount = findAll('.insights__section:nth-child(2) tbody tr').length;
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(newStageCount, 2);
    });

    test('should reset stage creation data after cancellation', async function (assert) {
      // when
      await visit(`/target-profiles/${targetProfile.id}/insights`);
      const stageCount = findAll('.insights__section:nth-child(2) tbody tr').length;
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(stageCount, 1);
      await click("button[data-test='Nouveau palier']");
      await click('button[data-test="form-action-cancel"]');

      // then
      const newStageCount = findAll('.insights__section:nth-child(2) tbody tr').length;
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(newStageCount, 1);
    });

    test('should remove one line of a new stage', async function (assert) {
      // when
      await visit(`/target-profiles/${targetProfile.id}/insights`);
      const stageCount = findAll('.insights__section:nth-child(2) tbody tr').length;
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(stageCount, 1);
      await click("button[data-test='Nouveau palier']");
      await click("button[data-test='Nouveau palier']");
      await click("button[aria-label='Supprimer palier']");

      // then
      const newStageCount = findAll('.insights__section:nth-child(2) tbody tr').length;
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(newStageCount, 2);
    });
  });
});
