import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl/test-support';
import AttachedCertificationCenter from 'pix-admin/components/organizations/attached-certification-center';
import ENV from 'pix-admin/config/environment';
import setupIntlRenderingTest from 'pix-admin/tests/helpers/setup-intl-rendering';
import { module, test } from 'qunit';
import sinon from 'sinon';

class State {
  @tracked attachedCertificationCenters;

  constructor(attachedCertificationCenters) {
    this.attachedCertificationCenters = attachedCertificationCenters;
  }
}

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
      assert
        .dom(
          screen.getByRole('columnheader', {
            name: t('components.organizations.attached-certification-center.table.headers.actions'),
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

    module('when detaching a certification center', function (hooks) {
      let requestManager;
      let pixToast;
      let router;

      hooks.beforeEach(function () {
        requestManager = this.owner.lookup('service:requestManager');
        sinon.stub(requestManager, 'request');

        pixToast = this.owner.lookup('service:pixToast');
        sinon.stub(pixToast, 'sendSuccessNotification').resolves();
        sinon.stub(pixToast, 'sendErrorNotification').resolves();

        router = this.owner.lookup('service:router');
        sinon.stub(router, 'refresh');
      });

      test('it opens a confirmation modal when clicking the detach button', async function (assert) {
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
            <AttachedCertificationCenter
              @attachedCertificationCenters={{attachedCertificationCenter}}
              @organizationId="42"
            />
          </template>,
        );
        await click(
          screen.getByRole('button', {
            name: t('components.organizations.attached-certification-center.actions.detach.button'),
          }),
        );
        await screen.findByRole('dialog');

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: t('components.organizations.attached-certification-center.actions.detach.confirm-modal-title'),
            }),
          )
          .exists();
      });

      test('it detaches the certification center and removes the table when confirming the modal', async function (assert) {
        // given
        requestManager.request.resolves();

        const store = this.owner.lookup('service:store');
        const certificationCenter = store.createRecord('attached-certification-center', {
          id: '123',
          name: 'Centre Pix',
          externalId: 'EXT-456',
        });
        const state = new State([certificationCenter]);
        router.refresh.callsFake(() => {
          state.attachedCertificationCenters = [];
        });

        const screen = await render(
          <template>
            <AttachedCertificationCenter
              @attachedCertificationCenters={{state.attachedCertificationCenters}}
              @organizationId="42"
            />
          </template>,
        );
        await click(
          screen.getByRole('button', {
            name: t('components.organizations.attached-certification-center.actions.detach.button'),
          }),
        );
        await screen.findByRole('dialog');
        await click(screen.getByRole('button', { name: t('common.actions.confirm') }));

        // then
        assert.true(
          requestManager.request.calledWith({
            url: `${ENV.APP.API_HOST}/api/admin/organizations/42/detach-certification-center`,
            method: 'POST',
          }),
        );
        assert.true(
          pixToast.sendSuccessNotification.calledWith({
            message: t('components.organizations.attached-certification-center.actions.detach.success'),
          }),
        );
        assert.dom(screen.queryByRole('table')).doesNotExist();
      });

      test('it displays an error notification and keeps the table when detaching fails', async function (assert) {
        // given
        requestManager.request.rejects();

        const store = this.owner.lookup('service:store');
        const certificationCenter = store.createRecord('attached-certification-center', {
          id: '123',
          name: 'Centre Pix',
          externalId: 'EXT-456',
        });
        const attachedCertificationCenter = [certificationCenter];

        const screen = await render(
          <template>
            <AttachedCertificationCenter
              @attachedCertificationCenters={{attachedCertificationCenter}}
              @organizationId="42"
            />
          </template>,
        );
        await click(
          screen.getByRole('button', {
            name: t('components.organizations.attached-certification-center.actions.detach.button'),
          }),
        );
        await screen.findByRole('dialog');
        await click(screen.getByRole('button', { name: t('common.actions.confirm') }));

        // then
        assert.true(
          pixToast.sendErrorNotification.calledWith({
            message: t('common.notifications.generic-error'),
          }),
        );
        assert.dom(screen.getByRole('table')).exists();
      });
    });
  });
});
