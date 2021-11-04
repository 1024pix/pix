import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { ERROR, STARTED } from 'pix-admin/models/certification';

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
        this.set('record', record);

        // when
        await render(hbs`<Certifications::Status @record={{record}} />`);

        // then
        assert.dom('span.certification-list-page__cell--important').exists();
      });
    });

    test('it renders status in red if certification has been flagged as aborted', async function (assert) {
      // given
      const record = store.createRecord('jury-certification-summary', { isFlaggedAborted: true });

      this.set('record', record);

      // when
      await render(hbs`<Certifications::Status @record={{record}} />`);

      // then
      assert.dom('span.certification-list-page__cell--important').exists();
    });

    [
      { status: 'validated', statusLabel: 'Validée' },
      { status: 'rejected', statusLabel: 'Rejetée' },
    ].forEach((juryCertificationSummary) => {
      test(`it renders ${juryCertificationSummary.status}`, async function (assert) {
        // given
        const record = store.createRecord('jury-certification-summary', {
          ...juryCertificationSummary,
          isFlaggedAborted: false,
        });

        this.set('record', record);

        // when
        await render(hbs`<Certifications::Status @record={{record}} />`);

        // then
        assert.dom('span.certification-list-page__cell--important').doesNotExist();
        assert.dom('span').hasText(record.statusLabel);
      });
    });
  });
});
