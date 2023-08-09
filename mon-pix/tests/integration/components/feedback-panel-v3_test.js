import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { click } from '@ember/test-helpers';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

module('Integration | Component | feedback-panel-v3', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Default rendering', function () {
    test('should not display the feedback panel', async function (assert) {
      // given & when
      const screen = await render(hbs`<FeedbackPanelV3 />`);

      // then
      assert.dom(screen.queryByText('Êtes-vous sûr(e) de vouloir signaler un problème ?')).doesNotExist();
    });

    module('when warning the invigilator', function () {
      test('should close the panel if the candidate decides to return to the challenge', async function (assert) {
        // given
        const disableChallengeItemActions = sinon.stub();
        this.set('disableChallengeActions', disableChallengeItemActions);
        const screen = await render(hbs`<FeedbackPanelV3 @disableChallengeActions={{this.disableChallengeActions}}/>`);

        // when
        await click(screen.getByRole('button', { name: 'Signaler un problème avec la question' }));
        assert.dom(screen.getByText('Êtes-vous sûr(e) de vouloir signaler un problème ?')).exists();

        await click(screen.getByRole('button', { name: "Non, je reviens à l'épreuve" }));

        // then
        assert.dom(screen.queryByText('Êtes-vous sûr(e) de vouloir signaler un problème ?')).doesNotExist();
      });
    });
  });
});
