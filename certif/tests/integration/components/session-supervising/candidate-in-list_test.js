import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';

import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

module('Integration | Component | SessionSupervising::CandidateInList', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  test('should render the enrolled complementary certification name of the candidate if he passes one', async function (assert) {
    this.candidate = store.createRecord('certification-candidate-for-supervising', {
      id: 123,
      enrolledComplementaryCertificationLabel: 'Super Certification Complémentaire',
    });

    // when
    const screen = await renderScreen(hbs`
      <SessionSupervising::CandidateInList @candidate={{this.candidate}} />
    `);

    // then
    assert.dom(screen.getByText('Inscription à Super Certification Complémentaire')).exists();
  });

  test('it renders the candidates information with a confirmation button', async function (assert) {
    // given
    this.candidate = store.createRecord('certification-candidate-for-supervising', {
      id: 123,
      firstName: 'Gamora',
      lastName: 'Zen Whoberi Ben Titan',
      birthdate: '1984-05-28',
      extraTimePercentage: 0.08,
      authorizedToStart: false,
      assessmentStatus: null,
      complementaryCertification: null,
    });

    // when
    const screen = await renderScreen(hbs`
      <SessionSupervising::CandidateInList @candidate={{this.candidate}} />
    `);

    // then
    assert.dom(screen.getByText('Zen Whoberi Ben Titan Gamora')).exists();
    assert.dom(screen.getByText('28/05/1984')).exists();
    assert.dom(screen.queryByText('temps majoré')).doesNotExist();
    assert
      .dom(
        screen.queryByRole('button', {
          name: "Annuler la confirmation de présence de l'élève Gamora Zen Whoberi Ben Titan",
        }),
      )
      .doesNotExist();
    assert
      .dom(screen.getByRole('button', { name: "Confirmer la présence de l'élève Gamora Zen Whoberi Ben Titan" }))
      .exists();
  });

  module('when the candidate is authorized to start', function () {
    test('it renders the cancel confirmation button', async function (assert) {
      // given
      this.candidate = store.createRecord('certification-candidate-for-supervising', {
        id: 456,
        firstName: 'Star',
        lastName: 'Lord',
        birthdate: '1983-06-28',
        extraTimePercentage: 0.12,
        authorizedToStart: true,
        assessmentStatus: null,
      });

      // when
      const screen = await renderScreen(hbs`
        <SessionSupervising::CandidateInList @candidate={{this.candidate}} />
      `);

      // then
      assert.dom(screen.getByText('Lord Star')).exists();
      assert.dom(screen.getByText('28/06/1983')).exists();
      assert
        .dom(screen.getByRole('button', { name: "Annuler la confirmation de présence de l'élève Star Lord" }))
        .exists();
      assert.dom(screen.queryByRole('button', { name: "Confirmer la présence de l'élève Star Lord" })).doesNotExist();
    });

    test('it does not render the time nor extra time', async function (assert) {
      // given
      this.candidate = store.createRecord('certification-candidate-for-supervising', {
        id: 456,
        firstName: 'Star',
        lastName: 'Lord',
        startDateTime: new Date('2022-10-19T14:30:15Z'),
        theoricalEndDateTime: new Date('2022-10-19T16:00:00Z'),
        extraTimePercentage: 12,
        authorizedToStart: true,
        assessmentStatus: null,
      });

      // when
      const screen = await renderScreen(hbs`
        <SessionSupervising::CandidateInList @candidate={{this.candidate}} />
      `);

      // then
      assert
        .dom(screen.getByRole('button', { name: "Annuler la confirmation de présence de l'élève Star Lord" }))
        .exists();
      assert.dom(screen.queryByText('Début :')).doesNotExist();
      assert.dom(screen.queryByText('Fin théorique :')).doesNotExist();
      assert.dom(screen.queryByText('+ temps majoré 12 %')).doesNotExist();
    });
  });

  module('when the confirmation button is clicked', function () {
    module('when the candidate is already authorized', function () {
      test('it calls the argument callback with candidate and false', async function (assert) {
        // given
        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: 123,
          firstName: 'Toto',
          lastName: 'Tutu',
          birthdate: '1984-05-28',
          extraTimePercentage: 0.08,
          authorizedToStart: true,
          assessmentResult: null,
        });
        this.toggleCandidate = sinon.spy();

        const screen = await renderScreen(hbs`
          <SessionSupervising::CandidateInList
            @candidate={{this.candidate}}
            @toggleCandidate={{this.toggleCandidate}}
          />`);

        const cancelButton = screen.getByRole('button', {
          name: "Annuler la confirmation de présence de l'élève Toto Tutu",
        });

        // when
        await click(cancelButton);

        // then
        sinon.assert.calledOnceWithExactly(this.toggleCandidate, this.candidate);
        assert.ok(true);
      });
    });

    module('when the candidate is not authorized to start', function () {
      test('it calls the argument callback with candidate', async function (assert) {
        // given
        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: 123,
          firstName: 'Toto',
          lastName: 'Tutu',
          birthdate: '1984-05-28',
          extraTimePercentage: 0.08,
          authorizedToStart: false,
          assessmentResult: null,
        });
        this.toggleCandidate = sinon.spy();

        const screen = await renderScreen(hbs`
          <SessionSupervising::CandidateInList
            @candidate={{this.candidate}}
            @toggleCandidate={{this.toggleCandidate}}
          />
        `);
        const confirmationButton = screen.getByRole('button', {
          name: "Confirmer la présence de l'élève Toto Tutu",
        });

        // when
        await click(confirmationButton);

        // then
        sinon.assert.calledOnceWithExactly(this.toggleCandidate, this.candidate);
        assert.ok(true);
      });

      test('it does not render the time nor extra time', async function (assert) {
        // given
        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: 456,
          firstName: 'Toto',
          lastName: 'Tutu',
          startDateTime: new Date('2022-10-19T14:30:15Z'),
          theoricalEndDateTime: new Date('2022-10-19T16:00:00Z'),
          extraTimePercentage: 12,
          authorizedToStart: false,
          assessmentStatus: null,
        });

        // when
        const screen = await renderScreen(hbs`
          <SessionSupervising::CandidateInList @candidate={{this.candidate}} />
        `);

        // then
        assert.dom(screen.getByRole('button', { name: "Confirmer la présence de l'élève Toto Tutu" })).exists();
        assert.dom(screen.queryByText('Début :')).doesNotExist();
        assert.dom(screen.queryByText('Fin théorique :')).doesNotExist();
        assert.dom(screen.queryByText('+ temps majoré 12 %')).doesNotExist();
      });
    });
  });

  module('when the candidate is reconciliated before starting the session', function () {
    module('when the candidate is no longer eligible to the complementary certification', function () {
      test('should render a warning message', async function (assert) {
        // given
        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: 123,
          enrolledComplementaryCertificationLabel: 'Super Certification Complémentaire',
          userId: 678,
          isStillEligibleToComplementaryCertification: false,
        });

        // when
        const screen = await renderScreen(hbs`
            <SessionSupervising::CandidateInList @candidate={{this.candidate}} />
          `);

        // then
        assert
          .dom(
            screen.getByText(
              'Candidat pas ou plus éligible à la certification complémentaire. Il passe la certification Pix.',
            ),
          )
          .exists();
      });
    });

    module('when the candidate is still eligible to the complementary certification', function () {
      test('should not render a warning message', async function (assert) {
        // given
        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: 123,
          enrolledComplementaryCertificationLabel: 'Super Certification Complémentaire',
          userId: 678,
          isStillEligibleToComplementaryCertification: true,
        });

        // when
        const screen = await renderScreen(hbs`
            <SessionSupervising::CandidateInList @candidate={{this.candidate}} />
          `);

        // then
        assert
          .dom(
            screen.queryByText(
              'Candidat pas ou plus éligible à la certification complémentaire. Il passe la certification Pix.',
            ),
          )
          .doesNotExist();
      });
    });
  });

  module('when the candidate is not reconciliated before starting the session', function () {
    test('should not render a warning message', async function (assert) {
      // given
      this.candidate = store.createRecord('certification-candidate-for-supervising', {
        id: 123,
        enrolledComplementaryCertificationLabel: 'Super Certification Complémentaire',
        isStillEligibleToComplementaryCertification: false,
      });

      // when
      const screen = await renderScreen(hbs`
            <SessionSupervising::CandidateInList @candidate={{this.candidate}} />
          `);

      // then
      assert
        .dom(
          screen.queryByText(
            'Candidat pas ou plus éligible à la certification complémentaire. Il passe la certification Pix.',
          ),
        )
        .doesNotExist();
    });
  });

  module('when the candidate has started the test', function () {
    test('it renders the time and extra time', async function (assert) {
      // given
      this.candidate = store.createRecord('certification-candidate-for-supervising', {
        id: 456,
        startDateTime: new Date('2022-10-19T14:30:15Z'),
        theoricalEndDateTime: new Date('2022-10-19T16:00:00Z'),
        extraTimePercentage: 0.12,
        authorizedToStart: false,
        assessmentStatus: 'started',
      });

      // when
      const screen = await renderScreen(hbs`
        <SessionSupervising::CandidateInList @candidate={{this.candidate}} />
      `);

      // then
      assert.dom(screen.getByText('En cours')).exists();
      assert.dom(screen.getByText('Début :')).exists();
      assert.dom(screen.getByText('Fin théorique :')).exists();
      assert.dom(screen.getByText('+ temps majoré 12 %')).exists();
      assert.dom(screen.queryByText('Signalement en cours')).doesNotExist();
      assert.dom(screen.queryByText('Autorisé à reprendre')).doesNotExist();
      assert.dom(screen.queryByText('Terminé')).doesNotExist();
    });

    module('when there is no current live alert', () => {
      test('it renders the menu without the handle live alert button', async function (assert) {
        // given
        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: 456,
          startDateTime: new Date('2022-10-19T14:30:15Z'),
          theoricalEndDateTime: new Date('2022-10-19T16:00:00Z'),
          extraTimePercentage: 0.12,
          authorizedToStart: false,
          assessmentStatus: 'started',
        });

        // when
        const screen = await renderScreen(hbs`
        <SessionSupervising::CandidateInList @candidate={{this.candidate}} />
      `);
        await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));

        // then
        assert.dom(screen.getByText('Autoriser la reprise du test')).exists();
        assert.dom(screen.getByText('Terminer le test')).exists();
        assert.dom(screen.queryByText('Gérer un signalement')).doesNotExist();
      });
    });

    module('when there is a current live alert', () => {
      test('it renders the menu without the handle live alert button', async function (assert) {
        // given
        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: 456,
          startDateTime: new Date('2022-10-19T14:30:15Z'),
          theoricalEndDateTime: new Date('2022-10-19T16:00:00Z'),
          extraTimePercentage: 0.12,
          authorizedToStart: false,
          assessmentStatus: 'started',
          liveAlert: {
            status: 'ongoing',
          },
        });

        // when
        const screen = await renderScreen(hbs`
        <SessionSupervising::CandidateInList @candidate={{this.candidate}} />
      `);
        await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));

        // then
        assert.dom(screen.getByText('Autoriser la reprise du test')).exists();
        assert.dom(screen.getByText('Gérer un signalement')).exists();
        assert.dom(screen.getByText('Terminer le test')).exists();
      });
    });
  });

  module('when the candidate has left the session and has been authorized to resume', function () {
    test('it renders the time and extra time', async function (assert) {
      // given
      this.candidate = store.createRecord('certification-candidate-for-supervising', {
        id: 456,
        startDateTime: new Date('2022-10-19T14:30:15Z'),
        theoricalEndDateTime: new Date('2022-10-19T16:00:00Z'),
        extraTimePercentage: 0.12,
        authorizedToStart: true,
        assessmentStatus: 'started',
      });

      // when
      const screen = await renderScreen(hbs`
        <SessionSupervising::CandidateInList @candidate={{this.candidate}} />
      `);

      // then
      assert.dom(screen.getByText('Autorisé à reprendre')).exists();
      assert.dom(screen.getByText('Début :')).exists();
      assert.dom(screen.getByText('Fin théorique :')).exists();
      assert.dom(screen.getByText('+ temps majoré 12 %')).exists();
      assert.dom(screen.queryByText('Signalement en cours')).doesNotExist();
      assert.dom(screen.queryByText('En cours')).doesNotExist();
      assert.dom(screen.queryByText('Terminé')).doesNotExist();
    });
  });

  module('when the candidate has completed the test', function () {
    test('it does not render the time nor extra time', async function (assert) {
      // given
      this.candidate = store.createRecord('certification-candidate-for-supervising', {
        id: 456,
        startDateTime: new Date('2022-10-19T14:30:15Z'),
        theoricalEndDateTime: new Date('2022-10-19T16:00:00Z'),
        extraTimePercentage: 12,
        authorizedToStart: false,
        assessmentStatus: 'completed',
      });

      // when
      const screen = await renderScreen(hbs`
        <SessionSupervising::CandidateInList @candidate={{this.candidate}} />
      `);

      // then
      assert.dom(screen.getByText('Terminé')).exists();
      assert.dom(screen.queryByText('Début :')).doesNotExist();
      assert.dom(screen.queryByText('Fin théorique :')).doesNotExist();
      assert.dom(screen.queryByText('+ temps majoré 12 %')).doesNotExist();
      assert.dom(screen.queryByText('Signalement en cours')).doesNotExist();
      assert.dom(screen.queryByText('En cours')).doesNotExist();
      assert.dom(screen.queryByText('Autorisé à reprendre')).doesNotExist();
    });
  });

  module('when the candidate has alerted the invigilator', function () {
    test('it displays the live alert tag', async function (assert) {
      // given
      this.candidate = store.createRecord('certification-candidate-for-supervising', {
        id: 456,
        startDateTime: new Date('2022-10-19T14:30:15Z'),
        theoricalEndDateTime: new Date('2022-10-19T16:00:00Z'),
        extraTimePercentage: 0.12,
        authorizedToStart: false,
        assessmentStatus: 'started',
        liveAlert: {
          status: 'ongoing',
        },
      });

      // when
      const screen = await renderScreen(hbs`
              <SessionSupervising::CandidateInList @candidate={{this.candidate}} />
            `);

      // then
      assert.dom(screen.getByText('Signalement en cours')).exists();
      assert.dom(screen.queryByText('En cours')).doesNotExist();
      assert.dom(screen.queryByText('Autorisé à reprendre')).doesNotExist();
      assert.dom(screen.queryByText('Terminé')).doesNotExist();
    });

    test('it displays the alert', async function (assert) {
      // given
      this.candidate = store.createRecord('certification-candidate-for-supervising', {
        id: 456,
        startDateTime: new Date('2022-10-19T14:30:15Z'),
        theoricalEndDateTime: new Date('2022-10-19T16:00:00Z'),
        extraTimePercentage: 0.12,
        authorizedToStart: false,
        assessmentStatus: 'started',
        liveAlert: {
          status: 'ongoing',
        },
      });

      // when
      const screen = await renderScreen(hbs`
              <SessionSupervising::CandidateInList @candidate={{this.candidate}} />
            `);
      await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));
      await click(screen.getByRole('button', { name: 'Gérer un signalement' }));

      // then
      assert
        .dom(screen.getByText('Refuser le signalement permet la reprise de la question en cours.', { exact: false }))
        .exists();
      assert
        .dom(
          screen.getByText(
            'Sélectionnez un motif pour valider le signalement et permettre le changement de question.',
            { exact: false },
          ),
        )
        .exists();
    });
  });
});
