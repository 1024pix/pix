import { render as renderScreen } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import dayjs from 'dayjs';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | SessionSupervising::CandidateInList', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  test('renders the enrolled non-core certification name of the candidate if he passes one', async function (assert) {
    this.candidate = store.createRecord('certification-candidate-for-supervising', {
      id: '123',
      subscription: 'DROIT',
    });

    // when
    const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);

    // then
    assert
      .dom(
        screen.getByText(
          t('pages.session-supervising.candidate-in-list.complementary-certification-enrolment', {
            complementaryCertification: t('pages.session-supervising.candidate-in-list.subscriptions.DROIT'),
          }),
        ),
      )
      .exists();
  });

  test('renders the double certification name of the candidate if he passes one', async function (assert) {
    this.candidate = store.createRecord('certification-candidate-for-supervising', {
      id: '123',
      subscription: 'CLEA',
    });

    // when
    const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);

    // then
    assert
      .dom(
        screen.getByText(
          t('pages.session-supervising.candidate-in-list.complementary-certification-enrolment', {
            complementaryCertification: t('pages.session-supervising.candidate-in-list.subscriptions.CLEA'),
          }),
        ),
      )
      .exists();
  });

  test('it renders the candidates information with a confirmation button', async function (assert) {
    // given
    this.candidate = store.createRecord('certification-candidate-for-supervising', {
      id: '123',
      firstName: 'Gamora',
      lastName: 'Zen Whoberi Ben Titan',
      birthdate: '1984-05-28',
      extraTimePercentage: 0.08,
      authorizedToStart: false,
      assessmentStatus: null,
    });

    // when
    const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);

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
        id: '456',
        firstName: 'Star',
        lastName: 'Lord',
        birthdate: '1983-06-28',
        extraTimePercentage: 0.12,
        authorizedToStart: true,
        assessmentStatus: null,
        hasExceededCertificationDuration: false,
      });

      // when
      const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);

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
        id: '456',
        firstName: 'Star',
        lastName: 'Lord',
        startDateTime: new Date('2022-10-19T14:30:15Z'),
        theoricalEndDateTime: new Date('2022-10-19T16:00:00Z'),
        extraTimePercentage: 12,
        authorizedToStart: true,
        assessmentStatus: null,
      });

      // when
      const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);

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
          id: '123',
          firstName: 'Toto',
          lastName: 'Tutu',
          birthdate: '1984-05-28',
          extraTimePercentage: 0.08,
          authorizedToStart: true,
          assessmentResult: null,
        });
        this.toggleCandidate = sinon.spy();

        const screen = await renderScreen(
          hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} @toggleCandidate={{this.toggleCandidate}} />`,
        );

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
          id: '123',
          firstName: 'Toto',
          lastName: 'Tutu',
          birthdate: '1984-05-28',
          extraTimePercentage: 0.08,
          authorizedToStart: false,
          assessmentResult: null,
        });
        this.toggleCandidate = sinon.spy();

        const screen = await renderScreen(
          hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} @toggleCandidate={{this.toggleCandidate}} />`,
        );
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
          id: '456',
          firstName: 'Toto',
          lastName: 'Tutu',
          startDateTime: new Date('2022-10-19T14:30:15Z'),
          theoricalEndDateTime: new Date('2022-10-19T16:00:00Z'),
          extraTimePercentage: 12,
          authorizedToStart: false,
          assessmentStatus: null,
        });

        // when
        const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);

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
      test('does not render a warning message', async function (assert) {
        // given
        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: '123',
          subscription: 'DROIT',
          userId: 678,
          isStillEligibleToDoubleCertification: false,
        });

        // when
        const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);

        // then
        assert
          .dom(
            screen.queryByText(
              t('pages.session-supervising.candidate-in-list.double-certification-non-eligibility-warning'),
            ),
          )
          .doesNotExist();
      });
    });

    module('when the candidate is no longer eligible to the double certification', function () {
      test('renders a warning message', async function (assert) {
        // given
        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: '123',
          subscription: 'CLEA',
          userId: 678,
          isStillEligibleToDoubleCertification: false,
        });

        // when
        const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);

        // then
        assert
          .dom(
            screen.getByText(
              t('pages.session-supervising.candidate-in-list.double-certification-non-eligibility-warning'),
            ),
          )
          .exists();
      });
    });

    module('when the candidate is still eligible to the double certification', function () {
      test('does not render a warning message', async function (assert) {
        // given
        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: '123',
          subscription: 'CLEA',
          userId: 678,
          isStillEligibleToDoubleCertification: true,
        });

        // when
        const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);

        // then
        assert
          .dom(
            screen.queryByText(
              t('pages.session-supervising.candidate-in-list.double-certification-non-eligibility-warning'),
            ),
          )
          .doesNotExist();
      });
    });
  });

  module('when the candidate is not reconciliated before starting the session', function () {
    test('does not render a warning message', async function (assert) {
      // given
      this.candidate = store.createRecord('certification-candidate-for-supervising', {
        id: '123',
        subscription: 'DROIT',
        isStillEligibleToDoubleCertification: false,
      });

      // when
      const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);

      // then
      assert
        .dom(
          screen.queryByText(
            t('pages.session-supervising.candidate-in-list.double-certification-non-eligibility-warning'),
          ),
        )
        .doesNotExist();
    });
  });

  module('when the candidate has started the test', function () {
    module('when candidate certification test is overtime', function () {
      test('it renders Time limit reached label and hide info, only allows to end the test', async function (assert) {
        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: '456',
          startDateTime: new Date('2022-10-19T14:30:15Z'),
          theoricalEndDateTime: new Date('2022-10-19T16:00:00Z'),
          extraTimePercentage: 0.12,
          authorizedToStart: true,
          assessmentStatus: 'started',
          hasExceededCertificationDuration: true,
        });

        const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);

        assert.dom(screen.getByText('Délai dépassé')).exists();
        assert.dom(screen.queryByText('Fin théorique :')).doesNotExist();
        assert.dom(screen.queryByText('+ temps majoré 12 %')).doesNotExist();

        await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));

        assert.dom(screen.queryByText('Autoriser la reprise du test')).doesNotExist();
        assert.dom(screen.getByText('Terminer le test')).exists();
      });
    });

    test('it renders the time and extra time', async function (assert) {
      // given
      this.candidate = store.createRecord('certification-candidate-for-supervising', {
        id: '456',
        startDateTime: new Date('2022-10-19T14:30:15Z'),
        theoricalEndDateTime: new Date('2022-10-19T16:00:00Z'),
        extraTimePercentage: 0.12,
        authorizedToStart: false,
        assessmentStatus: 'started',
      });

      // when
      const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);

      // then
      assert.dom(screen.getByText('En cours')).exists();
      assert.dom(screen.getByText('Début :')).exists();
      assert.dom(screen.getByText('Fin théorique :')).exists();
      assert.dom(screen.getByText('+ temps majoré 12 %')).exists();
      assert.dom(screen.queryByText('Signalement en cours')).doesNotExist();
      assert.dom(screen.queryByText('Terminé')).doesNotExist();
    });

    module('when there is no current live alert', () => {
      test('it renders the menu without the handle live alert button', async function (assert) {
        // given
        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: '456',
          startDateTime: new Date('2022-10-19T14:30:15Z'),
          theoricalEndDateTime: new Date('2022-10-19T16:00:00Z'),
          extraTimePercentage: 0.12,
          authorizedToStart: false,
          assessmentStatus: 'started',
        });

        // when
        const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);
        await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));

        // then
        assert.dom(screen.getByText('Autoriser la reprise du test')).exists();
        assert.dom(screen.getByText('Terminer le test')).exists();
        assert.dom(screen.queryByRole('button', { name: 'Gérer le signalement' })).doesNotExist();
      });
    });

    module('when there is a current live alert', () => {
      test('it renders the menu without the handle live alert button', async function (assert) {
        // given
        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: '456',
          startDateTime: new Date('2022-10-19T14:30:15Z'),
          theoricalEndDateTime: new Date('2022-10-19T16:00:00Z'),
          extraTimePercentage: 0.12,
          authorizedToStart: false,
          assessmentStatus: 'started',
          challengeLiveAlert: {
            type: 'challenge',
            status: 'ongoing',
            hasEmbed: false,
            hasAttachment: false,
            isFocus: false,
            hasImage: false,
          },
        });

        // when
        const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);

        // then
        assert.dom(screen.getByRole('button', { name: 'Gérer le signalement' })).exists();
        await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));
        assert.dom(screen.getByText('Autoriser la reprise du test')).exists();
        assert.dom(screen.getByText('Terminer le test')).exists();
      });
    });
  });

  module('when the candidate has left the session and has been authorized to resume', function () {
    test('it renders the time and extra time', async function (assert) {
      // given
      this.candidate = store.createRecord('certification-candidate-for-supervising', {
        id: '456',
        startDateTime: new Date('2022-10-19T14:30:15Z'),
        theoricalEndDateTime: new Date('2022-10-19T16:00:00Z'),
        extraTimePercentage: 0.12,
        authorizedToStart: true,
        assessmentStatus: 'started',
      });

      // when
      const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);

      // then
      assert.dom(screen.getByText('Début :')).exists();
      assert.dom(screen.getByText('Fin théorique :')).exists();
      assert.dom(screen.getByText('+ temps majoré 12 %')).exists();
      assert.dom(screen.queryByText('En cours')).exists();
      assert.dom(screen.queryByText('Signalement en cours')).doesNotExist();
      assert.dom(screen.queryByText('Terminé')).doesNotExist();
    });
  });

  module('when the candidate has completed the test', function () {
    test('it does not render the time nor extra time', async function (assert) {
      // given
      this.candidate = store.createRecord('certification-candidate-for-supervising', {
        id: '456',
        startDateTime: new Date('2022-10-19T14:30:15Z'),
        theoricalEndDateTime: new Date('2022-10-19T16:00:00Z'),
        extraTimePercentage: 12,
        authorizedToStart: false,
        assessmentStatus: 'completed',
      });

      // when
      const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);

      // then
      assert.dom(screen.getByText('Terminé')).exists();
      assert.dom(screen.queryByText('Début :')).doesNotExist();
      assert.dom(screen.queryByText('Fin théorique :')).doesNotExist();
      assert.dom(screen.queryByText('+ temps majoré 12 %')).doesNotExist();
      assert.dom(screen.queryByText('Signalement en cours')).doesNotExist();
      assert.dom(screen.queryByText('En cours')).doesNotExist();
    });
  });

  module('when the candidate has alerted the invigilator', function () {
    module('when the live alert type is challenge', function () {
      test('it displays the live alert tag', async function (assert) {
        // given
        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: '456',
          startDateTime: new Date('2022-10-19T14:30:15Z'),
          theoricalEndDateTime: new Date('2022-10-19T16:00:00Z'),
          extraTimePercentage: 0.12,
          authorizedToStart: false,
          assessmentStatus: 'started',
          challengeLiveAlert: {
            type: 'challenge',
            status: 'ongoing',
            hasEmbed: false,
            hasAttachment: false,
            isFocus: false,
            hasImage: false,
          },
          companionLiveAlert: null,
        });

        // when
        const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);

        // then
        assert
          .dom(screen.getByText(t('common.forms.certification-labels.candidate-status.live-alerts.challenge.ongoing')))
          .exists();
        assert.dom(screen.getByText(t('common.forms.certification-labels.candidate-status.on-hold'))).exists();
        assert.dom(screen.queryByText('common.forms.certification-labels.candidate-status.ongoing')).doesNotExist();
        assert.dom(screen.queryByText(t('common.forms.certification-labels.candidate-status.finished'))).doesNotExist();
      });

      test('it displays the alert', async function (assert) {
        // given
        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: '456',
          startDateTime: new Date('2022-10-19T14:30:15Z'),
          theoricalEndDateTime: new Date('2022-10-19T16:00:00Z'),
          extraTimePercentage: 0.12,
          authorizedToStart: false,
          assessmentStatus: 'started',
          challengeLiveAlert: {
            type: 'challenge',
            status: 'ongoing',
            hasEmbed: false,
            hasAttachment: false,
            isFocus: false,
            hasImage: false,
          },
        });

        // when
        const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);
        await click(screen.getByRole('button', { name: 'Gérer le signalement' }));

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

      module('when the invigilator validates the live alert and the adapter fails', function () {
        test('it displays a specific notification for the ALREADY_ANSWERED_ERROR code', async function (assert) {
          // given
          const pixToast = this.owner.lookup('service:pixToast');
          sinon.stub(pixToast, 'sendErrorNotification');
          const adapter = store.adapterFor('session-management');
          adapter.validateLiveAlert = sinon
            .stub()
            .rejects({ errors: [{ code: 'ALREADY_ANSWERED_ERROR', detail: 'error message' }] });

          this.candidate = store.createRecord('certification-candidate-for-supervising', {
            id: '456',
            startDateTime: new Date('2022-10-19T14:30:15Z'),
            theoricalEndDateTime: new Date('2022-10-19T16:00:00Z'),
            extraTimePercentage: 0.12,
            authorizedToStart: false,
            assessmentStatus: 'started',
            challengeLiveAlert: {
              type: 'challenge',
              status: 'ongoing',
              hasEmbed: false,
              hasAttachment: false,
              isFocus: false,
              hasImage: false,
            },
          });

          // when
          const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);
          await click(screen.getByRole('button', { name: 'Gérer le signalement' }));
          await click(
            await screen.findByRole('radio', {
              name: t('pages.session-finalization.add-issue-modal.subcategory-labels.website-unavailable'),
            }),
          );
          await click(
            screen.getByRole('button', {
              name: t('pages.session-supervising.candidate-in-list.handle-live-alert-modal.ask.validate-alert-button'),
            }),
          );

          // then
          sinon.assert.calledOnceWithExactly(pixToast.sendErrorNotification, {
            message: t(
              'pages.session-supervising.candidate-in-list.handle-live-alert-modal.error-handling.challenge-already-answered',
            ),
          });
          assert.ok(true);
        });

        test('it displays a generic notification for any other error', async function (assert) {
          // given
          const pixToast = this.owner.lookup('service:pixToast');
          sinon.stub(pixToast, 'sendErrorNotification');
          const adapter = store.adapterFor('session-management');
          adapter.validateLiveAlert = sinon.stub().rejects({ errors: [{}] });

          this.candidate = store.createRecord('certification-candidate-for-supervising', {
            id: '456',
            startDateTime: new Date('2022-10-19T14:30:15Z'),
            theoricalEndDateTime: new Date('2022-10-19T16:00:00Z'),
            extraTimePercentage: 0.12,
            authorizedToStart: false,
            assessmentStatus: 'started',
            challengeLiveAlert: {
              type: 'challenge',
              status: 'ongoing',
              hasEmbed: false,
              hasAttachment: false,
              isFocus: false,
              hasImage: false,
            },
          });

          // when
          const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);
          await click(screen.getByRole('button', { name: 'Gérer le signalement' }));
          await click(
            await screen.findByRole('radio', {
              name: t('pages.session-finalization.add-issue-modal.subcategory-labels.website-unavailable'),
            }),
          );
          await click(
            screen.getByRole('button', {
              name: t('pages.session-supervising.candidate-in-list.handle-live-alert-modal.ask.validate-alert-button'),
            }),
          );

          // then
          sinon.assert.calledOnceWithExactly(pixToast.sendErrorNotification, {
            message: t(
              'pages.session-supervising.candidate-in-list.handle-live-alert-modal.error-handling.miscellaneous',
            ),
          });
          assert.ok(true);
        });
      });

      module('when the invigilator rejects the live alert and the adapter fails', function () {
        test('it displays a generic error notification', async function (assert) {
          // given
          const pixToast = this.owner.lookup('service:pixToast');
          sinon.stub(pixToast, 'sendErrorNotification');
          const adapter = store.adapterFor('session-management');
          adapter.dismissLiveAlert = sinon.stub().rejects();

          this.candidate = store.createRecord('certification-candidate-for-supervising', {
            id: '456',
            startDateTime: new Date('2022-10-19T14:30:15Z'),
            theoricalEndDateTime: new Date('2022-10-19T16:00:00Z'),
            extraTimePercentage: 0.12,
            authorizedToStart: false,
            assessmentStatus: 'started',
            challengeLiveAlert: {
              type: 'challenge',
              status: 'ongoing',
              hasEmbed: false,
              hasAttachment: false,
              isFocus: false,
              hasImage: false,
            },
          });

          // when
          const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);
          await click(screen.getByRole('button', { name: 'Gérer le signalement' }));
          await click(
            await screen.findByRole('button', {
              name: t('pages.session-supervising.candidate-in-list.handle-live-alert-modal.ask.dismiss-alert-button'),
            }),
          );

          // then
          sinon.assert.calledOnceWithExactly(pixToast.sendErrorNotification, {
            message: t(
              'pages.session-supervising.candidate-in-list.handle-live-alert-modal.error-handling.miscellaneous',
            ),
          });
          assert.ok(true);
        });
      });
    });

    module('when the live alert type is companion', function () {
      test('it displays the live alert tag', async function (assert) {
        // given
        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: '456',
          startDateTime: new Date('2022-10-19T14:30:15Z'),
          theoricalEndDateTime: new Date('2022-10-19T16:00:00Z'),
          extraTimePercentage: 0.12,
          authorizedToStart: false,
          assessmentStatus: 'started',
          companionLiveAlert: { type: 'companion', status: 'ONGOING' },
        });

        // when
        const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);

        // then
        assert
          .dom(screen.getByText(t('common.forms.certification-labels.candidate-status.live-alerts.companion.ongoing')))
          .exists();
        assert.dom(screen.getByText(t('common.forms.certification-labels.candidate-status.on-hold'))).exists();
        assert
          .dom(
            screen.queryByText(t('common.forms.certification-labels.candidate-status.live-alerts.challenge.ongoing')),
          )
          .doesNotExist();
      });

      test('it displays the alert', async function (assert) {
        // given
        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          firstName: 'Alain',
          lastName: 'Cendy',
          id: '456',
          startDateTime: new Date('2022-10-19T14:30:15Z'),
          theoricalEndDateTime: new Date('2022-10-19T16:00:00Z'),
          extraTimePercentage: 0.12,
          authorizedToStart: false,
          assessmentStatus: 'started',
          companionLiveAlert: { type: 'companion', status: 'ONGOING' },
        });

        // when
        const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);
        await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));
        await click(screen.getByRole('button', { name: 'Confirmer la présence de l’extension' }));

        // then
        await screen.findByRole('dialog');
        assert.dom(screen.getByRole('heading', { name: 'Confirmer que Alain Cendy a bien l’extension ?' })).exists();
      });
    });
  });

  module('when calculating theoretical end time for different certification types', function () {
    module('when candidate has Pix+ Droit certification', function () {
      test('it calculates end time using 1 hour duration', async function (assert) {
        // given
        const startTime = new Date('2022-10-19T14:30:00Z');
        const expectedEndTime = dayjs(startTime).add(60, 'minute').format('HH:mm');

        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: '456',
          firstName: 'Marie',
          lastName: 'Dupont',
          startDateTime: startTime,
          theoricalEndDateTime: new Date('2022-10-19T16:15:00Z'),
          subscription: 'DROIT',
          assessmentStatus: 'started',
        });

        // when
        const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);

        // then
        assert.dom(screen.getByText(expectedEndTime)).exists();
      });
    });

    module('when candidate has Pix+ Pro Santé certification', function () {
      test('it calculates end time using 1 hour duration', async function (assert) {
        // given
        const startTime = new Date('2022-10-19T10:00:00Z');
        const expectedEndTime = dayjs(startTime).add(60, 'minute').format('HH:mm');

        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: '456',
          firstName: 'Jean',
          lastName: 'Martin',
          startDateTime: startTime,
          theoricalEndDateTime: new Date('2022-10-19T11:45:00Z'),
          subscription: 'PRO_SANTE',
          assessmentStatus: 'started',
        });

        // when
        const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);

        // then
        assert.dom(screen.getByText(expectedEndTime)).exists();
      });
    });

    module('when candidate has Pix+ Edu certification', function () {
      test('it calculates end time using 90 minutes duration for 1er degré', async function (assert) {
        // given
        const startTime = new Date('2022-10-19T09:00:00Z');
        const expectedEndTime = dayjs(startTime).add(90, 'minute').format('HH:mm');

        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: '456',
          firstName: 'Pierre',
          lastName: 'Durand',
          startDateTime: startTime,
          theoricalEndDateTime: new Date('2022-10-19T10:45:00Z'),
          subscription: 'EDU_1ER_DEGRE',
          assessmentStatus: 'started',
        });

        // when
        const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);

        // then
        assert.dom(screen.getByText(expectedEndTime)).exists();
      });

      test('it calculates end time using 90 minutes duration for 2nd degré', async function (assert) {
        // given
        const startTime = new Date('2022-10-19T14:15:00Z');
        const expectedEndTime = dayjs(startTime).add(90, 'minute').format('HH:mm');

        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: '456',
          firstName: 'Sophie',
          lastName: 'Bernard',
          startDateTime: startTime,
          theoricalEndDateTime: new Date('2022-10-19T16:00:00Z'),
          subscription: 'EDU_2ND_DEGRE',
          assessmentStatus: 'started',
        });

        // when
        const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);

        // then
        assert.dom(screen.getByText(expectedEndTime)).exists();
      });

      test('it calculates end time using 90 minutes duration for CPE', async function (assert) {
        // given
        const startTime = new Date('2022-10-19T16:30:00Z');
        const expectedEndTime = dayjs(startTime).add(90, 'minute').format('HH:mm');

        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: '456',
          firstName: 'Antoine',
          lastName: 'Moreau',
          startDateTime: startTime,
          theoricalEndDateTime: new Date('2022-10-19T18:15:00Z'),
          subscription: 'EDU_CPE',
          assessmentStatus: 'started',
        });

        // when
        const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);

        // then
        assert.dom(screen.getByText(expectedEndTime)).exists();
      });
    });

    module('when candidate has standard Pix certification', function () {
      test('it uses backend calculated theoretical end time', async function (assert) {
        // given
        const backendEndTime = new Date('2022-10-19T16:15:00Z');
        const expectedDisplayTime = dayjs(backendEndTime).format('HH:mm');

        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: '456',
          firstName: 'Claire',
          lastName: 'Dubois',
          startDateTime: new Date('2022-10-19T14:30:00Z'),
          theoricalEndDateTime: backendEndTime,
          assessmentStatus: 'started',
        });

        // when
        const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);

        // then
        assert.dom(screen.getByText(expectedDisplayTime)).exists();
      });
    });

    module('when candidate has CléA certification', function () {
      test('it uses backend calculated theoretical end time', async function (assert) {
        // given
        const backendEndTime = new Date('2022-10-19T14:45:00Z');
        const expectedDisplayTime = dayjs(backendEndTime).format('HH:mm');

        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: '456',
          firstName: 'Lucas',
          lastName: 'Petit',
          startDateTime: new Date('2022-10-19T13:00:00Z'),
          theoricalEndDateTime: backendEndTime,
          subscription: 'CLEA',
          assessmentStatus: 'started',
        });

        // when
        const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);

        // then
        assert.dom(screen.getByText(expectedDisplayTime)).exists();
      });
    });

    module('when candidate has unknown complementary certification', function () {
      test('it uses backend calculated theoretical end time as fallback', async function (assert) {
        // given
        const backendEndTime = new Date('2022-10-19T12:45:00Z');
        const expectedDisplayTime = dayjs(backendEndTime).format('HH:mm');

        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: '456',
          firstName: 'Emma',
          lastName: 'Leroy',
          startDateTime: new Date('2022-10-19T11:00:00Z'),
          theoricalEndDateTime: backendEndTime,
          subscription: 'UNKNOWN',
          assessmentStatus: 'started',
        });

        // when
        const screen = await renderScreen(hbs`<SessionSupervising::CandidateInList @candidate={{this.candidate}} />`);

        // then
        assert.dom(screen.getByText(expectedDisplayTime)).exists();
      });
    });
  });
});
