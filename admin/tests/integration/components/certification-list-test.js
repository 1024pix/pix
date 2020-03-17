import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | certification-list', function(hooks) {

  setupRenderingTest(hooks);

  test('sould display many certifications', async function(assert) {
    // given
    const certifications = [
      EmberObject.create({ id: 1 }),
      EmberObject.create({ id: 2 }),
      EmberObject.create({ id: 3 }),
    ];
    this.model = certifications;

    // when
    await render(hbs`<CertificationList @certifications={{model}} />`);

    const $tableRows = this.element.querySelectorAll('tbody > tr');
    assert.equal($tableRows.length, 3);
  });
});
