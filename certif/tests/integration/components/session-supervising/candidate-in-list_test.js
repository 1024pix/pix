import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render as renderScreen } from '@pix/ember-testing-library';

import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

module('Integration | Component | SessionSupervising::CandidateInList', function(hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(async function() {
    store = this.owner.lookup('service:store');
  });

  test('it renders the candidates information with an unchecked checkbox', async function(assert) {
    // given
    this.candidate = store.createRecord('certification-candidate-for-supervising', {
      id: 123,
      firstName: 'Gamora',
      lastName: 'Zen Whoberi Ben Titan',
      birthdate: '1984-05-28',
      extraTimePercentage: '8',
      authorizedToStart: false,
      assessmentStatus: null,
    });
    this.toggleCandidate = sinon.spy();

    // when
    const screen = await renderScreen(hbs`
      <SessionSupervising::CandidateInList
        @candidate={{this.candidate}}
        @toggleCandidate={{this.toggleCandidate}}
      />
    `);

    // then
    assert.dom('.session-supervising-candidate-in-list').hasText('Zen Whoberi Ben Titan Gamora 28/05/1984 · Temps majoré : 8%');
    assert.dom(screen.getByRole('checkbox', { name: 'Zen Whoberi Ben Titan Gamora' })).isNotChecked();
  });

  module('when the candidate is authorized to start', function() {
    test('it renders the checkbox checked', async function(assert) {
      // given
      this.candidate = store.createRecord('certification-candidate-for-supervising', {
        id: 456,
        firstName: 'Star',
        lastName: 'Lord',
        birthdate: '1983-06-28',
        extraTimePercentage: '12',
        authorizedToStart: true,
        assessmentStatus: null,
      });
      this.toggleCandidate = sinon.spy();

      // when
      const screen = await renderScreen(hbs`
        <SessionSupervising::CandidateInList
          @candidate={{this.candidate}}
          @toggleCandidate={{this.toggleCandidate}}
        />
      `);

      // then
      assert.dom('.session-supervising-candidate-in-list').hasText('Lord Star 28/06/1983 · Temps majoré : 12%');
      assert.dom(screen.getByRole('checkbox', { name: 'Lord Star' })).isChecked();
    });
  });

  module('when the candidate has started the test', function() {
    test('it renders the "en cours" label', async function(assert) {
      // given
      this.candidate = store.createRecord('certification-candidate-for-supervising', {
        id: 789,
        firstName: 'Rocket',
        lastName: 'Racoon',
        birthdate: '1982-07-28',
        extraTimePercentage: null,
        authorizedToStart: true,
        assessmentStatus: 'started',
      });
      this.toggleCandidate = sinon.spy();

      // when
      const screen = await renderScreen(hbs`
        <SessionSupervising::CandidateInList
          @candidate={{this.candidate}}
          @toggleCandidate={{this.toggleCandidate}}
        />
      `);

      // then
      assert.dom('.session-supervising-candidate-in-list').hasText('Racoon Rocket 28/07/1982 En cours');
      assert.dom(screen.queryByRole('checkbox', { name: 'Racoon Rocket' })).doesNotExist();
    });
  });

  module('when the checkbox is clicked', function() {
    module('when the candidate is already authorized', function() {
      test('it calls the argument callback with candidate and false', async function(assert) {
        // given
        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: 123,
          firstName: 'Toto',
          lastName: 'Tutu',
          birthdate: '1984-05-28',
          extraTimePercentage: '8',
          authorizedToStart: true,
          assessmentResult: null,
        });
        this.toggleCandidate = sinon.spy();

        const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList
          @candidate={{this.candidate}}
          @toggleCandidate={{this.toggleCandidate}}
        />`);
        const checkbox = screen.getByRole('checkbox');

        // when
        await checkbox.click();

        // then
        sinon.assert.calledOnceWithExactly(this.toggleCandidate, this.candidate);
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
          assessmentResult: null,
        });
        this.sessionForSupervising = store.createRecord('session-for-supervising', {
          certificationCandidates: [candidate],
        });
        this.toggleCandidate = sinon.spy();

        const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList
            @candidates={{this.sessionForSupervising.certificationCandidates}}
            @toggleCandidate={{this.toggleCandidate}}
        />`);
        const checkbox = screen.getByRole('checkbox');

        // when
        await checkbox.click();

        // then
        sinon.assert.calledOnceWithExactly(this.toggleCandidate, this.candidate);
        assert.ok(true);
      });
    });
  });
});
