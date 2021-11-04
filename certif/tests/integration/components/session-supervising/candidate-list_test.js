import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { render as renderScreen } from '@pix/ember-testing-library';

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
        store.createRecord('certification-candidate-for-supervising', {
          id: 123,
          firstName: 'Toto',
          lastName: 'Tutu',
          birthdate: '1984-05-28',
          extraTimePercentage: '8',
          authorizedToStart: true,
        }),
        store.createRecord('certification-candidate-for-supervising', {
          id: 456,
          firstName: 'Star',
          lastName: 'Lord',
          birthdate: '1983-06-28',
          extraTimePercentage: '12',
          authorizedToStart: false,
        }),
      ],
    });

    // when
    const screen = await renderScreen(hbs`<SessionSupervising::CandidateList @candidates={{this.sessionForSupervising.certificationCandidates}}  />`);

    // then
    assert.dom(screen.getByRole('checkbox', { name: 'Tuto Toto' })).exists();
    assert.contains('Tuto Toto');
    assert.contains('· Temps majoré : 8%');
    assert.contains('28/05/1984');
    assert.contains('Lord Star');
    assert.contains('· Temps majoré : 12%');
    assert.contains('28/06/1983');
  });

  module('when there is no candidate', function() {
    test('it renders a message', async function(assert) {
      // given
      this.sessionForSupervising = store.createRecord('session-for-supervising', {
        certificationCandidates: [] });

      // when
      await render(hbs`<SessionSupervising::CandidateList @candidates={{this.sessionForSupervising.certificationCandidates}} />`);

      // then
      assert.contains('Aucun candidat inscrit à cette session');
    });
  });
});
