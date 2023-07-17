import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
// eslint-disable-next-line no-restricted-imports
import { find } from '@ember/test-helpers';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | feedback-certification-section', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders', async function (assert) {
    await render(hbs`<FeedbackCertificationSection />`);

    assert.ok(
      find('.feedback-certification-section__div')
        .textContent.trim()
        .includes(
          'Pour signaler un problème, appelez votre surveillant et communiquez-lui les informations suivantes :',
        ),
    );
  });
});
