import { visit } from '@1024pix/ember-testing-library';
// import { click } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { setupApplicationTest } from '../helpers';

module('Acceptance | Lesson workflow', function (hooks) {
  setupApplicationTest(hooks);
  module('when user click on continue button', function () {
    // test('redirects to next challenge', async function (assert) {
    //   const assessment = this.server.create('assessment');
    //   this.server.create('challenge', 'lesson', {
    //     timer: 0,
    //   });
    //   this.server.create('challenge', {
    //     id: 2,
    //     instruction: 'Nouvelle instruction',
    //   });
    //   // when
    //   const screen = await visit(`/assessments/${assessment.id}/challenges`);
    //   await click(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.continue') }));
    //
    //   // then
    //   assert.dom(screen.getByText('Nouvelle instruction')).exists();
    // });

    test('should disabled button for pass during a short time', async function (assert) {
      const assessment = this.server.create('assessment');
      this.server.create('challenge', 'lesson');
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);

      // then
      assert.dom(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.continue') })).isDisabled();
    });
  });
});
