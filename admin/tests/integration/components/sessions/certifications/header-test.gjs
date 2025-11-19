import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { fireEvent } from '@testing-library/dom';
import { t } from 'ember-intl/test-support';
import CertificationsHeader from 'pix-admin/components/sessions/certifications/header';
import { FINALIZED, PROCESSED } from 'pix-admin/models/session';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | certifications/header', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  test('should display a title', async function (assert) {
    // when
    class SessionStub extends Service {}
    this.owner.register('service:accessControl', SessionStub);
    const screen = await render(<template><CertificationsHeader /></template>);

    // then
    assert.dom(screen.getByRole('heading', { level: 2, name: 'Certifications' })).exists();
  });

  module('When session is published', function () {
    test('it should display a specific tag information', async function (assert) {
      // given
      class SessionStub extends Service {
        hasAccessToCertificationActionsScope = false;
      }
      this.owner.register('service:accessControl', SessionStub);
      const session = store.createRecord('session', { status: PROCESSED, publishedAt: '2023-05-21' });

      const juryCertificationSummaries = [];

      // when
      const screen = await render(
        <template>
          <CertificationsHeader @session={{session}} @juryCertificationSummaries={{juryCertificationSummaries}} />
        </template>,
      );

      // then
      assert.dom(screen.getByText(t('pages.certifications.session-state.published'))).exists();
    });
  });

  module('When session is not published', function () {
    test('it should display a specific tag information', async function (assert) {
      // given
      class SessionStub extends Service {
        hasAccessToCertificationActionsScope = false;
      }
      this.owner.register('service:accessControl', SessionStub);
      const session = store.createRecord('session', { status: FINALIZED, publishedAt: null });

      const juryCertificationSummaries = [];

      // when
      const screen = await render(
        <template>
          <CertificationsHeader @session={{session}} @juryCertificationSummaries={{juryCertificationSummaries}} />
        </template>,
      );

      // then
      assert.dom(screen.getByText(t('pages.certifications.session-state.not-published'))).exists();
    });
  });

  module('When user has not access to the certification session', function () {
    test('it should not show the publication button', async function (assert) {
      // given
      class SessionStub extends Service {
        hasAccessToCertificationActionsScope = false;
      }
      this.owner.register('service:accessControl', SessionStub);

      // when
      const screen = await render(<template><CertificationsHeader /></template>);

      // then
      assert.dom(screen.queryByRole('button')).doesNotExist();
    });
  });

  module('when user has access to the certification session', function (hooks) {
    hooks.beforeEach(function () {
      class SessionStub extends Service {
        hasAccessToCertificationActionsScope = true;
      }
      this.owner.register('service:accessControl', SessionStub);
    });

    module('when session is published', function () {
      test('should display an unpublication button', async function (assert) {
        // given
        const session = store.createRecord('session', { publishedAt: new Date() });

        // when
        const screen = await render(<template><CertificationsHeader @session={{session}} /></template>);

        // then
        assert.dom(screen.getByRole('button', { name: 'Dépublier la session' })).exists();
      });
    });

    module('when session is not published', function () {
      module('when the session is not finalized', function () {
        test('should display a disabled publication button with a tooltip', async function (assert) {
          // given
          const session = store.createRecord('session', { status: 'created', publishedAt: null });

          const juryCertificationSummaries = [];

          // when
          const screen = await render(
            <template>
              <CertificationsHeader @session={{session}} @juryCertificationSummaries={{juryCertificationSummaries}} />
            </template>,
          );

          // then
          assert.dom(screen.getByRole('button', { name: 'Publier la session' })).hasAttribute('aria-disabled');

          fireEvent.mouseOver(screen.getByRole('button', { name: 'Publier la session' }));
          const tooltipText =
            "Vous ne pouvez pas publier la session tant qu'elle n'est pas finalisée ou qu'il reste des certifications en erreur.";
          assert.dom(screen.getByText(tooltipText)).exists();
        });
      });

      module('when there are no jury certification summaries', function () {
        test('should display a disabled publication button', async function (assert) {
          // given
          const session = store.createRecord('session', { publishedAt: null });

          const juryCertificationSummaries = [];

          // when
          const screen = await render(
            <template>
              <CertificationsHeader @session={{session}} @juryCertificationSummaries={{juryCertificationSummaries}} />
            </template>,
          );

          // then
          assert.dom(screen.getByRole('button', { name: 'Publier la session' })).hasAttribute('aria-disabled');
        });
      });

      module('when there is only invalid jury certification summaries', function () {
        module('when the jury certification summary is cancelled', function () {
          test('should display a disabled publication button', async function (assert) {
            // given
            const session = store.createRecord('session', { publishedAt: null });

            const juryCertificationSummaries = [
              store.createRecord('jury-certification-summary', { status: 'cancelled' }),
            ];

            // when
            const screen = await render(
              <template>
                <CertificationsHeader @session={{session}} @juryCertificationSummaries={{juryCertificationSummaries}} />
              </template>,
            );

            // then
            assert.dom(screen.getByRole('button', { name: 'Publier la session' })).hasAttribute('aria-disabled');
          });
        });

        module('when the jury certification summary is on error', function () {
          test('should display a disabled publication button', async function (assert) {
            // given
            const session = store.createRecord('session', { publishedAt: null });

            const juryCertificationSummaries = [store.createRecord('jury-certification-summary', { status: 'error' })];

            // when
            const screen = await render(
              <template>
                <CertificationsHeader @session={{session}} @juryCertificationSummaries={{juryCertificationSummaries}} />
              </template>,
            );

            // then
            assert.dom(screen.getByRole('button', { name: 'Publier la session' })).hasAttribute('aria-disabled');
          });
        });
      });

      module('when there is only valid jury certification summaries', function () {
        test('should display an enabled publication button', async function (assert) {
          // given
          const session = store.createRecord('session', { publishedAt: null, status: 'finalized' });

          const juryCertificationSummaries = [
            store.createRecord('jury-certification-summary', { status: 'validated' }),
          ];

          // when
          const screen = await render(
            <template>
              <CertificationsHeader @session={{session}} @juryCertificationSummaries={{juryCertificationSummaries}} />
            </template>,
          );

          // then
          assert.dom(screen.getByRole('button', { name: 'Publier la session' })).doesNotHaveAttribute('aria-disabled');
        });

        module('when confirmation modal is displayed', function () {
          test('can cancel publication', async function (assert) {
            // given
            const publishSession = sinon.stub();
            const session = store.createRecord('session', { publishedAt: null, status: 'finalized' });

            const juryCertificationSummaries = [
              store.createRecord('jury-certification-summary', { status: 'validated' }),
            ];

            // when
            const screen = await render(
              <template>
                <CertificationsHeader
                  @session={{session}}
                  @juryCertificationSummaries={{juryCertificationSummaries}}
                  @publishSession={{publishSession}}
                />
              </template>,
            );
            const publishButton = screen.getByRole('button', { name: 'Publier la session' });
            await click(publishButton);

            const cancelButton = await screen.findByRole('button', { name: 'Annuler' });
            await click(cancelButton);

            // then
            assert.ok(publishSession.notCalled);
          });

          test('can confirm publication', async function (assert) {
            // given
            const publishSession = sinon.stub();
            const session = store.createRecord('session', { publishedAt: null, status: 'finalized' });

            const juryCertificationSummaries = [
              store.createRecord('jury-certification-summary', { status: 'validated' }),
            ];

            // when
            const screen = await render(
              <template>
                <CertificationsHeader
                  @session={{session}}
                  @juryCertificationSummaries={{juryCertificationSummaries}}
                  @publishSession={{publishSession}}
                />
              </template>,
            );
            const publishButton = screen.getByRole('button', { name: 'Publier la session' });
            await click(publishButton);

            const confirmButton = await screen.findByRole('button', { name: 'Confirmer' });
            await click(confirmButton);

            // then
            assert.ok(publishSession.calledOnce);
          });
        });
      });
    });
  });
});
