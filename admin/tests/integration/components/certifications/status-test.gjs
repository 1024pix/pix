import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import Status from 'pix-admin/components/certifications/status';
import { ERROR, STARTED } from 'pix-admin/models/certification';
import { module, test } from 'qunit';

module('Integration | Component | certifications/status', function (hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  module('#isStatusBlocking', function () {
    [{ status: ERROR }, { status: STARTED }].forEach((juryCertificationSummary) => {
      test(`it renders ${juryCertificationSummary.status} in red`, async function (assert) {
        // given
        const record = store.createRecord('jury-certification-summary', {
          ...juryCertificationSummary,
          isFlaggedAborted: false,
        });

        // when
        await render(<template><Status @record={{record}} /></template>);

        // then
        assert.dom('span.certification-list-page__cell--important').exists();
      });
    });

    test('it renders status in red if certification has been flagged as aborted', async function (assert) {
      // given
      const record = store.createRecord('jury-certification-summary', { isFlaggedAborted: true });

      // when
      await render(<template><Status @record={{record}} /></template>);

      // then
      assert.dom('span.certification-list-page__cell--important').exists();
    });

    [
      { status: 'validated', statusLabelToValidate: 'Validée' },
      { status: 'rejected', statusLabelToValidate: 'Rejetée' },
    ].forEach((juryCertificationSummary) => {
      test(`it renders ${juryCertificationSummary.status}`, async function (assert) {
        // given
        const record = store.createRecord('jury-certification-summary', {
          ...juryCertificationSummary,
          isFlaggedAborted: false,
        });

        // when
        await render(<template><Status @record={{record}} /></template>);

        // then
        assert.dom('span.certification-list-page__cell--important').doesNotExist();
        assert.dom('span').hasText(record.statusLabelToValidate);
      });
    });
  });
});
