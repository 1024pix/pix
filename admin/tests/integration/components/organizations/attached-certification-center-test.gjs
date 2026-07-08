import { render, within } from '@1024pix/ember-testing-library';
import { click, fillIn, triggerEvent } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl/test-support';
import AttachedCertificationCenter from 'pix-admin/components/organizations/attached-certification-center';
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
  let store, requestManager, pixToast, router;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    requestManager = this.owner.lookup('service:requestManager');
    sinon.stub(requestManager, 'request');

    pixToast = this.owner.lookup('service:pixToast');
    sinon.stub(pixToast, 'sendSuccessNotification').resolves();
    sinon.stub(pixToast, 'sendErrorNotification').resolves();

    router = this.owner.lookup('service:router');
    sinon.stub(router, 'refresh');
  });

  module('when there is no attached certification center', function () {
    test('it displays a form to attach a certification center', async function (assert) {
      // given
      const attachedCertificationCenter = [];

      // when
      const screen = await render(
        <template>
          <AttachedCertificationCenter @attachedCertificationCenters={{attachedCertificationCenter}} />
        </template>,
      );

      // then
      assert
        .dom(
          screen.getByRole('form', {
            name: t('components.organizations.attached-certification-center.attach-form.name'),
          }),
        )
        .exists();
    });

    module('when attaching a certification center', function () {
      test('it sends a success notification and refreshes model', async function (assert) {
        // given
        requestManager.request.resolves({ response: { ok: true, status: 204 } });

        const organization = store.createRecord('organization');
        const attachedCertificationCenters = [];

        // when
        const screen = await render(
          <template>
            <AttachedCertificationCenter
              @attachedCertificationCenters={{attachedCertificationCenters}}
              @organization={{organization}}
            />
          </template>,
        );

        const input = screen.getByRole(
          'spinbutton',
          t('components.organizations.attached-certification-center.attach-form.input-label'),
        );
        await fillIn(input, '123');

        const validateButton = screen.getByRole('button', { name: t('common.actions.validate') });
        await click(validateButton);

        // then
        assert.ok(
          pixToast.sendSuccessNotification.calledWithExactly({
            message: t('components.organizations.attached-certification-center.notifications.attach-success'),
          }),
        );
        router.refresh.called;
      });

      module('error cases', function () {
        test('it sends an error notification if certification center does not exist', async function (assert) {
          // given
          const organization = store.createRecord('organization');
          const attachedCertificationCenters = [];

          requestManager.request.rejects({
            errors: [{ code: 'NON_EXISTING_CERTIFICATION_CENTER', meta: { certificationCenterId: '1' } }],
          });

          // when
          const screen = await render(
            <template>
              <AttachedCertificationCenter
                @attachedCertificationCenters={{attachedCertificationCenters}}
                @organization={{organization}}
              />
            </template>,
          );

          const form = screen.getByRole('form');
          await triggerEvent(form, 'submit');

          // then
          assert.ok(
            pixToast.sendErrorNotification.calledWithExactly({
              message: t(
                'components.organizations.attached-certification-center.notifications.errors.NON_EXISTING_CERTIFICATION_CENTER',
                { certificationCenterId: '1' },
              ),
            }),
          );
        });

        test('it sends an error notification if certification center is already attached', async function (assert) {
          // given
          const organization = store.createRecord('organization');
          const attachedCertificationCenters = [];

          requestManager.request.rejects({
            errors: [
              {
                code: 'ALREADY_ATTACHED_CERTIFICATION_CENTER',
                meta: { certificationCenterId: '1', alreadyAttachedOrganizationId: '42' },
              },
            ],
          });

          // when
          const screen = await render(
            <template>
              <AttachedCertificationCenter
                @attachedCertificationCenters={{attachedCertificationCenters}}
                @organization={{organization}}
              />
            </template>,
          );

          const form = screen.getByRole('form');
          await triggerEvent(form, 'submit');

          // then
          assert.ok(
            pixToast.sendErrorNotification.calledWithExactly({
              message: t(
                'components.organizations.attached-certification-center.notifications.errors.ALREADY_ATTACHED_CERTIFICATION_CENTER',
                { certificationCenterId: '1', alreadyAttachedOrganizationId: '42' },
              ),
            }),
          );
        });
      });
    });

    module('when there are attached certification centers', function () {
      test('it does not display a form to attach a certification center', async function (assert) {
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
        assert.dom(screen.queryByRole('form', { name: 'Rattacher un centre de certification' })).doesNotExist();
      });

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

      module('when detaching a certification center', function () {
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
          const modal = await screen.findByRole('dialog');

          // then
          assert
            .dom(
              within(modal).getByRole('heading', {
                name: t('components.organizations.attached-certification-center.actions.detach.confirm-modal-title'),
              }),
            )
            .exists();

          assert.dom(within(modal).getByText('Centre Pix')).exists();
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
          assert.true(requestManager.request.called);
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
});
