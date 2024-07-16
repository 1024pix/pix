import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import PlaceInfo from 'pix-orga/components/places/place-info';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Places | PlaceInfo', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should render', async function (assert) {
    // given
    const currentUser = { isSCOManagingStudents: false, isSUPManagingStudents: false };

    // when
    const screen = await render(<template><PlaceInfo @currentUser={{currentUser}} /></template>);

    // then
    assert.ok(screen.getByText(t('cards.place-info.message')));
    assert.ok(screen.getByText(t('cards.place-info.details')));
  });
  module('link', function () {
    test('it should link to sup participant page', async function (assert) {
      // given
      const currentUser = { isSUPManagingStudents: true };

      // when
      const screen = await render(<template><PlaceInfo @currentUser={{currentUser}} /></template>);
      const link = screen.getByRole('link', { name: t('cards.place-info.link') });

      // then
      assert.strictEqual(link.getAttribute('href'), '/etudiants');
    });

    test('it should link to sco participant page', async function (assert) {
      // given
      const currentUser = { isSCOManagingStudents: true };

      // when
      const screen = await render(<template><PlaceInfo @currentUser={{currentUser}} /></template>);
      const link = screen.getByRole('link', { name: t('cards.place-info.link') });

      // then
      assert.strictEqual(link.getAttribute('href'), '/eleves');
    });
    test('it should link to participant page', async function (assert) {
      // given
      const currentUser = {};

      // when
      const screen = await render(<template><PlaceInfo @currentUser={{currentUser}} /></template>);
      const link = screen.getByRole('link', { name: t('cards.place-info.link') });

      // then
      assert.strictEqual(link.getAttribute('href'), '/participants');
    });
  });
});
