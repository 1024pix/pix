import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

module('Integration | Component | routes/authenticated/certification-centers | list-items', (hooks) => {

  setupRenderingTest(hooks);

  const certificationCenters = [
    { id: 1, name: 'John', type: 'SCO', externalId: '123' },
    { id: 2, name: 'Jane', type: 'SUP', externalId: '456' },
    { id: 3, name: 'Lola', type: 'PRO', externalId: '789' },
  ];
  certificationCenters.meta = {
    rowCount: 3,
  };
  const triggerFiltering = function() {};

  hooks.beforeEach(async function() {
    this.set('certificationCenters', certificationCenters);
    this.set('triggerFiltering', triggerFiltering);
    this.goToCertificationCenterPage = sinon.spy();

    await render(hbs `<CertificationCenters::ListItems @certificationCenters={{this.certificationCenters}} @triggerFiltering={{this.triggerFiltering}} @goToCertificationCenterPage={{this.goToCertificationCenterPage}} />`);
  });

  test('it should display certification-centers list', async function(assert) {
    // then
    assert.dom('table tbody tr:first-child td:first-child').hasText('1');
    assert.dom('table tbody tr:first-child td:nth-child(2)').hasText('John');
    assert.dom('table tbody tr:first-child td:nth-child(3)').hasText('SCO');
    assert.dom('table tbody tr:first-child td:nth-child(4)').hasText('123');
    assert.dom('table tbody tr').exists({ count: 3 });
    assert.dom('tr[aria-label="Centre de certification"]').hasAttribute('role', 'button');
  });

  test('should call goToCertificationCenterPage function when a line is clicked', async function(assert) {
    // when
    await click('tr[aria-label="Centre de certification"]:first-child');

    // then
    assert.ok(this.goToCertificationCenterPage.calledWith(1));
  });
});
