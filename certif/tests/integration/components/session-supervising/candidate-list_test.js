import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillIn } from '@ember/test-helpers';
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
      this.certificationCandidates = [
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
      ];

      // when
      const screen = await renderScreen(
        hbs`<SessionSupervising::CandidateList @candidates={{this.certificationCandidates}}  />`
      );

      // then
      assert.dom(screen.getByText('Zen Whoberi Ben Titan Gamora')).exists();
      assert.dom(screen.getByText('Lord Star')).exists();
    });

    test('it renders a search input', async function (assert) {
      // given
      this.certificationCandidates = [
        store.createRecord('certification-candidate-for-supervising', {
          id: 123,
          firstName: 'Gamora',
          lastName: 'Zen Whoberi Ben Titan',
          birthdate: '1984-05-28',
          extraTimePercentage: '8',
          authorizedToStart: true,
          assessmentStatus: null,
        }),
      ];

      // when
      const screen = await renderScreen(
        hbs`<SessionSupervising::CandidateList @candidates={{this.certificationCandidates}}  />`
      );

      // then
      assert.dom(screen.getByRole('textbox', { name: 'Rechercher un candidat' })).exists();
    });

    module('when the candidate search filter is filled', function () {
      test('it renders the filtered candidates information', async function (assert) {
        // given
        this.certificationCandidates = [
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
            firstName: 'Gammvert',
            lastName: 'Rocket',
            birthdate: '1982-06-06',
            extraTimePercentage: '12',
            authorizedToStart: false,
            assessmentStatus: null,
          }),
        ];
        const screen = await renderScreen(
          hbs`<SessionSupervising::CandidateList @candidates={{this.certificationCandidates}}  />`
        );

        // when
        await fillIn(screen.getByRole('textbox', { name: 'Rechercher un candidat' }), 'Gam');

        // then
        assert.dom(screen.getByText('Zen Whoberi Ben Titan Gamora')).exists();
        assert.dom(screen.getByText('Rocket Gammvert')).exists();
        assert.dom(screen.queryByText('Lord Star')).doesNotExist();
      });
    });
  });

  module('when there is no candidate', function () {
    test('it renders a message', async function (assert) {
      // when
      const screen = await renderScreen(
        hbs`<SessionSupervising::CandidateList @candidates={{this.certificationCandidates}} />`
      );

      // then
      assert.dom(screen.getByText('Aucun candidat inscrit à cette session')).exists();
    });

    test('it does not render a search input', async function (assert) {
      // given
      this.certificationCandidates = [];

      // when
      const screen = await renderScreen(
        hbs`<SessionSupervising::CandidateList @candidates={{this.certificationCandidates}}  />`
      );

      // then
      assert.dom(screen.queryByRole('textbox', { name: 'Rechercher un candidat' })).doesNotExist();
    });
  });
});
