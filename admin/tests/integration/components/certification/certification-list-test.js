import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | <Certification::CertificationList/>', function(hooks) {

  setupRenderingTest(hooks);

  test('sould display many certifications', async function(assert) {
    // given
    this.certifications = [
      EmberObject.create({ id: 1 }),
      EmberObject.create({ id: 2 }),
      EmberObject.create({ id: 3 }),
    ];

    // when
    await render(hbs`<Certification::CertificationList @certifications={{certifications}} />`);

    const $tableRows = this.element.querySelectorAll('tbody > tr');
    assert.equal($tableRows.length, 3);
  });
});
