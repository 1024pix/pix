import { render } from '@1024pix/ember-testing-library';
import HeadInformationBlock from 'pix-admin/components/ui/head-information-block';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | ui/head-information-block', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it displays the title', async function (assert) {
    // when
    const screen = await render(<template><HeadInformationBlock @title="Mon titre" /></template>);

    // then
    assert.dom(screen.getByRole('heading', { name: 'Mon titre' })).exists();
  });

  test('it displays each optional block when provided', async function (assert) {
    // when
    const screen = await render(
      <template>
        <HeadInformationBlock @title="Mon titre">
          <:logo>Logo content</:logo>
          <:subtitle>Subtitle content</:subtitle>
          <:tagsSection>Tags content</:tagsSection>
          <:link>Link content</:link>
        </HeadInformationBlock>
      </template>,
    );

    //then
    assert.dom(screen.getByText('Logo content')).exists();
    assert.dom(screen.getByText('Subtitle content')).exists();
    assert.dom(screen.getByText('Tags content')).exists();
    assert.dom(screen.getByText('Link content')).exists();
  });

  test('it does not render optional block containers when not provided', async function (assert) {
    // when
    await render(<template><HeadInformationBlock @title="Mon titre" /></template>);

    // then
    assert.dom('.head-information-block__logo-container').doesNotExist();
    assert.dom('.head-information-block__link').doesNotExist();
  });
});
