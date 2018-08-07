import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | campaign-list', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display a list of campaigns', async function(assert) {
    // given
    const campaigns = [
      { name: 'campagne 1', code: 'AAAAAA111'},
      { name: 'campagne 2', code: 'BBBBBB222'},
    ];

    this.set('campaigns', campaigns);

    // when
    await render(hbs`{{campaign-list campaigns=campaigns}}`);

    // then
    assert.dom('.campaign-list').exists();
    assert.dom('.campaign-list__item').exists({ count: 2 });
  });

  test('it should display the name and the url of the campaigns', async function(assert) {
    // given
    let store = this.owner.lookup('service:store');
    let campaign1 = run(() => store.createRecord('campaign', {
      name: 'campagne 1',
      code: 'AAAAAA111'
    }));
    let campaign2 = run(() => store.createRecord('campaign', {
      name: 'campagne 1',
      code: 'BBBBBB222'
    }));
    const campaigns = [campaign1, campaign2];

    this.set('campaigns', campaigns);

    // when
    await render(hbs`{{campaign-list campaigns=campaigns}}`);

    // then
    assert.dom('.campaign-list__item:first-child .campaign-name').hasText('campagne 1');
    assert.dom('.campaign-list__item:first-child .campaign-link').hasText('http://localhost:4200/campagnes/AAAAAA111');
  });
});
