import { visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click } from '@ember/test-helpers';

module('Acceptance | Challenge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('when user clicks on skip button', function () {
    test('displays answer modal', async function (assert) {
      const assessment = this.server.create('assessment');
      this.server.create('challenge');
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      await click(screen.getByRole('button', { name: 'Je passe' }));

      // then
      assert
        .dom(screen.getByText('Si tu passes l’activité, une autre activité plus simple te sera proposée.'))
        .exists();
    });
  });
});
