import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Components | Campaigns | Assessment | Skill Review | Quit Results', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the evaluation results have been shared', function () {
    test('it should display a quit button link', async function (assert) {
      // when
      const screen = await render(hbs`<Campaigns::Assessment::SkillReview::QuitResults @isCampaignShared={{true}} />`);

      // then
      assert.ok(
        screen
          .getByRole('link', {
            name: 'Quitter',
          })
          .getAttribute('href')
          .includes('/'),
      );
    });
  });

  module('when the evaluation results have not been shared yet', function () {
    test('it should display a quit button', async function (assert) {
      // when
      const screen = await render(hbs`<Campaigns::Assessment::SkillReview::QuitResults @isCampaignShared={{false}} />`);

      // then
      assert.dom(screen.getByRole('button', { name: 'Quitter' })).exists();
    });

    module('when the quit button is clicked', function () {
      test('it should display a modal', async function (assert) {
        // given
        const screen = await render(
          hbs`<Campaigns::Assessment::SkillReview::QuitResults @isCampaignShared={{false}} />`,
        );

        // when
        await click(screen.getByRole('button', { name: 'Quitter' }));

        // then
        const modalTitle = await screen.findByRole('heading', {
          name: 'Oups, vous n’avez pas encore envoyé vos résultats !',
        });
        assert.dom(modalTitle).exists();
        assert.dom(screen.getByText(t('pages.evaluation-results.quit-results.modal.content-information')));
        assert.dom(screen.getByText(t('pages.evaluation-results.quit-results.modal.content-instruction')));
        assert.dom(
          screen.getByRole('button', {
            name: t('pages.evaluation-results.quit-results.modal.actions.cancel-to-share'),
          }),
        );
        assert.ok(
          screen
            .getByRole('link', {
              name: t('pages.evaluation-results.quit-results.modal.actions.quit-without-sharing'),
            })
            .getAttribute('href')
            .includes('authenticated'),
        );
      });
    });
  });
});
