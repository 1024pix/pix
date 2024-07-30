import { render, within } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | feedback-certification-section', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders', async function (assert) {
    // given & when
    const screen = await render(hbs`<FeedbackCertificationSection />`);

    // then
    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');
    assert.strictEqual(items[0].textContent.trim(), "votre numéro de certification (en haut à droite de l'écran)");
    assert.strictEqual(items[1].textContent.trim(), "le numéro de la question (en haut à droite de l'écran)");
    assert.strictEqual(items[2].textContent.trim(), 'le problème rencontré');

    assert
      .dom(
        screen.getByText(
          'Pour signaler un problème, appelez votre surveillant et communiquez-lui les informations suivantes :',
        ),
      )
      .exists();
  });
});
