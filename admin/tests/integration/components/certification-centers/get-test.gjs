import { render, within } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import Get from 'pix-admin/components/certification-centers/get';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | certification-centers/get', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('it should display certification center name as title', async function (assert) {
    // given
    const certificationCenter = store.createRecord('certification-center', {
      name: 'Centre SCO',
      type: 'SCO',
      habilitations: [],
      createdAt: new Date('2023-07-27'),
    });

    // when
    const screen = await render(<template><Get @certificationCenter={{certificationCenter}} /></template>);

    // then
    assert.dom(screen.getByRole('heading', { name: 'Centre SCO' })).exists();
  });

  test('it should display navigation bar with links to navigate', async function (assert) {
    // given
    const certificationCenter = store.createRecord('certification-center', {
      name: 'Centre SCO',
      type: 'SCO',
      habilitations: [],
      createdAt: new Date('2023-07-27'),
    });

    // when
    const screen = await render(<template><Get @certificationCenter={{certificationCenter}} /></template>);

    // then
    const navigationBar = screen.getByRole('navigation', {
      name: t('pages.certification-centers.get.navbar.aria-label'),
    });

    assert
      .dom(within(navigationBar).getByRole('link', { name: t('pages.certification-centers.get.navbar.details') }))
      .exists();
    assert
      .dom(
        within(navigationBar).getByRole('link', {
          name: (text) => text.includes(t('pages.certification-centers.get.navbar.team')),
        }),
      )
      .exists();
    assert
      .dom(
        within(navigationBar).getByRole('link', {
          name: (text) => text.includes(t('pages.certification-centers.get.navbar.invitations')),
        }),
      )
      .exists();
    assert
      .dom(
        within(navigationBar).getByRole('link', {
          name: t('pages.certification-centers.get.navbar.attached-organizations'),
        }),
      )
      .exists();
  });

  module('when certification center is archived', function () {
    test('it should display information about who archived it and when', async function (assert) {
      // given
      const certificationCenter = store.createRecord('certification-center', {
        name: 'Centre SCO',
        type: 'SCO',
        habilitations: [],
        archivedAt: new Date('2026-07-20'),
        archivistFullName: 'Super Admin',
        createdAt: new Date('2023-07-27'),
      });

      // when
      const screen = await render(<template><Get @certificationCenter={{certificationCenter}} /></template>);

      // then
      assert
        .dom(
          screen.getByText(
            t('pages.certification-centers.information-view.is-archived-warning', {
              archivedAt: certificationCenter.archivedAtFormatDate,
              archivedBy: certificationCenter.archivistFullName,
            }),
          ),
        )
        .exists();
    });

    test('it should not display Team and Invitations tabs', async function (assert) {
      // given
      const certificationCenter = store.createRecord('certification-center', {
        name: 'Centre SCO',
        type: 'SCO',
        habilitations: [],
        archivedAt: new Date('2026-07-20'),
        archivistFullName: 'Super Admin',
        createdAt: new Date('2023-07-27'),
      });

      // when
      const screen = await render(<template><Get @certificationCenter={{certificationCenter}} /></template>);

      // then
      const navigationBar = screen.getByRole('navigation', {
        name: t('pages.certification-centers.get.navbar.aria-label'),
      });

      assert
        .dom(
          within(navigationBar).queryByRole('link', {
            name: (text) => text.includes(t('pages.certification-centers.get.navbar.team')),
          }),
        )
        .doesNotExist();

      assert
        .dom(
          within(navigationBar).queryByRole('link', {
            name: (text) => text.includes(t('pages.certification-centers.get.navbar.invitations')),
          }),
        )
        .doesNotExist();
    });
  });
});
