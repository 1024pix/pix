import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import FrameworkHistory from 'pix-admin/components/certification-frameworks/item/framework/framework-history';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest, { t } from '../../../../../helpers/setup-intl-rendering';

module('Integration | Component | Complementary certifications/Item/Framework | Framework history', function (hooks) {
  setupIntlRenderingTest(hooks);

  let intl, store, pixToast, frameworkItem1, frameworkItem2, frameworkItem3;

  hooks.beforeEach(function () {
    intl = this.owner.lookup('service:intl');
    store = this.owner.lookup('service:store');
    pixToast = this.owner.lookup('service:pixToast');

    frameworkItem1 = {
      id: 456,
      startDate: new Date('2023-10-10'),
      expirationDate: null,
      assessmentDuration: 90,
      maximumAssessmentLength: 32,
      status: 'ACTIVE',
    };
    frameworkItem2 = {
      id: 123,
      startDate: new Date('2020-01-01'),
      expirationDate: new Date('2021-06-15'),
      assessmentDuration: 105,
      maximumAssessmentLength: 32,
      status: 'ARCHIVED',
    };
    frameworkItem3 = {
      id: 999,
      startDate: null,
      expirationDate: null,
      assessmentDuration: 90,
      maximumAssessmentLength: 32,
      status: 'DRAFT',
    };

    sinon.stub(store, 'queryRecord').resolves(
      store.createRecord('framework-history', {
        history: [frameworkItem1, frameworkItem2, frameworkItem3],
      }),
    );
  });

  test('it should display the framework history', async function (assert) {
    // when
    const screen = await render(<template><FrameworkHistory @frameworkKey="DROIT" /></template>);

    // then
    assert
      .dom(
        screen.getByRole('table', {
          name: t('components.certification-frameworks.item.framework.history.table.caption'),
        }),
      )
      .exists();

    assert.strictEqual(screen.getAllByRole('row').length, 4);

    assert.dom(screen.getByRole('cell', { name: `${frameworkItem1.id}` })).exists();
    assert.dom(screen.getByRole('cell', { name: intl.formatDate(frameworkItem1.startDate) })).exists();
    assert
      .dom(screen.getByText(t('components.certification-frameworks.item.framework.history.statuses.ACTIVE')))
      .hasClass('pix-tag--success');

    assert.dom(screen.getByRole('cell', { name: `${frameworkItem2.id}` })).exists();
    assert.dom(screen.getByRole('cell', { name: intl.formatDate(frameworkItem2.startDate) })).exists();
    assert
      .dom(screen.getByText(t('components.certification-frameworks.item.framework.history.statuses.ARCHIVED')))
      .hasClass('pix-tag--secondary');
  });

  test('it opens the detail modal when clicking the view button', async function (assert) {
    // given
    sinon.stub(store, 'findRecord').resolves(store.createRecord('certification-version'));

    // when
    const screen = await render(<template><FrameworkHistory @frameworkKey="CORE" /></template>);

    await click(
      screen.getAllByRole('button', {
        name: t('components.certification-frameworks.item.framework.history.table.actions.view'),
      })[0],
    );

    // then
    sinon.assert.calledOnceWithExactly(store.findRecord, 'certification-version', frameworkItem1.id);
    assert.dom(screen.getByRole('dialog')).exists();
  });

  test('it displays the framework label as the modal title', async function (assert) {
    // given
    sinon.stub(store, 'findRecord').resolves(store.createRecord('certification-version'));

    // when
    const screen = await render(<template><FrameworkHistory @frameworkKey="CORE" /></template>);

    await click(
      screen.getAllByRole('button', {
        name: t('components.certification-frameworks.item.framework.history.table.actions.view'),
      })[0],
    );

    // then
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
    sinon.stub(certificationVersion, 'save').resolves();
    sinon.stub(store, 'findRecord').resolves(certificationVersion);
    sinon.stub(pixToast, 'sendSuccessNotification');

    const screen = await render(<template><FrameworkHistory @frameworkKey="CORE" /></template>);

    await click(
      screen.getAllByRole('button', {
        name: t('components.certification-frameworks.item.framework.history.table.actions.view'),
      })[0],
    );
    assert.dom(screen.getByRole('dialog')).exists();

    // when
    await click(screen.getByRole('button', { name: t('common.actions.save') }));

    // then
    assert.dom(screen.queryByRole('dialog')).exists();
  });

  module('deletion', function (hooks) {
    let deleteButtonName;
    hooks.beforeEach(() => {
      deleteButtonName = t('components.certification-frameworks.item.framework.history.table.actions.delete');
    });

    test('it should not be possible to delete an ACTIVE or ARCHIVED version', async function (assert) {
      // when
      const screen = await render(<template><FrameworkHistory @frameworkKey="CORE" /></template>);

      // then
      assert.strictEqual(screen.getAllByRole('button', { name: deleteButtonName }).length, 3);

      assert.dom(screen.getAllByRole('button', { name: deleteButtonName })[0]).hasAttribute('aria-disabled');
      assert.dom(screen.getAllByRole('button', { name: deleteButtonName })[1]).hasAttribute('aria-disabled');
      assert.dom(screen.getAllByRole('button', { name: deleteButtonName })[2]).doesNotHaveAttribute('aria-disabled');
    });

    test('it should be possible to delete a DRAFT version', async function (assert) {
      // given
      const certificationVersion = store.createRecord('certification-version', { id: frameworkItem3.id });
      sinon.stub(store, 'findRecord').resolves(certificationVersion);
      sinon.stub(certificationVersion, 'destroyRecord').resolves();

      const screen = await render(<template><FrameworkHistory @frameworkKey="CORE" /></template>);

      // when
      await click(screen.getAllByRole('button', { name: deleteButtonName })[2]);
      await click(screen.getByText('Confirmer la suppression'));

      // then
      assert.strictEqual(screen.getAllByRole('row').length, 3);
      assert.dom(screen.queryByRole('cell', { name: `${frameworkItem3.id}` })).doesNotExist();
    });

    module('when deletion is a success', function () {
      test('it should send a toast for feedback ', async function (assert) {
        sinon.stub(pixToast, 'sendSuccessNotification');
        const certificationVersion = store.createRecord('certification-version', { id: frameworkItem3.id });
        sinon.stub(store, 'findRecord').resolves(certificationVersion);
        sinon.stub(certificationVersion, 'destroyRecord').resolves();

        const screen = await render(<template><FrameworkHistory @frameworkKey="CORE" /></template>);

        // when
        await click(screen.getAllByRole('button', { name: deleteButtonName })[2]);
        await click(screen.getByText('Confirmer la suppression'));

        // then
        assert.ok(pixToast.sendSuccessNotification.called);
      });
    });

    module('when deletion is a error', function () {
      test('it should send a toast for feedback ', async function (assert) {
        sinon.stub(pixToast, 'sendErrorNotification');

        const certificationVersion = store.createRecord('certification-version', { id: frameworkItem3.id });
        sinon.stub(store, 'findRecord').resolves(certificationVersion);
        sinon.stub(certificationVersion, 'destroyRecord').rejects();

        const screen = await render(<template><FrameworkHistory @frameworkKey="CORE" /></template>);

        // when
        await click(screen.getAllByRole('button', { name: deleteButtonName })[2]);
        await click(screen.getByText('Confirmer la suppression'));

        // then
        assert.ok(pixToast.sendErrorNotification.called);
      });
    });
  });
});
