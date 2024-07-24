import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import PlaceInfo from 'pix-orga/components/places/place-info';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Places | PlaceInfo', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should render occupied place with account', async function (assert) {
    // when
    const screen = await render(<template><PlaceInfo @hasAnonymousSeat={{false}} /></template>);

    // then
    const heading = t('cards.place-info.with-account.heading', { htmlSafe: true });
    const strippedHeading = heading.__string.replace(/<\/?[^>]+(>|$)/g, '');

    assert.ok(screen.getByRole('heading', { name: strippedHeading, level: 2 }));
    assert.ok(screen.getByText(t('cards.place-info.with-account.message-main')));
    assert.ok(screen.getByText(t('cards.place-info.with-account.message-description')));
  });

  test('it should render occupied place without account', async function (assert) {
    // when
    const screen = await render(<template><PlaceInfo @hasAnonymousSeat={{true}} /></template>);

    // then
    const heading = t('cards.place-info.with-account.heading', { htmlSafe: true });
    const strippedHeading = heading.__string.replace(/<\/?[^>]+(>|$)/g, '');

    assert.ok(screen.getByRole('heading', { name: strippedHeading, level: 2 }));
    assert.ok(screen.getByText(t('cards.place-info.with-account.message-main')));
    assert.ok(screen.getByText(t('cards.place-info.with-account.message-description')));

    const anonymousHeading = t('cards.place-info.without-account.heading', { htmlSafe: true });
    const strippedAnonymousHeading = anonymousHeading.__string.replace(/<\/?[^>]+(>|$)/g, '');

    assert.ok(screen.getByRole('heading', { name: strippedAnonymousHeading, level: 2 }));
    assert.ok(screen.getByText(t('cards.place-info.without-account.message-main')));
    assert.ok(screen.getByText(t('cards.place-info.without-account.message-description')));
  });
});
