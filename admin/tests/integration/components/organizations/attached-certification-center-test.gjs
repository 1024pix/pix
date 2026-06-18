import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import AttachedCertificationCenter from 'pix-admin/components/organizations/attached-certification-center';
import setupIntlRenderingTest from 'pix-admin/tests/helpers/setup-intl-rendering';
import { module, test } from 'qunit';

module('Integration | Component | organizations/attached-certification-center', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when there is no attached certification center', function () {
    test('it displays an empty message', async function (assert) {
      // given
      const attachedCertificationCenter = [];

      // when
      const screen = await render(
        <template>
          <AttachedCertificationCenter @attachedCertificationCenters={{attachedCertificationCenter}} />
        </template>,
      );

      // then
      assert.dom(screen.getByText(t('components.organizations.attached-certification-center.empty'))).exists();
    });
  });

  module('when there are attached certification centers', function () {
    test('it displays the table with caption and column headers', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificationCenter = store.createRecord('attached-certification-center', {
        id: '123',
        name: 'Centre Pix',
        externalId: 'EXT-456',
      });
      const attachedCertificationCenters = [certificationCenter];

      // when
      const screen = await render(
        <template>
          <AttachedCertificationCenter @attachedCertificationCenters={{attachedCertificationCenters}} />
        </template>,
      );

      // then
      assert
        .dom(
          screen.getByRole('table', {
            name: t('components.organizations.attached-certification-center.table.caption'),
          }),
        )
        .exists();
      assert
        .dom(
          screen.getByRole('columnheader', {
            name: t('components.organizations.attached-certification-center.table.headers.id'),
          }),
        )
        .exists();
      assert
        .dom(
          screen.getByRole('columnheader', {
            name: t('components.organizations.attached-certification-center.table.headers.name'),
          }),
        )
        .exists();
      assert
        .dom(
          screen.getByRole('columnheader', {
            name: t('components.organizations.attached-certification-center.table.headers.external-id'),
          }),
        )
        .exists();
    });

    test('it displays the certification centers in a table', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificationCenter = store.createRecord('attached-certification-center', {
        id: '123',
        name: 'Centre Pix',
        externalId: 'EXT-456',
      });
      const attachedCertificationCenter = [certificationCenter];

      // when
      const screen = await render(
        <template>
          <AttachedCertificationCenter @attachedCertificationCenters={{attachedCertificationCenter}} />
        </template>,
      );

      // then
      assert.dom(screen.getByRole('cell', { name: '123' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Centre Pix' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'EXT-456' })).exists();
    });

    test('it displays a link to the certification center page', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificationCenter = store.createRecord('attached-certification-center', {
        id: '123',
        name: 'Centre Pix',
        externalId: 'EXT-456',
      });
      const attachedCertificationCenter = [certificationCenter];

      // when
      const screen = await render(
        <template>
          <AttachedCertificationCenter @attachedCertificationCenters={{attachedCertificationCenter}} />
        </template>,
      );

      // then
      assert.dom(screen.getByRole('link', { name: '123' })).hasAttribute('href', '/certification-centers/123');
    });
  });
});
