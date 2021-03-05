import { click, fillIn, findAll, visit } from '@ember/test-helpers';
import { module, test, setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { createAuthenticateSession } from '../../../helpers/test-init';

module('Acceptance | authenticated/targets-profile/target-profile/insight', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let currentUser;
  let targetProfile;

  hooks.beforeEach(async function() {
    currentUser = server.create('user');
    await createAuthenticateSession({ userId: currentUser.id });

    targetProfile = this.server.create('target-profile', { name: 'Profil cible du ghetto' });
    this.server.create('badge', { title: 'My badge' });
    this.server.create('badge', { title: 'My badge 2' });

    this.server.create('stage', { title: 'My stage' });
  });

  test('should list badges and stages', async function(assert) {
    await visit(`/target-profiles/${targetProfile.id}/insight`);

    assert.contains('My badge');
    assert.contains('My stage');
  });

  test('should be able to add a new stage', async function(assert) {
    await visit(`/target-profiles/${targetProfile.id}/insight`);

    const stageCount = findAll('.insight__section:nth-child(2) tbody tr').length;
    assert.equal(stageCount, 1);

    assert.notContains('Enregistrer');

    await click('button[data-test=\'Nouveau palier\']');

    assert.contains('Enregistrer');
    assert.contains('Annuler');
    const newTableRowCount = findAll('.insight__section:nth-child(2) tbody tr').length;
    assert.equal(newTableRowCount, 2);

    fillIn('.insight__section:nth-child(2) tbody tr td:nth-child(3) input', '0');
    fillIn('.insight__section:nth-child(2) tbody tr td:nth-child(4) input', 'My stage title');
    fillIn('.insight__section:nth-child(2) tbody tr td:nth-child(5) input', 'My stage message');

    await click('button.form-action--submit');
    assert.notContains('Enregistrer');

    const newStageCount = findAll('.insight__section:nth-child(2) tbody tr').length;
    assert.equal(newStageCount, 2);
  });

  test('should reset stage creation data after cancellation', async function(assert) {

    // when
    await visit(`/target-profiles/${targetProfile.id}/insight`);
    const stageCount = findAll('.insight__section:nth-child(2) tbody tr').length;
    assert.equal(stageCount, 1);
    await click('button[data-test=\'Nouveau palier\']');
    await click('button.form-action--cancel');

    // then
    const newStageCount = findAll('.insight__section:nth-child(2) tbody tr').length;
    assert.equal(newStageCount, 1);
  });
});
