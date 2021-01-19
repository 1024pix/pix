import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { ERROR, STARTED } from 'pix-admin/models/certification';

module('Integration | Component | certification-status', function(hooks) {
  setupRenderingTest(hooks);

  module('#isStatusBlocking', function() {

    [
      { status: ERROR },
      { status: STARTED },
    ].forEach((record) => {
      test(`it renders ${record.status} in red`, async function(assert) {
        // given
        this.set('record', record);

        // when
        await render(hbs`<CertificationStatus @record={{record}} />`);

        // then
        assert.dom('span.certification-list-page__cell--important').exists();
      });
    });

    [
      { status: 'validated', statusLabel: 'Validée' },
      { status: 'rejected', statusLabel: 'Rejetée' },
    ].forEach((record) => {
      test(`it renders ${record.status}`, async function(assert) {
        // given
        this.set('record', record);

        // when
        await render(hbs`<CertificationStatus @record={{record}} />`);

        // then
        assert.dom('span.certification-list-page__cell--important').doesNotExist();
        assert.dom('span').hasText(record.statusLabel);
      });
    });
  });
});
