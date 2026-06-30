import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import AttachedOrganizations from 'pix-admin/components/certification-centers/attached-organizations';
import setupIntlRenderingTest from 'pix-admin/tests/helpers/setup-intl-rendering';
import { module, test } from 'qunit';

module('Integration | Component | certification-centers/attached-organizations', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when there is no attached organizations', function () {
    test('it displays an empty message', async function (assert) {
      // given
      const attachedOrganizations = [];

      // when
      const screen = await render(
        <template><AttachedOrganizations @attachedOrganizations={{attachedOrganizations}} /></template>,
      );

      // then
      assert.dom(screen.getByText(t('components.certification-centers.attached-organizations.empty'))).exists();
    });
  });

  module('when there are attached organizations', function () {
    test('it displays the table with caption and column headers', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const organization = store.createRecord('attached-organization', {
        id: '123',
        name: 'Organization Pix',
        externalId: 'EXT-456',
      });
      const attachedOrganizations = [organization];

      // when
      const screen = await render(
        <template><AttachedOrganizations @attachedOrganizations={{attachedOrganizations}} /></template>,
      );

      // then
      assert.dom(
        screen.getByRole('table', { name: t('components.certification-centers.attached-organizations.table.caption') }),
      );

      assert.dom(
        screen.getByRole('columnheader', {
          name: t('components.certification-centers.attached-organizations.table.headers.id'),
        }),
      );
      assert.dom(
        screen.getByRole('columnheader', {
          name: t('components.certification-centers.attached-organizations.table.headers.name'),
        }),
      );
      assert.dom(
        screen.getByRole('columnheader', {
          name: t('components.certification-centers.attached-organizations.table.headers.external-id'),
        }),
      );

      assert.dom(screen.getByRole('cell', { name: '123' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Organization Pix' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'EXT-456' })).exists();
    });

    test('it displays a link to the organization page', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const organization = store.createRecord('attached-organization', {
        id: '123',
        name: 'Organization Pix',
        externalId: 'EXT-456',
      });
      const attachedOrganizations = [organization];

      // when
      const screen = await render(
        <template><AttachedOrganizations @attachedOrganizations={{attachedOrganizations}} /></template>,
      );

      // then
      assert.dom(screen.getByRole('link', { name: '123' })).hasAttribute('href', '/organizations/123');
    });
  });
});
