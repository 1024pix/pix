import { render as renderScreen } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | SessionSupervising::CandidateList', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  module('when there are candidates', function () {
    test('it renders the candidates information', async function (assert) {
      // given
      this.certificationCandidates = [
        store.createRecord('certification-candidate-for-supervising', {
          firstName: 'Gamora',
          lastName: 'Zen Whoberi Ben Titan',
          birthdate: '1984-05-28',
          extraTimePercentage: '8',
          authorizedToStart: true,
          assessmentStatus: null,
        }),
        store.createRecord('certification-candidate-for-supervising', {
          firstName: 'Star',
          lastName: 'Lord',
          birthdate: '1983-06-28',
          extraTimePercentage: 12,
          authorizedToStart: false,
          assessmentStatus: null,
        }),
      ];

      // when
      const screen = await renderScreen(
        hbs`<SessionSupervising::CandidateList @candidates={{this.certificationCandidates}} />`,
      );

      // then
      assert.dom(screen.getByText('Zen Whoberi Ben Titan Gamora')).exists();
      assert.dom(screen.getByText('Lord Star')).exists();
    });

    test('it renders a search input', async function (assert) {
      // given
      this.certificationCandidates = [
        store.createRecord('certification-candidate-for-supervising', {
          firstName: 'Gamora',
          lastName: 'Zen Whoberi Ben Titan',
          birthdate: '1984-05-28',
        }),
      ];

      // when
      const screen = await renderScreen(
        hbs`<SessionSupervising::CandidateList @candidates={{this.certificationCandidates}} />`,
      );

      // then
      assert.dom(screen.getByRole('textbox', { name: 'Rechercher un candidat' })).exists();
    });

    module('when the candidate search filter is filled but has no match', function () {
      test('it renders an empty candidates list', async function (assert) {
        // given
        this.certificationCandidates = [
          store.createRecord('certification-candidate-for-supervising', {
            firstName: 'Tom',
            lastName: 'Nook',
          }),
          store.createRecord('certification-candidate-for-supervising', {
            firstName: 'Kéké',
            lastName: 'Laglisse',
          }),
        ];
        const screen = await renderScreen(
          hbs`<SessionSupervising::CandidateList @candidates={{this.certificationCandidates}} />`,
        );

        // when
        await fillIn(screen.getByRole('textbox', { name: 'Rechercher un candidat' }), 'Marie');

        // then
        assert.dom(screen.queryByText('Nook Tom')).doesNotExist();
        assert.dom(screen.queryByText('Laglisse Kéké')).doesNotExist();
        assert
          .dom(
            screen.getByText(
              t('pages.session-supervising.candidate-list.authorized-to-start-candidates', {
                authorizedToStartCandidates: 0,
                totalCandidates: this.certificationCandidates.length,
              }),
            ),
          )
          .exists();
      });
    });

    module('when the candidate search filter is filled', function () {
      [
        { firstName: 'FirstName', lastName: 'Whatever', filter: 'Fir' },
        { firstName: 'Whatever', lastName: 'LastName', filter: 'Last' },
        { firstName: 'FirstName', lastName: 'LastName', filter: 'LastName FirstName' },
        { firstName: 'Mïchèle', lastName: 'Désarçônnée', filter: 'Michele Desarconnee' },
        { firstName: 'Jean-Michel', lastName: 'Promis-Je-La-Fais-Pas', filter: 'jean michel promis je la fais pas' },
      ].forEach(({ firstName, lastName, filter }) => {
        test(`it renders the ${firstName} and ${lastName} candidates information for ${filter} filter`, async function (assert) {
          // given
          this.certificationCandidates = [
            store.createRecord('certification-candidate-for-supervising', {
              firstName,
              lastName,
            }),
            store.createRecord('certification-candidate-for-supervising', {
              firstName: 'OtherFirstName',
              lastName: 'OtherLastName',
            }),
          ];
          const screen = await renderScreen(
            hbs`<SessionSupervising::CandidateList @candidates={{this.certificationCandidates}} />`,
          );

          // when
          await fillIn(screen.getByRole('textbox', { name: 'Rechercher un candidat' }), filter);

          // then
          assert.dom(screen.getByText(lastName + ' ' + firstName)).exists();
          assert.dom(screen.queryByText('OtherLastName OtherFirstName')).doesNotExist();
        });
      });

      module('when the empty input button is clicked', function () {
        test('it empties the input field', async function (assert) {
          // given
          this.certificationCandidates = [
            store.createRecord('certification-candidate-for-supervising', {
              firstName: 'Gamora',
              lastName: 'Zen Whoberi Ben Titan',
            }),
          ];
          const screen = await renderScreen(
            hbs`<SessionSupervising::CandidateList @candidates={{this.certificationCandidates}} />`,
          );
          await fillIn(screen.getByRole('textbox', { name: 'Rechercher un candidat' }), 'Champs rempli');

          // when
          await click(screen.getByRole('button', { name: 'Vider le champ' }));

          // then
          assert.dom(screen.queryByRole('Champ rempli')).doesNotExist();
          assert.dom(screen.getByText('Zen Whoberi Ben Titan Gamora')).exists();
        });
      });
    });

    module('when some candidates are authorized to start', function () {
      test('it renders the number of authorized to start candidates', async function (assert) {
        // given
        this.certificationCandidates = [
          store.createRecord('certification-candidate-for-supervising', {
            firstName: 'Gamora',
            lastName: 'Zen Whoberi Ben Titan',
            authorizedToStart: true,
          }),
          store.createRecord('certification-candidate-for-supervising', {
            firstName: 'Star',
            lastName: 'Lord',
            authorizedToStart: true,
          }),
          store.createRecord('certification-candidate-for-supervising', {
            firstName: 'Gammvert',
            lastName: 'Rocket',
            authorizedToStart: false,
          }),
        ];

        // when
        const screen = await renderScreen(
          hbs`<SessionSupervising::CandidateList @candidates={{this.certificationCandidates}} />`,
        );

        // then
        assert
          .dom(
            screen.getByText(
              t('pages.session-supervising.candidate-list.authorized-to-start-candidates', {
                authorizedToStartCandidates: 2,
                totalCandidates: this.certificationCandidates.length,
              }),
            ),
          )
          .exists();
      });
    });
  });

  module('when there is no candidate', function () {
    test('it renders a message', async function (assert) {
      // when
      const screen = await renderScreen(
        hbs`<SessionSupervising::CandidateList @candidates={{this.certificationCandidates}} />`,
      );

      // then
      assert.dom(screen.getByText('Aucun candidat inscrit à cette session')).exists();
    });

    test('it does not render a search input', async function (assert) {
      // given
      this.certificationCandidates = [];

      // when
      const screen = await renderScreen(
        hbs`<SessionSupervising::CandidateList @candidates={{this.certificationCandidates}} />`,
      );

      // then
      assert.dom(screen.queryByRole('textbox', { name: 'Rechercher un candidat' })).doesNotExist();
    });
  });
});
