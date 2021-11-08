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
      assert.dom(screen.getByRole('checkbox', { name: 'Tutu Toto' })).isChecked();

      assert.contains('· Temps majoré : 8%');
      assert.contains('28/05/1984');

      assert.dom(screen.getByRole('checkbox', { name: 'Lord Star' })).isNotChecked();

      assert.contains('· Temps majoré : 12%');
      assert.contains('28/06/1983');
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
          const checkCandidate = sinon.spy();
          this.set('checkCandidate', checkCandidate);

          const screen = await renderScreen(hbs`<SessionSupervising::CandidateList
            @candidates={{this.sessionForSupervising.certificationCandidates}}
            @checkCandidate={{this.checkCandidate}}
        />`);
          const checkbox = screen.getByRole('checkbox');

          // when

          await checkbox.click();

          // then
          sinon.assert.calledOnceWithExactly(checkCandidate, candidate, false);
          assert.ok(true);
        });
      });

      module('when the candidate is not authorized', function() {
        test('it calls the argument callback with candidate and true', async function(assert) {
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
          const checkCandidate = sinon.spy();
          this.set('checkCandidate', checkCandidate);

          const screen = await renderScreen(hbs`<SessionSupervising::CandidateList
            @candidates={{this.sessionForSupervising.certificationCandidates}}
            @checkCandidate={{this.checkCandidate}}
        />`);
          const checkbox = screen.getByRole('checkbox');

          // when

          await checkbox.click();

          // then
          sinon.assert.calledOnceWithExactly(checkCandidate, candidate, true);
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
