import { module, test } from 'qunit';
import Service from '@ember/service';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { waitForDialogClose } from '../../../helpers/wait-for';

import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

module('Integration | Component | SessionSupervising::CandidateInList', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
    class FeatureTogglesStub extends Service {
      featureToggles = { isDifferentiatedTimeInvigilatorPortalEnabled: false };
    }
    this.owner.register('service:featureToggles', FeatureTogglesStub);
  });

  module('when FT_DIFFERENTIATED_TIME_INVIGILATOR_PORTAL is enabled', function (hooks) {
    hooks.beforeEach(async function () {
      store = this.owner.lookup('service:store');
      class FeatureTogglesStub extends Service {
        featureToggles = { isDifferentiatedTimeInvigilatorPortalEnabled: true };
      }
      this.owner.register('service:featureToggles', FeatureTogglesStub);
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
      class FeatureTogglesStub extends Service {
        featureToggles = { isDifferentiatedTimeInvigilatorPortalEnabled: true };
      }
      this.owner.register('service:featureToggles', FeatureTogglesStub);
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
        class FeatureTogglesStub extends Service {
          featureToggles = { isDifferentiatedTimeInvigilatorPortalEnabled: true };
        }
        this.owner.register('service:featureToggles', FeatureTogglesStub);
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
        class FeatureTogglesStub extends Service {
          featureToggles = { isDifferentiatedTimeInvigilatorPortalEnabled: true };
        }
        this.owner.register('service:featureToggles', FeatureTogglesStub);
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
          class FeatureTogglesStub extends Service {
            featureToggles = { isDifferentiatedTimeInvigilatorPortalEnabled: true };
          }
          this.owner.register('service:featureToggles', FeatureTogglesStub);
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
          class FeatureTogglesStub extends Service {
            featureToggles = { isDifferentiatedTimeInvigilatorPortalEnabled: true };
          }
          this.owner.register('service:featureToggles', FeatureTogglesStub);
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
          class FeatureTogglesStub extends Service {
            featureToggles = { isDifferentiatedTimeInvigilatorPortalEnabled: true };
          }
          this.owner.register('service:featureToggles', FeatureTogglesStub);
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
        class FeatureTogglesStub extends Service {
          featureToggles = { isDifferentiatedTimeInvigilatorPortalEnabled: true };
        }
        this.owner.register('service:featureToggles', FeatureTogglesStub);
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
      });
    });

    module('when the candidate has left the session and has been authorized to resume', function () {
      test('it renders the time and extra time', async function (assert) {
        // given
        class FeatureTogglesStub extends Service {
          featureToggles = { isDifferentiatedTimeInvigilatorPortalEnabled: true };
        }
        this.owner.register('service:featureToggles', FeatureTogglesStub);
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
      });
    });

    module('when the candidate has completed the test', function () {
      test('it does not render the time nor extra time', async function (assert) {
        // given
        class FeatureTogglesStub extends Service {
          featureToggles = { isDifferentiatedTimeInvigilatorPortalEnabled: true };
        }
        this.owner.register('service:featureToggles', FeatureTogglesStub);
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
      });
    });
  });

  test('it renders the candidates information with an unchecked checkbox', async function (assert) {
    // given
    this.candidate = store.createRecord('certification-candidate-for-supervising', {
      id: 123,
      firstName: 'Gamora',
      lastName: 'Zen Whoberi Ben Titan',
      birthdate: '1984-05-28',
      extraTimePercentage: 0.08,
      authorizedToStart: false,
      assessmentStatus: null,
      enrolledComplementaryCertificationLabel: 'Super Certification Complémentaire',
    });

    // when
    const screen = await renderScreen(hbs`
      <SessionSupervising::CandidateInList @candidate={{this.candidate}} />
    `);

    // then
    assert.dom(screen.getByText('Zen Whoberi Ben Titan Gamora')).exists();
    assert.dom(screen.getByText('28/05/1984 · Temps majoré : 8 %')).exists();
    assert.dom(screen.queryByText('Inscription à Super Certification Complémentaire')).doesNotExist();
    assert
      .dom(screen.getByRole('checkbox', { name: "Confirmer la présence de l'élève Gamora Zen Whoberi Ben Titan" }))
      .isNotChecked();
    assert
      .dom(
        screen.queryByText(
          'Candidat pas ou plus éligible à la certification complémentaire. Il passe la certification Pix.',
        ),
      )
      .doesNotExist();
  });

  module('when the candidate is authorized to start', function () {
    test('it renders the checkbox checked', async function (assert) {
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
      assert.dom(screen.getByText('28/06/1983 · Temps majoré : 12 %')).exists();
      assert
        .dom(screen.getByRole('checkbox', { name: "Annuler la confirmation de présence de l'élève Star Lord" }))
        .isChecked();
    });

    test('it does not display neither "en cours" label nor the options menu button', async function (assert) {
      // given
      this.candidate = store.createRecord('certification-candidate-for-supervising', {
        id: 789,
        firstName: 'Rocket',
        lastName: 'Racoon',
        birthdate: '1982-07-28',
        extraTimePercentage: null,
        authorizedToStart: true,
        assessmentStatus: null,
      });

      // when
      const screen = await renderScreen(hbs`
        <SessionSupervising::CandidateInList @candidate={{this.candidate}} />
      `);

      // then
      assert.dom(screen.queryByRole('button', { name: 'Afficher les options du candidat' })).doesNotExist();
      assert.dom(screen.queryByText('En cours')).doesNotExist();
    });
  });

  module('when the candidate has started the test', function () {
    module('when the candidate has not left the session', function () {
      test('it displays the "en cours" label, the start time and the options menu button', async function (assert) {
        // given
        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: 789,
          firstName: 'Rocket',
          lastName: 'Racoon',
          birthdate: '1982-07-28',
          extraTimePercentage: null,
          authorizedToStart: false,
          assessmentStatus: 'started',
          startDateTime: new Date('2022-10-19T14:30:15Z'),
        });

        // when
        const screen = await renderScreen(hbs`
          <SessionSupervising::CandidateInList @candidate={{this.candidate}} />
        `);

        // then
        assert.dom(screen.getByText('Racoon Rocket')).exists();
        assert.dom(screen.getByText('28/07/1982')).exists();
        assert.dom(screen.getByText('En cours')).exists();
        assert.dom(screen.queryByText('Autorisé à reprendre')).doesNotExist();
        assert.dom(screen.queryByRole('checkbox', { name: 'Racoon Rocket' })).doesNotExist();
        assert
          .dom(
            screen.queryByRole('button', {
              name: 'Afficher les options du candidat',
            }),
          )
          .exists();
      });
    });

    module('when the candidate has left the session and has been authorized to resume', function () {
      test('it displays the "Autorisé à reprendre" label, the start time and the options menu button', async function (assert) {
        // given
        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: 789,
          firstName: 'Rocket',
          lastName: 'Racoon',
          birthdate: '1982-07-28',
          extraTimePercentage: null,
          authorizedToStart: true,
          assessmentStatus: 'started',
          startDateTime: new Date('2022-10-19T14:30:15Z'),
        });

        // when
        const screen = await renderScreen(hbs`
          <SessionSupervising::CandidateInList @candidate={{this.candidate}} />
        `);

        // then
        assert.dom(screen.getByText('Autorisé à reprendre')).exists();
        assert.dom(screen.queryByText('En cours')).doesNotExist();
      });
    });

    module('when the candidate options button is clicked', function () {
      test('it displays the "autoriser la reprise" option', async function (assert) {
        // given
        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: 1123,
          firstName: 'Drax',
          lastName: 'The Destroyer',
          birthdate: '1928-08-27',
          extraTimePercentage: null,
          authorizedToStart: true,
          assessmentStatus: 'started',
        });

        const screen = await renderScreen(hbs`
          <SessionSupervising::CandidateInList @candidate={{this.candidate}} />
        `);

        // when
        await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));

        // then
        assert.dom(screen.getByRole('button', { name: 'Autoriser la reprise du test' })).exists();
      });

      test('it displays the "Terminer le test" option', async function (assert) {
        // given
        this.candidate = store.createRecord('certification-candidate-for-supervising', {
          id: 1123,
          firstName: 'Drax',
          lastName: 'The Destroyer',
          birthdate: '1928-08-27',
          extraTimePercentage: null,
          authorizedToStart: true,
          assessmentStatus: 'started',
        });
        this.toggleCandidate = sinon.spy();
        const screen = await renderScreen(hbs`
          <SessionSupervising::CandidateInList
            @candidate={{this.candidate}}
            @toggleCandidate={{this.toggleCandidate}}
          />
        `);

        // when
        await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));

        // then
        assert.dom(screen.getByRole('button', { name: 'Terminer le test' })).exists();
      });

      module('when the "autoriser la reprise" option is clicked', function () {
        test('it displays a confirmation modal', async function (assert) {
          // given
          this.candidate = store.createRecord('certification-candidate-for-supervising', {
            id: 1123,
            firstName: 'Drax',
            lastName: 'The Destroyer',
            birthdate: '1928-08-27',
            extraTimePercentage: null,
            authorizedToStart: true,
            assessmentStatus: 'started',
          });

          const screen = await renderScreen(hbs`
            <SessionSupervising::CandidateInList @candidate={{this.candidate}} />
          `);

          // when
          await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));
          await click(screen.getByRole('button', { name: 'Autoriser la reprise du test' }));
          await screen.findByRole('dialog');

          // then
          assert.dom(screen.getByRole('button', { name: "Je confirme l'autorisation" })).exists();
          assert.dom(screen.getByText('Autoriser Drax The Destroyer à reprendre son test ?')).exists();
          assert
            .dom(
              screen.getByText(
                "Si le candidat a fermé la fenêtre de son test de certification (par erreur, ou à cause d'un problème technique) et est toujours présent dans la salle de test, vous pouvez lui permettre de reprendre son test à l'endroit où il l'avait quitté.",
              ),
            )
            .exists();
        });

        module('when the confirmation modal "Annuler" button is clicked', function () {
          test('it closes the confirmation modal', async function (assert) {
            // given
            this.candidate = store.createRecord('certification-candidate-for-supervising', {
              id: 1123,
              firstName: 'Drax',
              lastName: 'The Destroyer',
              birthdate: '1928-08-27',
              extraTimePercentage: null,
              authorizedToStart: true,
              assessmentStatus: 'started',
            });

            const screen = await renderScreen(hbs`
              <SessionSupervising::CandidateInList @candidate={{this.candidate}} />
            `);

            // when
            await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));
            await click(screen.getByRole('button', { name: 'Autoriser la reprise du test' }));
            await screen.findByRole('dialog');
            await click(screen.getByRole('button', { name: 'Annuler et fermer la fenêtre de confirmation' }));
            await waitForDialogClose();

            // then
            assert.dom(screen.queryByRole('button', { name: "Je confirme l'autorisation" })).doesNotExist();
          });
        });

        module('when the confirmation modal "Fermer" button is clicked', function () {
          test('it closes the confirmation modal', async function (assert) {
            // given
            this.candidate = store.createRecord('certification-candidate-for-supervising', {
              id: 1123,
              firstName: 'Drax',
              lastName: 'The Destroyer',
              birthdate: '1928-08-27',
              extraTimePercentage: null,
              authorizedToStart: true,
              assessmentStatus: 'started',
            });

            const screen = await renderScreen(hbs`
              <SessionSupervising::CandidateInList @candidate={{this.candidate}} />
            `);

            // when
            await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));
            await click(screen.getByRole('button', { name: 'Autoriser la reprise du test' }));
            await screen.findByRole('dialog');
            await click(screen.getByRole('button', { name: 'Fermer' }));
            await waitForDialogClose();

            // then
            assert.dom(screen.queryByRole('button', { name: "Je confirme l'autorisation" })).doesNotExist();
          });
        });

        module('when the confirmation modal "Je confirme…" button is clicked', function () {
          module('when the authorization succeeds', function () {
            test('it closes the modal and displays a success notification', async function (assert) {
              // given
              this.candidate = store.createRecord('certification-candidate-for-supervising', {
                firstName: 'Yondu',
                lastName: 'Undonta',
                authorizedToStart: true,
                assessmentStatus: 'started',
              });
              this.authorizeTestResume = sinon.stub().resolves();
              const screen = await renderScreen(hbs`
                <SessionSupervising::CandidateInList
                  @candidate={{this.candidate}}
                  @onCandidateTestResumeAuthorization={{this.authorizeTestResume}}
                />
                <NotificationContainer @position="bottom-right" />
              `);

              // when
              await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));
              await click(screen.getByRole('button', { name: 'Autoriser la reprise du test' }));
              await screen.findByRole('dialog');
              await click(screen.getByRole('button', { name: "Je confirme l'autorisation" }));
              await waitForDialogClose();

              // then
              sinon.assert.calledOnce(this.authorizeTestResume);
              assert.dom(screen.queryByRole('button', { name: "Je confirme l'autorisation" })).doesNotExist();
              assert.dom(screen.getByText('Succès ! Yondu Undonta peut reprendre son test de certification.')).exists();
            });
          });

          module('when the authorization fails', function () {
            test('it closes the modal and displays an error notification', async function (assert) {
              // given
              this.candidate = store.createRecord('certification-candidate-for-supervising', {
                firstName: 'Vance',
                lastName: 'Astro',
                authorizedToStart: true,
                assessmentStatus: 'started',
              });
              this.authorizeTestResume = sinon.stub().rejects({ errors: [] });
              const screen = await renderScreen(hbs`
                <SessionSupervising::CandidateInList
                  @candidate={{this.candidate}}
                  @onCandidateTestResumeAuthorization={{this.authorizeTestResume}}
                />
                <NotificationContainer @position="bottom-right" />
              `);

              // when
              await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));
              await click(screen.getByRole('button', { name: 'Autoriser la reprise du test' }));
              await screen.findByRole('dialog');
              await click(screen.getByRole('button', { name: "Je confirme l'autorisation" }));
              await waitForDialogClose();

              // then
              sinon.assert.calledOnce(this.authorizeTestResume);
              assert.dom(screen.queryByRole('button', { name: "Je confirme l'autorisation" })).doesNotExist();
              assert
                .dom(
                  screen.getByText(
                    "Une erreur est survenue, Vance Astro n'a pas pu être autorisé à reprendre son test.",
                  ),
                )
                .exists();
            });
          });

          module('when the candidate could not be found', function () {
            test('it closes the modal and displays an error notification', async function (assert) {
              // given
              this.candidate = store.createRecord('certification-candidate-for-supervising', {
                firstName: 'Vance',
                lastName: 'Astro',
                authorizedToStart: true,
                assessmentStatus: 'started',
              });
              this.authorizeTestResume = sinon.stub().rejects({ errors: [{ code: 'CANDIDATE_NOT_FOUND' }] });
              const screen = await renderScreen(hbs`
                <SessionSupervising::CandidateInList
                  @candidate={{this.candidate}}
                  @onCandidateTestResumeAuthorization={{this.authorizeTestResume}}
                />
                <NotificationContainer @position="bottom-right" />
              `);

              // when
              await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));
              await click(screen.getByRole('button', { name: 'Autoriser la reprise du test' }));
              await screen.findByRole('dialog');
              await click(screen.getByRole('button', { name: "Je confirme l'autorisation" }));
              await waitForDialogClose();

              // then
              sinon.assert.calledOnce(this.authorizeTestResume);
              assert.dom(screen.queryByRole('button', { name: "Je confirme l'autorisation" })).doesNotExist();
              assert
                .dom(screen.getByText("Une erreur est survenue, le candidat Vance Astro n'a pas été trouvé."))
                .exists();
            });
          });
        });
      });

      module('when the "Terminer le test" option is clicked', function () {
        test('it displays a confirmation modal', async function (assert) {
          // given
          this.candidate = store.createRecord('certification-candidate-for-supervising', {
            id: 1123,
            firstName: 'Drax',
            lastName: 'The Destroyer',
            birthdate: '1928-08-27',
            extraTimePercentage: null,
            authorizedToStart: true,
            assessmentStatus: 'started',
          });
          this.toggleCandidate = sinon.spy();
          const screen = await renderScreen(hbs`
          <SessionSupervising::CandidateInList
            @candidate={{this.candidate}}
            @toggleCandidate={{this.toggleCandidate}}
          />
        `);

          // when
          await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));
          await click(screen.getByRole('button', { name: 'Terminer le test' }));
          await screen.findByRole('dialog');
          const actions = screen.getAllByRole('button', { name: 'Terminer le test' });

          // then
          assert.strictEqual(actions.length, 2);
          assert
            .dom(
              screen.getByText(
                'Attention : cette action entraîne la fin de son test de certification et est irréversible.',
              ),
            )
            .exists();
          assert.dom(screen.getByRole('heading', { name: 'Terminer le test de Drax The Destroyer ?' })).exists();
        });

        module('when the confirmation modal "Annuler" button is clicked', function () {
          test('it closes the confirmation modal', async function (assert) {
            // given
            this.candidate = store.createRecord('certification-candidate-for-supervising', {
              id: 1123,
              firstName: 'Drax',
              lastName: 'The Destroyer',
              birthdate: '1928-08-27',
              extraTimePercentage: null,
              authorizedToStart: true,
              assessmentStatus: 'started',
            });
            this.toggleCandidate = sinon.spy();
            const screen = await renderScreen(hbs`
          <SessionSupervising::CandidateInList
            @candidate={{this.candidate}}
            @toggleCandidate={{this.toggleCandidate}}
          />
        `);

            // when
            await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));
            await click(screen.getByRole('button', { name: 'Terminer le test' }));
            await screen.findByRole('dialog');
            await click(screen.getByRole('button', { name: 'Annuler et fermer la fenêtre de confirmation' }));
            await waitForDialogClose();

            // then
            assert.dom(screen.getByRole('button', { name: 'Afficher les options du candidat' })).exists();
            assert
              .dom(screen.queryByRole('heading', { name: 'Terminer le test de Drax The Destroyer ?' }))
              .doesNotExist();
          });
        });

        module('when the confirmation modal "Fermer" button is clicked', function () {
          test('it closes the confirmation modal', async function (assert) {
            // given
            this.candidate = store.createRecord('certification-candidate-for-supervising', {
              id: 1123,
              firstName: 'Drax',
              lastName: 'The Destroyer',
              birthdate: '1928-08-27',
              extraTimePercentage: null,
              authorizedToStart: true,
              assessmentStatus: 'started',
            });
            this.toggleCandidate = sinon.spy();
            const screen = await renderScreen(hbs`
          <SessionSupervising::CandidateInList
            @candidate={{this.candidate}}
            @toggleCandidate={{this.toggleCandidate}}
          />
        `);

            // when
            await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));
            await click(screen.getByRole('button', { name: 'Autoriser la reprise du test' }));
            await screen.findByRole('dialog');

            await click(screen.getByRole('button', { name: 'Fermer' }));
            await waitForDialogClose();

            // then
            assert
              .dom(screen.queryByRole('heading', { name: 'Autoriser Drax The Destroyer à reprendre son test ?' }))
              .doesNotExist();
          });
        });

        module('when the confirmation modal "Terminer le test" button is clicked', function () {
          module('when the end by supervisors succeeds', function () {
            test('it closes the end test modal and displays a success notification', async function (assert) {
              // given
              this.candidate = store.createRecord('certification-candidate-for-supervising', {
                firstName: 'Yondu',
                lastName: 'Undonta',
                authorizedToStart: true,
                assessmentStatus: 'started',
              });
              this.toggleCandidate = sinon.spy();
              this.endAssessmentForCandidate = sinon.stub().resolves();
              const screen = await renderScreen(hbs`
                <SessionSupervising::CandidateInList
                  @candidate={{this.candidate}}
                  @toggleCandidate={{this.toggleCandidate}}
                  @onSupervisorEndAssessment={{this.endAssessmentForCandidate}}
                />
                <NotificationContainer @position="bottom-right" />
              `);

              // when
              await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));
              await click(screen.getByRole('button', { name: 'Terminer le test' }));
              await screen.findByRole('dialog');
              const [, endTestModal] = screen.getAllByRole('button', { name: 'Terminer le test' });
              await click(endTestModal);
              await waitForDialogClose();

              // then
              sinon.assert.calledOnce(this.endAssessmentForCandidate);
              assert.dom(screen.getByText('Succès ! Le test de Yondu Undonta est terminé.')).exists();
            });
          });

          module('when the end by supervisor fails', function () {
            test('it closes the end test modal and displays an error notification', async function (assert) {
              // given
              this.candidate = store.createRecord('certification-candidate-for-supervising', {
                firstName: 'Vance',
                lastName: 'Astro',
                authorizedToStart: true,
                assessmentStatus: 'started',
              });
              this.toggleCandidate = sinon.spy();
              this.endAssessmentBySupervisor = sinon.stub().rejects();
              const screen = await renderScreen(hbs`
                <SessionSupervising::CandidateInList
                  @candidate={{this.candidate}}
                  @toggleCandidate={{this.toggleCandidate}}
                  @onSupervisorEndAssessment={{this.endAssessmentBySupervisor}}
                />
                <NotificationContainer @position="bottom-right" />
              `);

              // when
              await click(screen.getByRole('button', { name: 'Afficher les options du candidat' }));
              await click(screen.getByRole('button', { name: 'Terminer le test' }));
              await screen.findByRole('dialog');

              const [, endTestModal] = screen.getAllByRole('button', { name: 'Terminer le test' });
              await click(endTestModal);
              await waitForDialogClose();

              // then
              sinon.assert.calledOnce(this.endAssessmentBySupervisor);
              assert.dom(screen.queryByRole('heading', { name: 'Terminer le test de Vance Astro ?' })).doesNotExist();
              assert
                .dom(screen.getByText("Une erreur est survenue, le test de Vance Astro n'a pas pu être terminé."))
                .exists();
            });
          });
        });
      });
    });
  });

  module('when the candidate has completed the test', function () {
    test('it displays the "terminé" label and no options menu', async function (assert) {
      // given
      this.candidate = store.createRecord('certification-candidate-for-supervising', {
        firstName: 'Martinex',
        lastName: "T'Naga",
        birthdate: '1979-08-27',
        extraTimePercentage: null,
        authorizedToStart: true,
        assessmentStatus: 'completed',
      });

      // when
      const screen = await renderScreen(hbs`
        <SessionSupervising::CandidateInList @candidate={{this.candidate}} />
      `);

      // then
      assert.dom(screen.getByText("T'Naga Martinex")).exists();
      assert.dom(screen.getByText('27/08/1979')).exists();
      assert.dom(screen.getByText('Terminé')).exists();
      assert.dom(screen.queryByRole('checkbox', { name: "T'Naga Martinex" })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Afficher les options du candidat' })).doesNotExist();
    });
  });

  module("when the candidate's test has been ended by supervisor", function () {
    test('it displays the "terminé" label and no options menu', async function (assert) {
      // given
      this.candidate = store.createRecord('certification-candidate-for-supervising', {
        firstName: 'Stakar',
        lastName: 'Ogord',
        birthdate: '1976-09-26',
        extraTimePercentage: null,
        authorizedToStart: true,
        assessmentStatus: 'endedBySupervisor',
      });

      // when
      const screen = await renderScreen(hbs`
        <SessionSupervising::CandidateInList @candidate={{this.candidate}} />
      `);

      // then
      assert.dom(screen.getByText('Ogord Stakar')).exists();
      assert.dom(screen.getByText('26/09/1976')).exists();
      assert.dom(screen.getByText('Terminé')).exists();
      assert.dom(screen.queryByRole('checkbox', { name: 'Ogord Stakar' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Afficher les options du candidat' })).doesNotExist();
    });
  });

  module('when the checkbox is clicked', function () {
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
        const checkbox = screen.getByRole('checkbox');

        // when
        await checkbox.click();

        // then
        sinon.assert.calledOnceWithExactly(this.toggleCandidate, this.candidate);
        assert.ok(true);
      });
    });

    module('when the candidate is not authorized', function () {
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
