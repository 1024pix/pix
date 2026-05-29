import { fireEvent, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import CertificationInformationGlobalActions from 'pix-admin/components/certifications/certification/informations/global-actions';
import { assessmentResultStatus } from 'pix-admin/models/certification';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest, { t } from '../../../../../helpers/setup-intl-rendering';
import { waitForDialogClose } from '../../../../../helpers/wait-for';

module('Integration | Component | Certifications | Certification | Information | Global actions', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  function createFinalizedSession() {
    return store.createRecord('session', { finalizedAt: new Date() });
  }

  function createNonFinalizedSession() {
    return store.createRecord('session', { finalizedAt: null });
  }

  function renderGlobalActions(certification, session) {
    return render(
      <template>
        <CertificationInformationGlobalActions @certification={{certification}} @session={{session}} />
      </template>,
    );
  }

  function setupNotificationStub(owner, type = 'sendErrorNotification') {
    const notificationStub = sinon.stub();
    class NotificationsStub extends Service {
      [type] = notificationStub;
    }
    owner.register('service:pixToast', NotificationsStub);
    return notificationStub;
  }

  test('should display user details page link', async function (assert) {
    // given
    const certification = store.createRecord('certification', { userId: 1 });
    const session = store.createRecord('session', {});

    // when
    const screen = await renderGlobalActions(certification, session);

    // then
    const userDetailsLink = screen.getByRole('link', {
      name: t('components.certifications.global-actions.user-details-link'),
    });
    assert.ok(userDetailsLink.href.endsWith(`/users/${certification.userId}`));
  });

  module('cancel button', function () {
    module('when session is finalized and not published', function () {
      module('when certification is not rejected for fraud', function () {
        test('displays a cancel button', async function (assert) {
          // given
          const certification = store.createRecord('certification', {
            userId: 1,
            status: assessmentResultStatus.VALIDATED,
            isPublished: false,
          });
          const session = createFinalizedSession();

          // when
          const screen = await renderGlobalActions(certification, session);

          // then
          assert
            .dom(screen.getByRole('button', { name: t('components.certifications.global-actions.cancel.button') }))
            .exists();
        });
      });

      module('when certification is rejected for fraud', function () {
        test('does not display a cancel button', async function (assert) {
          // given
          const certification = store.createRecord('certification', {
            userId: 1,
            status: assessmentResultStatus.REJECTED,
            isRejectedForFraud: true,
            isPublished: false,
          });
          const session = createFinalizedSession();

          // when
          const screen = await renderGlobalActions(certification, session);

          // then
          assert
            .dom(screen.queryByRole('button', { name: t('components.certifications.global-actions.cancel.button') }))
            .doesNotExist();
        });
      });
    });

    module('when session is not finalized', function () {
      test('does not display a cancel button', async function (assert) {
        // given
        const certification = store.createRecord('certification', {
          userId: 1,
          status: assessmentResultStatus.VALIDATED,
          isPublished: false,
        });
        const session = createNonFinalizedSession();

        // when
        const screen = await renderGlobalActions(certification, session);

        // then
        assert
          .dom(screen.queryByRole('button', { name: t('components.certifications.global-actions.cancel.button') }))
          .doesNotExist();
      });
    });

    module('when certification is published', function () {
      test('does not display a cancel button', async function (assert) {
        // given
        const certification = store.createRecord('certification', {
          userId: 1,
          status: assessmentResultStatus.VALIDATED,
          isPublished: true,
        });
        const session = createFinalizedSession();

        // when
        const screen = await renderGlobalActions(certification, session);

        // then
        assert
          .dom(screen.queryByRole('button', { name: t('components.certifications.global-actions.cancel.button') }))
          .doesNotExist();
      });
    });

    module('when button is displayed', function (hooks) {
      let screen;
      const modalTitle = "Confirmer l'annulation de la certification";
      const modalMessage =
        'Êtes-vous sûr·e de vouloir annuler cette certification ? Cliquez sur confirmer pour poursuivre.';

      hooks.beforeEach(async function () {
        // given
        const certification = store.createRecord('certification', {
          id: '1',
          userId: 1,
          status: assessmentResultStatus.VALIDATED,
          isPublished: false,
          save: sinon.stub(),
          reload: sinon.stub(),
        });
        const session = createFinalizedSession();

        // when
        screen = await renderGlobalActions(certification, session);
      });

      test('displays confirmation modal on click', async function (assert) {
        // when
        await fireEvent.click(
          screen.getByRole('button', { name: t('components.certifications.global-actions.cancel.button') }),
        );
        await screen.findByRole('dialog');

        // then
        assert.dom(screen.getByText(modalTitle)).exists();
        assert.dom(screen.getByText(modalMessage)).exists();
        assert.dom(screen.getByRole('button', { name: t('common.actions.confirm') })).exists();
        assert.dom(screen.getByRole('button', { name: t('common.actions.cancel') })).exists();
      });

      module('when modal is confirmed', function () {
        test('performs action and close modal on success', async function (assert) {
          // given
          const currentCertification = store.peekRecord('certification', 1);

          // when
          await fireEvent.click(
            screen.getByRole('button', { name: t('components.certifications.global-actions.cancel.button') }),
          );
          await screen.findByRole('dialog');
          await fireEvent.click(screen.getByRole('button', { name: t('common.actions.confirm') }));
          await waitForDialogClose();

          // then
          sinon.assert.calledWith(currentCertification.save, {
            adapterOptions: { isCertificationCancel: true },
          });
          assert.ok(currentCertification.reload.calledOnce);
          assert.dom(screen.queryByRole('button', { name: t('common.actions.confirm') })).doesNotExist();
        });

        test('displays notification and close modal on error', async function (assert) {
          // given
          const notificationStub = setupNotificationStub(this.owner);
          const currentCertification = store.peekRecord('certification', 1);
          currentCertification.save.rejects();

          // when
          await fireEvent.click(
            screen.getByRole('button', { name: t('components.certifications.global-actions.cancel.button') }),
          );
          await screen.findByRole('dialog');
          await fireEvent.click(screen.getByRole('button', { name: t('common.actions.confirm') }));
          await waitForDialogClose();

          // then
          sinon.assert.calledWith(notificationStub, {
            message: t('components.certifications.global-actions.cancel.error-message'),
          });
          assert.dom(screen.queryByRole('button', { name: t('common.actions.confirm') })).doesNotExist();
        });
      });

      test('closes modal on cancellation', async function (assert) {
        // given
        const currentCertification = store.peekRecord('certification', 1);

        // when
        await fireEvent.click(
          screen.getByRole('button', { name: t('components.certifications.global-actions.cancel.button') }),
        );
        await screen.findByRole('dialog');
        await fireEvent.click(screen.getByRole('button', { name: t('common.actions.cancel') }));
        await waitForDialogClose();

        // then
        assert.ok(currentCertification.save.notCalled);
        assert.ok(currentCertification.reload.notCalled);
        assert.dom(screen.queryByRole('button', { name: t('common.actions.cancel') })).doesNotExist();
      });
    });
  });

  module('uncancel button', function () {
    module('when session is finalized and not published', function () {
      let screen;

      module('when certification is cancelled', function (hooks) {
        const modalTitle = 'Confirmer la désannulation de la certification';
        const modalMessage =
          'Êtes-vous sûr·e de vouloir désannuler cette certification ? Cliquez sur confirmer pour poursuivre.';

        hooks.beforeEach(async function () {
          // given
          const certification = store.createRecord('certification', {
            id: '2',
            userId: 1,
            status: assessmentResultStatus.CANCELLED,
            isPublished: false,
            save: sinon.stub(),
            reload: sinon.stub(),
          });
          const session = createFinalizedSession();

          // when
          screen = await renderGlobalActions(certification, session);
        });

        test('displays an uncancel button', async function (assert) {
          // then
          assert
            .dom(screen.getByRole('button', { name: t('components.certifications.global-actions.uncancel.button') }))
            .exists();
        });

        test('on cancel button click, displays a confirmation modal', async function (assert) {
          // when
          await fireEvent.click(
            screen.getByRole('button', { name: t('components.certifications.global-actions.uncancel.button') }),
          );

          await screen.findByRole('dialog');

          // then
          assert.dom(screen.getByText(modalTitle)).exists();
          assert.dom(screen.getByText(modalMessage)).exists();
          assert.dom(screen.getByRole('button', { name: t('common.actions.confirm') })).exists();
          assert.dom(screen.getByRole('button', { name: t('common.actions.cancel') })).exists();
        });

        module('on modal confirmation', function () {
          test('uncancels the certification and closes the modal', async function (assert) {
            // given
            const currentCertification = store.peekRecord('certification', 2);

            // when
            await fireEvent.click(
              screen.getByRole('button', { name: t('components.certifications.global-actions.uncancel.button') }),
            );

            await screen.findByRole('dialog');

            await fireEvent.click(screen.getByRole('button', { name: t('common.actions.confirm') }));

            await waitForDialogClose();

            // then
            sinon.assert.calledWith(currentCertification.save, {
              adapterOptions: { isCertificationUncancel: true },
            });
            assert.ok(currentCertification.reload.calledOnce);
            assert.dom(screen.queryByRole('button', { name: t('common.actions.confirm') })).doesNotExist();
          });

          test('on error, displays a notification and closes the modal', async function (assert) {
            // given
            const notificationStub = setupNotificationStub(this.owner);

            const currentCertification = store.peekRecord('certification', 2);
            currentCertification.save.rejects();

            // when
            await fireEvent.click(
              screen.getByRole('button', { name: t('components.certifications.global-actions.uncancel.button') }),
            );
            await screen.findByRole('dialog');
            await fireEvent.click(screen.getByRole('button', { name: t('common.actions.confirm') }));
            await waitForDialogClose();

            // then
            sinon.assert.calledWith(notificationStub, {
              message: t('components.certifications.global-actions.uncancel.error-message'),
            });
            assert.dom(screen.queryByRole('button', { name: t('common.actions.confirm') })).doesNotExist();
          });
        });

        test('on modal cancellation, closes the modal', async function (assert) {
          // given
          const currentCertification = store.peekRecord('certification', 2);

          // when
          await fireEvent.click(
            screen.getByRole('button', { name: t('components.certifications.global-actions.uncancel.button') }),
          );

          await screen.findByRole('dialog');

          await fireEvent.click(screen.getByRole('button', { name: t('common.actions.cancel') }));

          await waitForDialogClose();

          // then
          assert.ok(currentCertification.save.notCalled);
          assert.ok(currentCertification.reload.notCalled);
          assert.dom(screen.queryByRole('button', { name: t('common.actions.cancel') })).doesNotExist();
        });
      });
    });

    module('when certification is not cancelled', function () {
      test('does not display an uncancel button', async function (assert) {
        // given
        const certification = store.createRecord('certification', {
          id: '1',
          userId: 1,
          status: assessmentResultStatus.VALIDATED,
          isPublished: false,
          save: sinon.stub(),
          reload: sinon.stub(),
        });
        const session = createFinalizedSession();

        // when
        const screen = await renderGlobalActions(certification, session);

        // then
        assert
          .dom(screen.queryByRole('button', { name: t('components.certifications.global-actions.uncancel.button') }))
          .doesNotExist();
      });
    });

    module('when session is not finalized', function () {
      test('does not display an uncancel button', async function (assert) {
        // given
        const certification = store.createRecord('certification', {
          userId: 1,
          status: assessmentResultStatus.VALIDATED,
          isPublished: false,
        });
        const session = createNonFinalizedSession();

        // when
        const screen = await renderGlobalActions(certification, session);

        // then
        assert
          .dom(screen.queryByRole('button', { name: t('components.certifications.global-actions.uncancel.button') }))
          .doesNotExist();
      });
    });

    module('when certification is published', function () {
      test('does not display a uncancel button', async function (assert) {
        // given
        const certification = store.createRecord('certification', {
          userId: 1,
          status: assessmentResultStatus.VALIDATED,
          isPublished: true,
        });
        const session = createFinalizedSession();

        // when
        const screen = await renderGlobalActions(certification, session);

        // then
        assert
          .dom(screen.queryByRole('button', { name: t('components.certifications.global-actions.uncancel.button') }))
          .doesNotExist();
      });
    });
  });

  module('reject button', function () {
    module('when session is finalized and not published', function () {
      module('when certification is validated', function () {
        test('displays a reject button', async function (assert) {
          // given
          const certification = store.createRecord('certification', {
            userId: 1,
            status: assessmentResultStatus.VALIDATED,
            isPublished: false,
          });
          const session = createFinalizedSession();

          // when
          const screen = await renderGlobalActions(certification, session);

          // then
          assert
            .dom(screen.getByRole('button', { name: t('components.certifications.global-actions.reject.button') }))
            .exists();
        });
      });

      module('when certification is rejected due to lack of answers', function () {
        test('displays a reject button', async function (assert) {
          // given
          const certification = store.createRecord('certification', {
            userId: 1,
            status: assessmentResultStatus.REJECTED,
            isPublished: false,
          });
          const session = createFinalizedSession();

          // when
          const screen = await renderGlobalActions(certification, session);

          // then
          assert
            .dom(screen.queryByRole('button', { name: t('components.certifications.global-actions.reject.button') }))
            .exists();
        });
      });
    });

    module('when certification status is cancelled', function () {
      test('does not display a reject button', async function (assert) {
        // given
        const certification = store.createRecord('certification', {
          userId: 1,
          status: assessmentResultStatus.CANCELLED,
          isPublished: false,
        });
        const session = createFinalizedSession();

        // when
        const screen = await renderGlobalActions(certification, session);

        // then
        assert
          .dom(screen.queryByRole('button', { name: t('components.certifications.global-actions.reject.button') }))
          .doesNotExist();
      });
    });

    module('when session is not finalized', function () {
      test('does not display a reject button', async function (assert) {
        // given
        const certification = store.createRecord('certification', {
          userId: 1,
          status: assessmentResultStatus.VALIDATED,
          isPublished: false,
        });
        const session = createNonFinalizedSession();

        // when
        const screen = await renderGlobalActions(certification, session);

        // then
        assert
          .dom(screen.queryByRole('button', { name: t('components.certifications.global-actions.reject.button') }))
          .doesNotExist();
      });
    });

    module('when certification is published', function () {
      test('does not display a reject button', async function (assert) {
        // given
        const certification = store.createRecord('certification', {
          userId: 1,
          status: assessmentResultStatus.VALIDATED,
          isPublished: true,
        });
        const session = createFinalizedSession();

        // when
        const screen = await renderGlobalActions(certification, session);

        // then
        assert
          .dom(screen.queryByRole('button', { name: t('components.certifications.global-actions.reject.button') }))
          .doesNotExist();
      });
    });

    module('when reject button is displayed', function (hooks) {
      let screen;
      const modalTitle = 'Confirmer le rejet de la certification';
      const modalMessage =
        'Êtes-vous sûr·e de vouloir rejeter cette certification ? Cliquez sur confirmer pour poursuivre.';

      hooks.beforeEach(async function () {
        // given
        const certification = store.createRecord('certification', {
          id: '1',
          userId: 1,
          status: assessmentResultStatus.VALIDATED,
          isPublished: false,
          save: sinon.stub(),
          reload: sinon.stub(),
        });
        const session = createFinalizedSession();

        // when
        screen = await renderGlobalActions(certification, session);
      });

      test('displays confirmation modal on click', async function (assert) {
        // when
        await fireEvent.click(
          screen.getByRole('button', { name: t('components.certifications.global-actions.reject.button') }),
        );
        await screen.findByRole('dialog');

        // then
        assert.dom(screen.getByText(modalTitle)).exists();
        assert.dom(screen.getByText(modalMessage)).exists();
        assert.dom(screen.getByRole('button', { name: t('common.actions.confirm') })).exists();
        assert.dom(screen.getByRole('button', { name: t('common.actions.cancel') })).exists();
      });

      module('when modal is confirmed', function () {
        test('performs action and closes modal on success', async function (assert) {
          // given
          const currentCertification = store.peekRecord('certification', 1);

          // when
          await fireEvent.click(
            screen.getByRole('button', { name: t('components.certifications.global-actions.reject.button') }),
          );
          await screen.findByRole('dialog');
          await fireEvent.click(screen.getByRole('button', { name: t('common.actions.confirm') }));
          await waitForDialogClose();

          // then
          sinon.assert.calledWith(currentCertification.save, {
            adapterOptions: { isCertificationReject: true },
          });
          assert.ok(currentCertification.reload.calledOnce);
          assert.dom(screen.queryByRole('button', { name: t('common.actions.confirm') })).doesNotExist();
        });

        test('displays notification and closes modal on error', async function (assert) {
          // given
          const notificationStub = setupNotificationStub(this.owner);
          const currentCertification = store.peekRecord('certification', 1);
          currentCertification.save.rejects();

          // when
          await fireEvent.click(
            screen.getByRole('button', { name: t('components.certifications.global-actions.reject.button') }),
          );
          await screen.findByRole('dialog');
          await fireEvent.click(screen.getByRole('button', { name: t('common.actions.confirm') }));
          await waitForDialogClose();

          // then
          sinon.assert.calledWith(notificationStub, {
            message: t('components.certifications.global-actions.reject.error-message'),
          });
          assert.dom(screen.queryByRole('button', { name: t('common.actions.confirm') })).doesNotExist();
        });
      });

      test('closes modal on cancellation', async function (assert) {
        // given
        const currentCertification = store.peekRecord('certification', 1);

        // when
        await fireEvent.click(
          screen.getByRole('button', { name: t('components.certifications.global-actions.reject.button') }),
        );
        await screen.findByRole('dialog');
        await fireEvent.click(screen.getByRole('button', { name: t('common.actions.cancel') }));
        await waitForDialogClose();

        // then
        assert.ok(currentCertification.save.notCalled);
        assert.ok(currentCertification.reload.notCalled);
        assert.dom(screen.queryByRole('button', { name: t('common.actions.cancel') })).doesNotExist();
      });
    });
  });

  module('unreject button', function () {
    module('when the certification is rejected for fraud', function (hooks) {
      let screen;

      const modalTitle = "Confirmer l'annulation du rejet de la certification";
      const modalMessage =
        'Êtes-vous sûr·e de vouloir annuler le rejet de cette certification ? Cliquez sur confirmer pour poursuivre.';

      hooks.beforeEach(async function () {
        // given
        const certification = store.createRecord('certification', {
          id: '1',
          userId: 1,
          status: assessmentResultStatus.REJECTED,
          isRejectedForFraud: true,
          save: sinon.stub(),
          reload: sinon.stub(),
        });
        const session = createFinalizedSession();

        // when
        screen = await renderGlobalActions(certification, session);
      });

      test('displays an unreject button', async function (assert) {
        // then
        assert
          .dom(screen.getByRole('button', { name: t('components.certifications.global-actions.unreject.button') }))
          .exists();
      });

      test('on unreject button click, displays a confirmation modal', async function (assert) {
        // when
        await fireEvent.click(
          screen.getByRole('button', { name: t('components.certifications.global-actions.unreject.button') }),
        );

        await screen.findByRole('dialog');

        // then
        assert.dom(screen.getByText(modalTitle)).exists();
        assert.dom(screen.getByText(modalMessage)).exists();
        assert.dom(screen.getByRole('button', { name: t('common.actions.confirm') })).exists();
        assert.dom(screen.getByRole('button', { name: t('common.actions.cancel') })).exists();
      });

      module('on modal confirmation', function () {
        test('unrejects the certification and closes the modal', async function (assert) {
          // given
          const currentCertification = store.peekRecord('certification', 1);

          // when
          await fireEvent.click(
            screen.getByRole('button', { name: t('components.certifications.global-actions.unreject.button') }),
          );

          await screen.findByRole('dialog');

          await fireEvent.click(screen.getByRole('button', { name: t('common.actions.confirm') }));

          await waitForDialogClose();

          // then
          sinon.assert.calledWith(currentCertification.save, {
            adapterOptions: { isCertificationUnreject: true },
          });
          assert.ok(currentCertification.reload.calledOnce);
          assert.dom(screen.queryByRole('button', { name: t('common.actions.confirm') })).doesNotExist();
        });

        test('on error, displays a notification and closes the modal', async function (assert) {
          // given
          const notificationStub = setupNotificationStub(this.owner);

          const currentCertification = store.peekRecord('certification', 1);
          currentCertification.save.rejects();

          // when
          await fireEvent.click(
            screen.getByRole('button', { name: t('components.certifications.global-actions.unreject.button') }),
          );
          await screen.findByRole('dialog');
          await fireEvent.click(screen.getByRole('button', { name: t('common.actions.confirm') }));
          await waitForDialogClose();

          // then
          sinon.assert.calledWith(notificationStub, {
            message: t('components.certifications.global-actions.unreject.error-message'),
          });
          assert.dom(screen.queryByRole('button', { name: t('common.actions.confirm') })).doesNotExist();
        });
      });

      test('on modal cancellation, closes the modal', async function (assert) {
        // given
        const currentCertification = store.peekRecord('certification', 1);

        // when
        await fireEvent.click(
          screen.getByRole('button', { name: t('components.certifications.global-actions.unreject.button') }),
        );

        await screen.findByRole('dialog');

        await fireEvent.click(screen.getByRole('button', { name: t('common.actions.cancel') }));

        await waitForDialogClose();

        // then
        assert.ok(currentCertification.save.notCalled);
        assert.ok(currentCertification.reload.notCalled);
        assert.dom(screen.queryByRole('button', { name: t('common.actions.cancel') })).doesNotExist();
      });
    });

    module('when session is not finalized', function () {
      test('does not display an unreject button', async function (assert) {
        // given
        const certification = store.createRecord('certification', {
          userId: 1,
          status: assessmentResultStatus.VALIDATED,
          isPublished: false,
        });
        const session = createNonFinalizedSession();

        // when
        const screen = await renderGlobalActions(certification, session);

        // then
        assert
          .dom(screen.queryByRole('button', { name: t('components.certifications.global-actions.unreject.button') }))
          .doesNotExist();
      });
    });

    module('when certification is published', function () {
      test('does not display an unreject button', async function (assert) {
        // given
        const certification = store.createRecord('certification', {
          userId: 1,
          status: assessmentResultStatus.VALIDATED,
          isPublished: true,
        });
        const session = createFinalizedSession();

        // when
        const screen = await renderGlobalActions(certification, session);

        // then
        assert
          .dom(screen.queryByRole('button', { name: t('components.certifications.global-actions.unreject.button') }))
          .doesNotExist();
      });
    });
  });

  module('rescore button', function () {
    module('when should display', function () {
      module('when certification is validated, session is finalized and not published', function () {
        test('should display a rescoring button', async function (assert) {
          // given
          const certification = store.createRecord('certification', {
            userId: 1,
            status: assessmentResultStatus.VALIDATED,
            isPublished: false,
          });
          const session = createFinalizedSession();

          // when
          const screen = await renderGlobalActions(certification, session);

          // then
          assert
            .dom(screen.getByRole('button', { name: t('components.certifications.global-actions.rescoring.button') }))
            .exists();
        });
      });

      module('when certification has error status, session is finalized and not published', function () {
        test('should display a rescoring button', async function (assert) {
          // given
          const certification = store.createRecord('certification', {
            userId: 1,
            status: assessmentResultStatus.ERROR,
            isPublished: false,
          });
          const session = createFinalizedSession();

          // when
          const screen = await renderGlobalActions(certification, session);

          // then
          assert
            .dom(screen.getByRole('button', { name: t('components.certifications.global-actions.rescoring.button') }))
            .exists();
        });
      });
      module('when certification has no status, session is finalized and not published', function () {
        test('should display a rescore button', async function (assert) {
          // given
          const certification = store.createRecord('certification', {
            userId: 1,
            status: null,
            isPublished: false,
          });
          const session = createFinalizedSession();

          // when
          const screen = await renderGlobalActions(certification, session);

          // then
          assert
            .dom(screen.getByRole('button', { name: t('components.certifications.global-actions.rescoring.button') }))
            .exists();
        });
      });

      module('when certification status is cancelled', function () {
        test('should display a rescoring button', async function (assert) {
          // given
          const certification = store.createRecord('certification', {
            userId: 1,
            status: assessmentResultStatus.CANCELLED,
            isPublished: false,
          });
          const session = createFinalizedSession();

          // when
          const screen = await renderGlobalActions(certification, session);

          // then
          assert
            .dom(screen.queryByRole('button', { name: t('components.certifications.global-actions.rescoring.button') }))
            .exists();
        });
      });

      module('when certification status is rejected', function () {
        test('should display a rescoring button', async function (assert) {
          // given
          const certification = store.createRecord('certification', {
            userId: 1,
            status: assessmentResultStatus.REJECTED,
            isPublished: false,
          });
          const session = createFinalizedSession();

          // when
          const screen = await renderGlobalActions(certification, session);

          // then
          assert
            .dom(screen.queryByRole('button', { name: t('components.certifications.global-actions.rescoring.button') }))
            .exists();
        });
      });
    });

    module('when should not display', function () {
      module('when session is not finalized', function () {
        test('should not display a rescoring button', async function (assert) {
          // given
          const certification = store.createRecord('certification', {
            userId: 1,
            status: assessmentResultStatus.VALIDATED,
            isPublished: false,
          });
          const session = createNonFinalizedSession();

          // when
          const screen = await renderGlobalActions(certification, session);

          // then
          assert
            .dom(screen.queryByRole('button', { name: t('components.certifications.global-actions.rescoring.button') }))
            .doesNotExist();
        });
      });

      module('when certification is published', function () {
        test('should not display a rescoring button', async function (assert) {
          // given
          const certification = store.createRecord('certification', {
            userId: 1,
            status: assessmentResultStatus.VALIDATED,
            isPublished: true,
          });
          const session = createFinalizedSession();

          // when
          const screen = await renderGlobalActions(certification, session);

          // then
          assert
            .dom(screen.queryByRole('button', { name: t('components.certifications.global-actions.rescoring.button') }))
            .doesNotExist();
        });
      });
    });

    module('when button is displayed', function (hooks) {
      hooks.afterEach(function () {
        sinon.restore();
      });

      test('should trigger rescoring and show success notification', async function (assert) {
        assert.expect(1);

        // given
        const certification = store.createRecord('certification', {
          id: '123',
          userId: 1,
          status: assessmentResultStatus.VALIDATED,
          isPublished: false,
          reload: sinon.stub(),
        });
        const session = createFinalizedSession();

        const rescoreCertificationStub = sinon.stub().resolves();
        const adapter = { rescoreCertification: rescoreCertificationStub };

        const originalAdapterFor = store.adapterFor;
        store.adapterFor = sinon.stub().withArgs('certification').returns(adapter);

        const notificationStub = setupNotificationStub(this.owner, 'sendSuccessNotification');

        try {
          // when
          const screen = await renderGlobalActions(certification, session);
          await fireEvent.click(
            screen.getByRole('button', { name: t('components.certifications.global-actions.rescoring.button') }),
          );

          // then
          sinon.assert.calledOnce(rescoreCertificationStub);
          sinon.assert.calledWith(rescoreCertificationStub, { certificationCourseId: '123' });
          sinon.assert.calledWith(notificationStub, {
            message: t('components.certifications.global-actions.rescoring.success-message'),
          });
          assert.ok(certification.reload.calledOnce);
        } finally {
          store.adapterFor = originalAdapterFor;
        }
      });

      test('should show error notification when rescoring fails', async function (assert) {
        assert.expect(1);

        // given
        const certification = store.createRecord('certification', {
          id: '123',
          userId: 1,
          status: assessmentResultStatus.VALIDATED,
          isPublished: false,
          reload: sinon.stub(),
        });
        const session = createFinalizedSession();

        const rescoreCertificationStub = sinon.stub().rejects();
        const adapter = { rescoreCertification: rescoreCertificationStub };

        const originalAdapterFor = store.adapterFor;
        store.adapterFor = sinon.stub().withArgs('certification').returns(adapter);

        const notificationStub = setupNotificationStub(this.owner);

        try {
          // when
          const screen = await renderGlobalActions(certification, session);
          await fireEvent.click(
            screen.getByRole('button', { name: t('components.certifications.global-actions.rescoring.button') }),
          );

          // Wait for async error handling
          await new Promise((resolve) => setTimeout(resolve, 100));

          // then
          assert.ok(notificationStub.called, 'notification should have been called');
          sinon.assert.calledWith(notificationStub, {
            message: t('components.certifications.global-actions.rescoring.error-message'),
          });
        } finally {
          store.adapterFor = originalAdapterFor;
        }
      });
    });
  });
});
