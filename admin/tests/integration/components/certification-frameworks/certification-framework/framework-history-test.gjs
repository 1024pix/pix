import { clickByName, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import FrameworkHistory from 'pix-admin/components/certification-frameworks/certification-framework/framework-history';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest, { t } from '../../../../helpers/setup-intl-rendering';

module(
  'Integration | Component | Complementary certifications/certification-framework | Framework history',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    let intl, store, pixToast, draftFrameworkItem, activeFrameworkItem, archivedFrameworkItem;
    const frameworkKey = 'CORE';
    hooks.beforeEach(function () {
      intl = this.owner.lookup('service:intl');
      store = this.owner.lookup('service:store');
      pixToast = this.owner.lookup('service:pixToast');

      draftFrameworkItem = {
        id: 999,
        startDate: null,
        expirationDate: null,
        assessmentDuration: 90,
        maximumAssessmentLength: 32,
        status: 'draft',
      };
      activeFrameworkItem = {
        id: 456,
        startDate: new Date('2023-10-10'),
        expirationDate: null,
        assessmentDuration: 90,
        maximumAssessmentLength: 32,
        status: 'active',
      };
      archivedFrameworkItem = {
        id: 123,
        startDate: new Date('2020-01-01'),
        expirationDate: new Date('2021-06-15'),
        assessmentDuration: 105,
        maximumAssessmentLength: 32,
        status: 'archived',
      };
    });

    test('it should display the framework history', async function (assert) {
      const certificationVersionSummaries = [draftFrameworkItem, activeFrameworkItem, archivedFrameworkItem].map(
        (item) => store.createRecord('certification-version-summary', item),
      );

      // when
      const screen = await render(
        <template>
          <FrameworkHistory
            @frameworkKey={{frameworkKey}}
            @certificationVersionSummaries={{certificationVersionSummaries}}
          />
        </template>,
      );

      // then
      assert
        .dom(
          screen.getByRole('table', {
            name: t('components.certification-frameworks.certification-framework.history.table.caption'),
          }),
        )
        .exists();

      assert.strictEqual(screen.getAllByRole('row').length, 4);

      assert.dom(screen.getByRole('cell', { name: `${draftFrameworkItem.id}` })).exists();
      assert
        .dom(screen.getByText(t('components.certification-frameworks.certification-framework.history.statuses.draft')))
        .hasClass('pix-tag--tertiary');

      assert.dom(screen.getByRole('cell', { name: `${activeFrameworkItem.id}` })).exists();
      assert.dom(screen.getByRole('cell', { name: intl.formatDate(activeFrameworkItem.startDate) })).exists();
      assert
        .dom(screen.getByText(t('components.certification-frameworks.certification-framework.history.statuses.active')))
        .hasClass('pix-tag--success');

      assert.dom(screen.getByRole('cell', { name: `${archivedFrameworkItem.id}` })).exists();
      assert.dom(screen.getByRole('cell', { name: intl.formatDate(archivedFrameworkItem.startDate) })).exists();
      assert.dom(screen.getByRole('cell', { name: intl.formatDate(archivedFrameworkItem.expirationDate) })).exists();
      assert
        .dom(
          screen.getByText(t('components.certification-frameworks.certification-framework.history.statuses.archived')),
        )
        .hasClass('pix-tag--secondary');
    });

    test('it opens the detail modal when clicking the view button', async function (assert) {
      // given
      sinon.stub(store, 'findRecord').resolves(store.createRecord('certification-version', { id: 999, scope: 'CORE' }));
      const certificationVersionSummaries = [draftFrameworkItem, activeFrameworkItem, archivedFrameworkItem].map(
        (item) => store.createRecord('certification-version-summary', item),
      );

      // when
      const screen = await render(
        <template>
          <FrameworkHistory
            @frameworkKey={{frameworkKey}}
            @certificationVersionSummaries={{certificationVersionSummaries}}
          />
        </template>,
      );

      await clickByName('Voir les détails de la version 999');

      // then
      sinon.assert.calledOnceWithExactly(store.findRecord, 'certification-version', '999');
      assert.dom(screen.getByRole('dialog')).exists();
      assert.dom(screen.getByRole('heading', { name: t('components.certification-frameworks.labels.CORE') })).exists();
    });

    test('it leaves detail modal opened after saving comments successfully', async function (assert) {
      // given
      const certificationVersion = store.createRecord('certification-version', {
        id: '456',
        startDate: new Date('2023-10-10'),
        assessmentDuration: 90,
        minimumAnswersRequiredForValidation: 20,
        maximumAssessmentLength: 32,
        comments: '',
        areas: [],
      });
      const certificationVersionSummaries = [draftFrameworkItem, activeFrameworkItem, archivedFrameworkItem].map(
        (item) => store.createRecord('certification-version-summary', item),
      );

      sinon.stub(certificationVersion, 'save').resolves();
      sinon.stub(store, 'findRecord').resolves(certificationVersion);
      sinon.stub(pixToast, 'sendSuccessNotification');

      const screen = await render(
        <template>
          <FrameworkHistory
            @frameworkKey={{frameworkKey}}
            @certificationVersionSummaries={{certificationVersionSummaries}}
          />
        </template>,
      );

      await clickByName('Voir les détails de la version 999');
      assert.dom(screen.getByRole('dialog')).exists();

      // when
      await click(screen.getByRole('button', { name: t('common.actions.save') }));

      // then
      assert.dom(screen.queryByRole('dialog')).exists();
    });

    module('deletion', function () {
      test('it should only be possible to delete Draft version', async function (assert) {
        const certificationVersionSummaries = [draftFrameworkItem, activeFrameworkItem, archivedFrameworkItem].map(
          (item) => store.createRecord('certification-version-summary', item),
        );
        const certificationVersion = store.createRecord('certification-version', { id: draftFrameworkItem.id });
        sinon.stub(store, 'findRecord').resolves(certificationVersion);

        // when
        const screen = await render(
          <template>
            <FrameworkHistory
              @frameworkKey={{frameworkKey}}
              @certificationVersionSummaries={{certificationVersionSummaries}}
            />
          </template>,
        );

        // then
        assert
          .dom(screen.getByRole('button', { name: 'Supprimer la version 999' }))
          .doesNotHaveAttribute('aria-disabled');
        assert.dom(screen.getByRole('button', { name: 'Supprimer la version 123' })).hasAttribute('aria-disabled');
        assert.dom(screen.getByRole('button', { name: 'Supprimer la version 456' })).hasAttribute('aria-disabled');

        await click(screen.getByRole('button', { name: 'Supprimer la version 999' }));
        assert.dom(screen.getByText('Confirmer la suppression')).exists();
      });

      module('when deletion is a success', function () {
        test('it should send a toast for feedback ', async function (assert) {
          sinon.stub(pixToast, 'sendSuccessNotification');
          const certificationVersion = store.createRecord('certification-version', { id: archivedFrameworkItem.id });
          sinon.stub(store, 'findRecord').resolves(certificationVersion);
          sinon.stub(store, 'queryRecord').resolves();
          sinon.stub(certificationVersion, 'destroyRecord').resolves();
          const certificationVersionSummaries = [draftFrameworkItem, activeFrameworkItem, archivedFrameworkItem].map(
            (item) => store.createRecord('certification-version-summary', item),
          );

          const screen = await render(
            <template>
              <FrameworkHistory
                @frameworkKey={{frameworkKey}}
                @certificationVersionSummaries={{certificationVersionSummaries}}
              />
            </template>,
          );

          // when
          await click(screen.getByRole('button', { name: 'Supprimer la version 999' }));
          await click(screen.getByText('Confirmer la suppression'));

          // then
          assert.ok(pixToast.sendSuccessNotification.called);
        });
      });

      module('when deletion is a error', function () {
        test('it should send a toast for feedback ', async function (assert) {
          sinon.stub(pixToast, 'sendErrorNotification');
          const certificationVersionSummaries = [draftFrameworkItem, activeFrameworkItem, archivedFrameworkItem].map(
            (item) => store.createRecord('certification-version-summary', item),
          );

          const certificationVersion = store.createRecord('certification-version', { id: archivedFrameworkItem.id });
          sinon.stub(store, 'findRecord').resolves(certificationVersion);
          sinon.stub(store, 'queryRecord').rejects();
          sinon.stub(certificationVersion, 'destroyRecord').rejects();

          const screen = await render(
            <template>
              <FrameworkHistory
                @frameworkKey={{frameworkKey}}
                @certificationVersionSummaries={{certificationVersionSummaries}}
              />
            </template>,
          );

          // when
          await click(screen.getByRole('button', { name: 'Supprimer la version 999' }));
          await click(screen.getByText('Confirmer la suppression'));

          // then
          assert.ok(pixToast.sendErrorNotification.called);
        });
      });
    });
  },
);
