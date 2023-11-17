import { clickByName, visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click } from '@ember/test-helpers';
import { setupIntl } from 'ember-intl/test-support';

module('Acceptance | Challenge workflow', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('when user click on skip button', function () {
    test('redirects to next challenge', async function (assert) {
      const assessment = this.server.create('assessment');
      this.server.create('challenge', { id: 1 });
      this.server.create('challenge', { id: 2, instruction: 'challenge alternatif' });
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      await click(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.skip') }));

      // then
      assert.dom(screen.getByText('challenge alternatif')).exists();
    });
  });

  module('when user has not answered yet', function () {
    test('disable "Je vérifie" button', async function (assert) {
      const assessment = this.server.create('assessment');
      this.server.create('challenge');
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);

      // then
      assert.dom(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.check') })).isDisabled();
    });
  });

  module('when user click on continue button with correct answer', function () {
    test('displays congratulation message & remove skip button', async function (assert) {
      const assessment = this.server.create('assessment');
      this.server.create('challenge', 'QCU');
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      await click(screen.getByRole('radio', { name: 'Profil 1' }));
      await click(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.check') }));

      // then
      assert.dom(screen.getByText(this.intl.t('pages.challenge.messages.correct-answer'))).exists();
      assert.dom(screen.queryByRole('button', { name: this.intl.t('pages.challenge.actions.skip') })).doesNotExist();
    });

    test('redirects to next challenge after clicking on "Je continue" button', async function (assert) {
      const assessment = this.server.create('assessment');
      this.server.create('challenge', 'QCU');
      this.server.create('challenge', {
        id: 2,
        instruction: 'Nouvelle instruction',
      });
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      await click(screen.getByRole('radio', { name: 'Profil 1' }));
      await click(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.check') }));
      await click(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.continue') }));

      // then
      assert.dom(screen.getByText('Nouvelle instruction')).exists();
    });
  });

  module('when user click on continue button with bad answer', function () {
    test('displays message for wrong answer & remove skip button', async function (assert) {
      const assessment = this.server.create('assessment');
      this.server.create('challenge', 'QROCWithSelect');
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      await clickByName('saladAriaLabel');
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'bad-answer' }));
      await click(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.check') }));

      // then
      assert.dom(screen.getByText(this.intl.t('pages.challenge.messages.wrong-answer'))).exists();
      assert.dom(screen.queryByRole('button', { name: this.intl.t('pages.challenge.actions.skip') })).doesNotExist();
    });

    test('redirects to next challenge after clicking on "Je continue" button', async function (assert) {
      const assessment = this.server.create('assessment');
      this.server.create('challenge', 'QROCWithSelect');
      this.server.create('challenge', {
        id: 2,
        instruction: 'Nouvelle instruction',
      });
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      await clickByName('saladAriaLabel');
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'bad-answer' }));
      await click(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.check') }));
      await click(screen.getByRole('button', { name: this.intl.t('pages.challenge.actions.continue') }));

      // then
      assert.dom(screen.getByText('Nouvelle instruction')).exists();
    });
  });
});
