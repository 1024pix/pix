import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { resolve } from 'rsvp';

module('Integration | Component | certification-select', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{certification-select}}`);
    assert.dom('form.certifications-search').exists();
  });

  test('provides correct id', async function(assert) {
    // given
    this.set("externalAction", (value) => {
      this.set('certificationId', value);
      return resolve();
    });

    // when
    await render(hbs`{{certification-select id=null select=(action externalAction)}}`);
    await fillIn('.certifications-search__control', '1234');
    await click('.certifications-search__button');

    // then
    assert.equal(this.get('certificationId'), '1234');
  });


});
