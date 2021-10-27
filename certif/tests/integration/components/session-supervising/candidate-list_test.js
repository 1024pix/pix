import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';

import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | SessionSupervising::CandidateList', function(hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(async function() {
    store = this.owner.lookup('service:store');
  });

  test('it renders the candidates information', async function(assert) {
    // given

    this.sessionForSupervising = store.createRecord('session-for-supervising', {
      certificationCandidates: [
        {
          firstName: 'Toto',
          lastName: 'Tutu',
          birthdate: '1984-05-28',
          extraTimePercentage: '8',
        },
        {
          firstName: 'Star',
          lastName: 'Lord',
          birthdate: '1983-06-28',
          extraTimePercentage: '12',
        },
      ] });

    // when
    await render(hbs`<SessionSupervising::CandidateList @candidates={{this.sessionForSupervising.certificationCandidates}}  />`);

    // then
    assert.contains('Toto Tutu');
    assert.contains('· Temps majoré : 8%');
    assert.contains('28/05/1984');
    assert.contains('Star Lord');
    assert.contains('· Temps majoré : 12%');
    assert.contains('28/06/1983');
  });
});
