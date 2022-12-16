import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | feedback-certification-section', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders', async function (assert) {
    await render(hbs`{{feedback-certification-section}}`);

    assert.ok(
      find('.feedback-certification-section__div')
        .textContent.trim()
        .includes(
          'Pour signaler un problème, appelez votre surveillant et communiquez-lui les informations suivantes :'
        )
    );
  });
});
