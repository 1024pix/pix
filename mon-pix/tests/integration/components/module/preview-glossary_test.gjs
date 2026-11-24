import { render, within } from '@1024pix/ember-testing-library';
import ModulixPreviewGlossary from 'mon-pix/components/module/preview-glossary';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Preview Glossary', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display glossary words and definitions', async function (assert) {
    // given
    const glossary = [
      { words: ['chat', 'chats'], definition: '<p>Un <strong>félin</strong> domestique.</p>' },
      { words: ['Pix'], definition: '<p>Le service public en ligne.</p>' },
    ];

    // when
    const screen = await render(<template><ModulixPreviewGlossary @glossary={{glossary}} /></template>);

    // then
    assert.dom(screen.getByRole('heading', { name: t('pages.modulix.preview.glossary.title') })).exists();
    const terms = screen.getAllByRole('term');
    const definitions = screen.getAllByRole('definition');
    assert.strictEqual(terms.length, 2);
    assert.strictEqual(definitions.length, 2);
    assert.dom(terms[0]).hasText('chat, chats');
    assert.dom(definitions[0]).hasText('Un félin domestique.');
    assert.dom(within(definitions[0]).getByText('félin')).hasTagName('strong');
    assert.dom(terms[1]).hasText('Pix');
    assert.dom(definitions[1]).hasText('Le service public en ligne.');
  });

  test('should not display glossary when there is no glossary entry', async function (assert) {
    // given
    const glossary = [];

    // when
    const screen = await render(<template><ModulixPreviewGlossary @glossary={{glossary}} /></template>);

    // then
    assert.dom(screen.queryByRole('heading', { name: t('pages.modulix.preview.glossary.title') })).doesNotExist();
  });
});
