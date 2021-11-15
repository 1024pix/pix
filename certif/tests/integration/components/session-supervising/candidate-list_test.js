import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render as renderScreen } from '@pix/ember-testing-library';
import sinon from 'sinon';

import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | SessionSupervising::CandidateList', function(hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(async function() {
    store = this.owner.lookup('service:store');
  });

  module('when there are candidates', function() {
    test('it renders the candidates information', async function(assert) {
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
      const screen = await renderScreen(hbs`<SessionSupervising::CandidateList @candidates={{this.sessionForSupervising.certificationCandidates}}  />`);

      // then
      assert.dom('[data-test-id="candidate-123"]').hasText('Zen Whoberi Ben Titan Gamora 28/05/1984 · Temps majoré : 8%');
      assert.dom(screen.getByRole('checkbox', { name: 'Zen Whoberi Ben Titan Gamora' })).isChecked();

      assert.dom('[data-test-id="candidate-456"]').hasText('Lord Star 28/06/1983 · Temps majoré : 12%');
      assert.dom(screen.getByRole('checkbox', { name: 'Lord Star' })).isNotChecked();

      assert.dom('[data-test-id="candidate-789"]').hasText('Racoon Rocket 28/07/1982 En cours');
      assert.dom(screen.queryByRole('checkbox', { name: 'Racoon Rocket' })).doesNotExist();
    });

    module('when the checkbox value change', function() {

      module('when the candidate is already authorized', function() {
        test('it calls the argument callback with candidate and false', async function(assert) {
          // given
          const candidate = store.createRecord('certification-candidate-for-supervising', {
            id: 123,
            firstName: 'Toto',
            lastName: 'Tutu',
            birthdate: '1984-05-28',
            extraTimePercentage: '8',
            authorizedToStart: true,
          });
          this.sessionForSupervising = store.createRecord('session-for-supervising', {
            certificationCandidates: [candidate],
          });
          const toggleCandidate = sinon.spy();
          this.set('toggleCandidate', toggleCandidate);

          const screen = await renderScreen(hbs`<SessionSupervising::CandidateList
            @candidates={{this.sessionForSupervising.certificationCandidates}}
            @toggleCandidate={{this.toggleCandidate}}
        />`);
          const checkbox = screen.getByRole('checkbox');

          // when

          await checkbox.click();

          // then
          sinon.assert.calledOnceWithExactly(toggleCandidate, candidate);
          assert.ok(true);
        });
      });

      module('when the candidate is not authorized', function() {
        test('it calls the argument callback with candidate', async function(assert) {
          // given
          const candidate = store.createRecord('certification-candidate-for-supervising', {
            id: 123,
            firstName: 'Toto',
            lastName: 'Tutu',
            birthdate: '1984-05-28',
            extraTimePercentage: '8',
            authorizedToStart: false,
          });
          this.sessionForSupervising = store.createRecord('session-for-supervising', {
            certificationCandidates: [candidate],
          });
          const toggleCandidate = sinon.spy();
          this.set('toggleCandidate', toggleCandidate);

          const screen = await renderScreen(hbs`<SessionSupervising::CandidateList
            @candidates={{this.sessionForSupervising.certificationCandidates}}
            @toggleCandidate={{this.toggleCandidate}}
        />`);
          const checkbox = screen.getByRole('checkbox');

          // when

          await checkbox.click();

          // then
          sinon.assert.calledOnceWithExactly(toggleCandidate, candidate);
          assert.ok(true);
        });
      });
    });

    module('when there is no candidate', function() {
      test('it renders a message', async function(assert) {
        // given
        this.sessionForSupervising = store.createRecord('session-for-supervising', {
          certificationCandidates: [],
        });

        // when
        await renderScreen(hbs`<SessionSupervising::CandidateList @candidates={{this.sessionForSupervising.certificationCandidates}} />`);

        // then
        assert.contains('Aucun candidat inscrit à cette session');
      });
    });
  });
});
