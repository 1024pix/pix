import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL, settled } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { Response } from 'miragejs';
import { assessmentStates } from 'mon-pix/models/assessment';
import { module, test } from 'qunit';

import { authenticate } from '../helpers/authentication';
import { fillCertificationJoiner, fillCertificationStarter } from '../helpers/certification';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Certification | Certification Course', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let user;

  module('Start a certification course', function () {
    module('When user is not logged in', function () {
      test('should redirect to login page', async function (assert) {
        // given
        user = server.create('user', 'withEmail');

        // when
        await visit('/certifications');

        // then
        assert.ok(/connexion/.test(currentURL()));
      });
    });

    module('When user is logged in', function () {
      module('When user is not certifiable', function () {
        test('should render the not certifiable template', async function (assert) {
          // given
          user = server.create('user', 'withEmail', 'notCertifiable');
          await authenticate(user);

          // when
          const screen = await visit('/certifications');

          // then
          assert.dom(screen.getByRole('heading', { name: "Votre profil n'est pas encore certifiable." })).exists();
        });
      });

      module('When user is certifiable', function (hooks) {
        hooks.beforeEach(async function () {
          user = server.create('user', 'withEmail', 'certifiable', { hasSeenOtherChallengesTooltip: true });
          await authenticate(user);
        });

        test("should display a link to user's certifications", async function (assert) {
          // when
          const screen = await visit('/certifications');

          // then
          assert.dom(screen.getByRole('link', { name: 'Certification' })).exists();
        });

        module('when no candidate with given info has been registered in the given session', function () {
          test('should display an error message', async function (assert) {
            // given
            const screen = await visit('/certifications');

            // when
            await fillCertificationJoiner({
              sessionId: '1',
              firstName: 'Laura',
              lastName: 'PasInscrite',
              dayOfBirth: '04',
              monthOfBirth: '01',
              yearOfBirth: '1990',
              intl: this.intl,
            });

            // then
            assert
              .dom(screen.getByText('Les informations saisies ne correspondent à aucun candidat inscrit à la session.'))
              .exists();
            assert.dom(screen.getByText('Vérifiez le numéro de session.')).exists();
            assert
              .dom(
                screen.getByText(
                  "Vérifiez auprès du surveillant la correspondance de vos informations personnelles avec la feuille d'émargement.",
                ),
              )
              .exists();
          });
        });

        module('when several candidates with given info are found in the given session', function () {
          test('should display an error message', async function (assert) {
            // given
            const screen = await visit('/certifications');

            // when
            await fillCertificationJoiner({
              sessionId: '1',
              firstName: 'Laura',
              lastName: 'PlusieursMatchs',
              dayOfBirth: '04',
              monthOfBirth: '01',
              yearOfBirth: '1990',
              intl: this.intl,
            });

            // then
            assert
              .dom(screen.getByText('Les informations saisies ne correspondent à aucun candidat inscrit à la session.'))
              .exists();
            assert.dom(screen.getByText('Vérifiez le numéro de session.')).exists();
            assert
              .dom(
                screen.getByText(
                  "Vérifiez auprès du surveillant la correspondance de vos informations personnelles avec la feuille d'émargement.",
                ),
              )
              .exists();
          });
        });

        module('when user has already been linked to another candidate in the session', function () {
          test('should display an error message', async function (assert) {
            // given
            const screen = await visit('/certifications');

            // when
            await fillCertificationJoiner({
              sessionId: '1',
              firstName: 'Laura',
              lastName: 'UtilisateurLiéAutre',
              dayOfBirth: '04',
              monthOfBirth: '01',
              yearOfBirth: '1990',
              intl: this.intl,
            });

            // then
            assert
              .dom(screen.getByText('Les informations saisies ne correspondent à aucun candidat inscrit à la session.'))
              .exists();
            assert.dom(screen.getByText('Vérifiez le numéro de session.')).exists();
            assert
              .dom(
                screen.getByText(
                  "Vérifiez auprès du surveillant la correspondance de vos informations personnelles avec la feuille d'émargement.",
                ),
              )
              .exists();
          });
        });

        module('when user is already linked to this candidate', function () {
          test('should redirect to certification start route', async function (assert) {
            // given
            await visit('/certifications');
            this.server.schema.certificationCandidates.create({
              id: 1,
              firstName: 'Laura',
              lastName: 'CandidatLiéUtilisateur',
              sessionId: 1,
              birthdate: '1990-01-04',
            });
            this.server.create('certification-candidate-subscription', {
              id: 1,
              sessionId: 1,
              eligibleSubscription: null,
              nonEligibleSubscription: null,
            });

            // when
            await fillCertificationJoiner({
              sessionId: '1',
              firstName: 'Laura',
              lastName: 'CandidatLiéUtilisateur',
              dayOfBirth: '04',
              monthOfBirth: '01',
              yearOfBirth: '1990',
              intl: this.intl,
            });

            // then
            assert.strictEqual(currentURL(), '/certifications/candidat/1');
          });
        });

        module('when user is successfully linked to the candidate', function () {
          test('should redirect to certification start route', async function (assert) {
            // given
            await visit('/certifications');
            this.server.create('certification-candidate-subscription', {
              id: 2,
              sessionId: 1,
              eligibleSubscription: null,
              nonEligibleSubscription: null,
            });

            // when
            await fillCertificationJoiner({
              sessionId: '1',
              firstName: 'Laura',
              lastName: 'Bravo',
              dayOfBirth: '04',
              monthOfBirth: '01',
              yearOfBirth: '1990',
              intl: this.intl,
            });

            // then
            assert.strictEqual(currentURL(), '/certifications/candidat/2');
          });
        });

        module('when user takes the certification course', function (hooks) {
          let certificationCourse;
          let assessment;
          const NB_CHALLENGES = 3;

          hooks.beforeEach(function () {
            for (let i = 0; i < NB_CHALLENGES; ++i) {
              server.create('challenge', 'forCertification');
            }
            certificationCourse = this.server.create('certification-course', {
              accessCode: 'ABCD12',
              sessionId: 1,
              nbChallenges: NB_CHALLENGES,
              firstName: 'Laura',
              lastName: 'Bravo',
            });
            assessment = certificationCourse.assessment;

            this.server.create('certification-candidate-subscription', {
              id: 2,
              sessionId: 1,
              eligibleSubscription: null,
              nonEligibleSubscription: null,
            });
          });

          module('when user enter a correct code session', function () {
            test('should be redirected on the first challenge of an assessment', async function (assert) {
              // given
              await visit('/certifications');

              await fillCertificationJoiner({
                sessionId: '1',
                firstName: 'Laura',
                lastName: 'Bravo',
                dayOfBirth: '04',
                monthOfBirth: '01',
                yearOfBirth: '1990',
                intl: this.intl,
              });

              // when
              await fillCertificationStarter({ accessCode: 'ABCD12', intl: this.intl });

              // then
              assert.true(currentURL().startsWith(`/assessments/${assessment.id}/challenges`));
            });

            test('should navigate to next challenge when we click pass', async function (assert) {
              // given
              const screen = await visit('/certifications');

              await fillCertificationJoiner({
                sessionId: '1',
                firstName: 'Laura',
                lastName: 'Bravo',
                dayOfBirth: '04',
                monthOfBirth: '01',
                yearOfBirth: '1990',
                intl: this.intl,
              });
              await fillCertificationStarter({ accessCode: 'ABCD12', intl: this.intl });

              // when
              await click(screen.getByRole('button', { name: 'Je passe et je vais à la prochaine question' }));

              // then
              assert.true(currentURL().startsWith(`/assessments/${assessment.id}/challenges`));
            });

            module('after skipping the all challenges of the certification course', function () {
              test('should navigate to redirect to certification result page at the end of the assessment', async function (assert) {
                // given
                const screen = await visit('/certifications');

                await fillCertificationJoiner({
                  sessionId: '1',
                  firstName: 'Laura',
                  lastName: 'Bravo',
                  dayOfBirth: '04',
                  monthOfBirth: '01',
                  yearOfBirth: '1990',
                  intl: this.intl,
                });
                await fillCertificationStarter({ accessCode: 'ABCD12', intl: this.intl });

                // when
                for (let i = 0; i < NB_CHALLENGES; ++i) {
                  await click(screen.getByRole('button', { name: 'Je passe et je vais à la prochaine question' }));
                }

                // then
                assert.strictEqual(currentURL(), `/certifications/${certificationCourse.id}/results`);
              });
            });
          });

          module('When stop and relaunch the certification course', function () {
            test('should be redirected directly on the certification course', async function (assert) {
              // given
              const screen = await visit('/certifications');
              await fillCertificationJoiner({
                sessionId: '1',
                firstName: 'Laura',
                lastName: 'Bravo',
                dayOfBirth: '04',
                monthOfBirth: '01',
                yearOfBirth: '1990',
                intl: this.intl,
              });
              await fillCertificationStarter({ accessCode: 'ABCD12', intl: this.intl });

              await click(screen.getByRole('button', { name: 'Je passe et je vais à la prochaine question' }));
              await visit('/');

              // when
              await visit(`/certifications/${certificationCourse.id}`);

              // then
              assert.true(currentURL().startsWith(`/assessments/${assessment.id}/challenges`));
            });
          });
        });
      });

      test('should display "Test terminé !"', async function (assert) {
        assert.timeout(5000);
        // given
        user = server.create('user', 'withEmail', 'certifiable', { hasSeenOtherChallengesTooltip: true });

        const NB_CHALLENGES = 3;
        for (let i = 0; i < NB_CHALLENGES; ++i) {
          server.create('challenge', 'forCertification');
        }
        this.server.create('certification-course', {
          accessCode: 'ABCD12',
          sessionId: 1,
          nbChallenges: NB_CHALLENGES,
          firstName: 'Laura',
          lastName: 'Bravo',
        });
        this.server.create('certification-candidate-subscription', {
          id: 2,
          sessionId: 1,
          eligibleSubscription: null,
          nonEligibleSubscription: null,
        });

        await authenticate(user);
        const screen = await visit('/certifications');
        await fillCertificationJoiner({
          sessionId: '1',
          firstName: 'Laura',
          lastName: 'Bravo',
          dayOfBirth: '04',
          monthOfBirth: '01',
          yearOfBirth: '1990',
          intl: this.intl,
        });
        await fillCertificationStarter({ accessCode: 'ABCD12', intl: this.intl });

        // when
        for (let i = 0; i < NB_CHALLENGES; ++i) {
          await click(screen.getByRole('button', { name: 'Je passe et je vais à la prochaine question' }));
        }

        // then
        assert.dom(screen.getByRole('heading', { name: 'Test terminé !' })).exists();
      });

      module('when test was ended by supervisor', function () {
        test('should display "Votre surveillant a mis fin…"', async function (assert) {
          // given
          const user = server.create('user', 'withEmail', 'certifiable', { hasSeenOtherChallengesTooltip: true });
          const certificationCourse = this.server.create('certification-course', {});
          this.server.create('assessment', {
            type: 'CERTIFICATION',
            certificationCourseId: certificationCourse.id,
            state: assessmentStates.ENDED_BY_SUPERVISOR,
          });

          // when
          await authenticate(user);
          const screen = await visit(`/certifications/${certificationCourse.id}/results`);

          // then
          assert
            .dom(
              screen.getByText(
                'Votre surveillant a mis fin à votre test de certification. Vous ne pouvez plus continuer de répondre aux questions.',
              ),
            )
            .exists();
        });
      });

      module('when user has already started the certification', function () {
        module('when test was ended by supervisor', function () {
          test('should redirect to "Votre surveillant a mis fin…"', async function (assert) {
            // given
            user = server.create('user', 'withEmail', 'certifiable', { hasSeenOtherChallengesTooltip: true });
            server.create('challenge', 'forCertification');
            server.create('challenge', 'forCertification');
            server.create('certification-course', {
              id: 99,
              accessCode: 'ABCD12',
              sessionId: 1,
              nbChallenges: 2,
              firstName: 'Laura',
              lastName: 'Bravo',
            });
            const assessment = server.create('assessment', {
              certificationCourseId: 99,
              type: 'CERTIFICATION',
              state: assessmentStates.STARTED,
            });
            server.create('certification-candidate-subscription', {
              id: 2,
              sessionId: 1,
              eligibleSubscription: null,
              nonEligibleSubscription: null,
            });

            await authenticate(user);
            const screen = await visit('/certifications');
            await fillCertificationJoiner({
              sessionId: '1',
              firstName: 'Laura',
              lastName: 'Bravo',
              dayOfBirth: '01',
              monthOfBirth: '01',
              yearOfBirth: '2000',
              intl: this.intl,
            });
            await fillCertificationStarter({ accessCode: 'ABCD12', intl: this.intl });

            // when
            assessment.update({ state: assessmentStates.ENDED_BY_SUPERVISOR });
            this.server.post('/answers', generate400Error('Le surveillant a mis fin à votre test de certification.'));

            await click(screen.getByRole('button', { name: 'Je passe et je vais à la prochaine question' }));

            // then
            assert
              .dom(
                screen.getByText(
                  'Votre surveillant a mis fin à votre test de certification. Vous ne pouvez plus continuer de répondre aux questions.',
                ),
              )
              .exists();
          });
        });
      });

      module('when test was ended by finalization', function () {
        test('should display "La session a été finalisée par votre centre de certification..."', async function (assert) {
          // given
          const user = server.create('user', 'withEmail', 'certifiable', { hasSeenOtherChallengesTooltip: true });
          const certificationCourse = this.server.create('certification-course', {});
          this.server.create('assessment', {
            certificationCourseId: certificationCourse.id,
            state: assessmentStates.ENDED_DUE_TO_FINALIZATION,
          });

          // when
          await authenticate(user);
          const screen = await visit(`/certifications/${certificationCourse.id}/results`);

          // then
          assert
            .dom(
              screen.getByText(
                'La session a été finalisée par votre centre de certification. Vous ne pouvez plus continuer de répondre aux questions.',
              ),
            )
            .exists();
        });
      });

      module('when passing a V2 certification', function () {
        test('should display the V2 feedback panel', async function (assert) {
          assert.timeout(5000);
          // given
          user = server.create('user', 'withEmail', 'certifiable', { hasSeenOtherChallengesTooltip: true });

          server.create('challenge', 'forCertification');

          this.server.create('certification-course', {
            accessCode: 'ABCD12',
            sessionId: 1,
            nbChallenges: 1,
            firstName: 'Laura',
            lastName: 'Bravo',
            version: 2,
          });
          this.server.create('certification-candidate-subscription', {
            id: 2,
            sessionId: 1,
            eligibleSubscription: null,
            nonEligibleSubscription: null,
          });

          await authenticate(user);
          const screen = await visit('/certifications');
          await fillCertificationJoiner({
            sessionId: '1',
            firstName: 'Laura',
            lastName: 'Bravo',
            dayOfBirth: '04',
            monthOfBirth: '01',
            yearOfBirth: '1990',
            intl: this.intl,
          });
          await fillCertificationStarter({ accessCode: 'ABCD12', intl: this.intl });

          // when
          await click(screen.getByRole('button', { name: 'Signaler un problème avec la question' }));

          // then
          assert
            .dom(
              screen.getByText(
                'Pour signaler un problème, appelez votre surveillant et communiquez-lui les informations suivantes :',
              ),
            )
            .exists();
        });
      });

      module('when passing a V3 certification', function () {
        test('should display the V3 feedback panel', async function (assert) {
          assert.timeout(5000);
          // given
          user = server.create('user', 'withEmail', 'certifiable', { hasSeenOtherChallengesTooltip: true });

          server.create('challenge', 'forCertification');

          this.server.create('certification-course', {
            accessCode: 'ABCD12',
            sessionId: 1,
            nbChallenges: 1,
            firstName: 'Laura',
            lastName: 'Bravo',
            version: 3,
          });

          this.server.create('certification-candidate-subscription', {
            id: 2,
            sessionId: 1,
            eligibleSubscription: null,
            nonEligibleSubscription: null,
          });

          await authenticate(user);
          const screen = await visit('/certifications');
          await fillCertificationJoiner({
            sessionId: '1',
            firstName: 'Laura',
            lastName: 'Bravo',
            dayOfBirth: '04',
            monthOfBirth: '01',
            yearOfBirth: '1990',
            intl: this.intl,
          });
          await fillCertificationStarter({ accessCode: 'ABCD12', intl: this.intl });

          // when
          await click(screen.getByRole('button', { name: 'Signaler un problème avec la question' }));
          // eslint-disable-next-line ember/no-settled-after-test-helper
          await settled();

          // then
          assert.dom(screen.getByText("Non, je reviens à l'épreuve")).exists();
        });

        module('when confirming invigilator calling', function () {
          test('it should disable challenge action buttons', async function (assert) {
            // given
            user = server.create('user', 'withEmail', 'certifiable', { hasSeenOtherChallengesTooltip: true });
            await authenticate(user);

            server.create('challenge', 'forCertification');

            this.server.create('certification-course', {
              accessCode: 'ABCD12',
              sessionId: 1,
              nbChallenges: 1,
              firstName: 'Laura',
              lastName: 'Bravo',
              version: 3,
            });

            this.server.create('certification-candidate-subscription', {
              id: 2,
              sessionId: 1,
              eligibleSubscription: null,
              nonEligibleSubscription: null,
            });

            const screen = await visit('/certifications');
            await fillCertificationJoiner({
              sessionId: '1',
              firstName: 'Laura',
              lastName: 'Bravo',
              dayOfBirth: '04',
              monthOfBirth: '01',
              yearOfBirth: '1990',
              intl: this.intl,
            });
            await fillCertificationStarter({ accessCode: 'ABCD12', intl: this.intl });
            await click(screen.getByRole('button', { name: 'Signaler un problème avec la question' }));

            // when
            await click(screen.getByRole('button', { name: 'Oui, je suis sûr(e)' }));
            // eslint-disable-next-line ember/no-settled-after-test-helper
            await settled();

            // then
            assert
              .dom(screen.getByRole('button', { name: 'Je passe et je vais à la prochaine question' }))
              .hasAttribute('disabled');
            assert
              .dom(screen.getByRole('button', { name: 'Je valide et je vais à la prochaine question' }))
              .hasAttribute('disabled');
            assert.dom(screen.getByText('Les actions sont mises en pause en attendant le surveillant')).exists();
            assert
              .dom(screen.getByText("Prévenez votre surveillant afin qu'il puisse constater votre problème."))
              .exists();
          });
        });

        module('when refreshing the page', function () {
          test('it should keep challenge action buttons disabled', async function (assert) {
            assert.timeout(5000);
            // given
            user = server.create('user', 'withEmail', 'certifiable', { hasSeenOtherChallengesTooltip: true });

            server.create('challenge', 'forCertification');

            this.server.create('certification-course', {
              accessCode: 'ABCD12',
              sessionId: 1,
              nbChallenges: 1,
              firstName: 'Laura',
              lastName: 'Bravo',
              version: 3,
            });

            this.server.create('certification-candidate-subscription', {
              id: 2,
              sessionId: 1,
              eligibleSubscription: null,
              nonEligibleSubscription: null,
            });

            await authenticate(user);
            const screen = await visit('/certifications');
            await fillCertificationJoiner({
              sessionId: '1',
              firstName: 'Laura',
              lastName: 'Bravo',
              dayOfBirth: '04',
              monthOfBirth: '01',
              yearOfBirth: '1990',
              intl: this.intl,
            });
            await fillCertificationStarter({ accessCode: 'ABCD12', intl: this.intl });
            await click(screen.getByRole('button', { name: 'Signaler un problème avec la question' }));
            await click(screen.getByRole('button', { name: 'Oui, je suis sûr(e)' }));
            // eslint-disable-next-line ember/no-settled-after-test-helper
            await settled();

            // when
            await click(screen.getByRole('button', { name: 'Rafraîchir la page' }));
            // eslint-disable-next-line ember/no-settled-after-test-helper
            await settled();

            // then
            assert.dom(screen.queryByRole('button', { name: 'Signaler un problème avec la question' })).doesNotExist();
            assert
              .dom(screen.getByRole('button', { name: 'Je passe et je vais à la prochaine question' }))
              .hasAttribute('disabled');
            assert
              .dom(screen.getByRole('button', { name: 'Je valide et je vais à la prochaine question' }))
              .hasAttribute('disabled');
          });
        });
      });
    });
  });
});

function generate400Error(detail) {
  return () => {
    return new Response(
      400,
      {},
      {
        errors: [{ status: '400', detail }],
      },
    );
  };
}
