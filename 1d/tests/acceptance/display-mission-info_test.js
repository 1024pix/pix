import { visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import identifyLearner from '../helpers/identify-learner';

module('Acceptance | Display informations about the mission', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test('displays mission page', async function (assert) {
    // given
    identifyLearner(this.owner);
    const mission = this.server.create('mission');
    // when
    const screen = await visit(`/missions/${mission.id}`);
    // then
    assert.dom(screen.getByText('Connaître la notion de données personnelles et savoir les protéger')).exists();
    assert.dom(screen.getByText(this.intl.t('pages.missions.start-page.start-mission')));
    assert.dom(`[href="/missions/${mission.id}/resume"]`).exists();
  });
});
