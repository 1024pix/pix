import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render as renderScreen } from '@1024pix/ember-testing-library';

import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | SessionSupervising::CandidateList', function (hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  module('when there are candidates', function () {
    test('it renders the candidates information', async function (assert) {
      // given
      this.sessionForSupervising = store.createRecord('session-for-supervising', {
        certificationCandidates: [
          store.createRecord('certification-candidate-for-supervising', {
            id: 123,
            firstName: 'Gamora',
            lastName: 'Zen Whoberi Ben Titan',
            birthdate: '1984-05-28',
            extraTimePercentage: '8',
            authorizedToStart: true,
            assessmentStatus: null,
          }),
          store.createRecord('certification-candidate-for-supervising', {
            id: 456,
            firstName: 'Star',
            lastName: 'Lord',
            birthdate: '1983-06-28',
            extraTimePercentage: '12',
            authorizedToStart: false,
            assessmentStatus: null,
          }),
          store.createRecord('certification-candidate-for-supervising', {
            id: 789,
            firstName: 'Rocket',
            lastName: 'Racoon',
            birthdate: '1982-07-28',
            extraTimePercentage: null,
            authorizedToStart: true,
            assessmentStatus: 'started',
          }),
        ],
      });

      // when
      await renderScreen(
        hbs`<SessionSupervising::CandidateList @candidates={{this.sessionForSupervising.certificationCandidates}}  />`
      );

      // then
      assert.contains('Zen Whoberi Ben Titan Gamora');
      assert.contains('Lord Star');
      assert.contains('Racoon Rocket');
    });

    module('when there is no candidate', function () {
      test('it renders a message', async function (assert) {
        // given
        this.sessionForSupervising = store.createRecord('session-for-supervising', {
          certificationCandidates: [],
        });

        // when
        await renderScreen(
          hbs`<SessionSupervising::CandidateList @candidates={{this.sessionForSupervising.certificationCandidates}} />`
        );

        // then
        assert.contains('Aucun candidat inscrit à cette session');
      });
    });
  });
});
