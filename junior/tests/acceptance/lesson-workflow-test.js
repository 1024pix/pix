import { visit } from '@1024pix/ember-testing-library';
// import { click } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { setupApplicationTest, t } from '../helpers';

module('Acceptance | Lesson workflow', function (hooks) {
  setupApplicationTest(hooks);
  module('when user click on continue button', function () {
    test('should disabled button for pass during a short time', async function (assert) {
      const assessment = this.server.create('assessment');
      this.server.create('challenge', 'lesson');
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);

      // then
      assert.dom(screen.getByRole('button', { name: t('pages.challenge.actions.continue') })).isDisabled();
    });
  });
});
