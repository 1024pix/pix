import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click, currentURL, find, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { authenticate } from '../helpers/authentication';
import { fillCertificationJoiner, fillCertificationStarter } from '../helpers/certification';
import setupIntl from '../helpers/setup-intl';
import { contains } from '../helpers/contains';
import { assessmentStates } from 'mon-pix/models/assessment';
import { Response } from 'miragejs';

module('Acceptance | Certification | Certification Course', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let user;

  module('Start a certification course', function () {
    module('When user is not logged in', function (hooks) {
      hooks.beforeEach(async function () {
        user = server.create('user', 'withEmail');
        await visit('/certifications');
      });

      test('should redirect to login page', function (assert) {
        // then
        assert.ok(/connexion/.test(currentURL()));
      });
    });

    module('When user is logged in', function () {
      module('When user is not certifiable', function (hooks) {
        hooks.beforeEach(async function () {
          user = server.create('user', 'withEmail', 'notCertifiable');
          await authenticate(user);
          return visit('/certifications');
        });

        test('should render the not certifiable template', function (assert) {
          assert.strictEqual(
            find('.certification-not-certifiable__title').textContent.trim(),
            "Votre profil n'est pas encore certifiable."
          );
        });
      });

      module('When user is certifiable', function (hooks) {
        hooks.beforeEach(async function () {
          user = server.create('user', 'withEmail', 'certifiable', { hasSeenOtherChallengesTooltip: true });
          await authenticate(user);
          return visit('/certifications');
        });

        test("should display a link to user's certifications", async function (assert) {
          // then
          assert.ok(contains(this.intl.t('pages.certification-start.link-to-user-certification')));
        });

        module('when no candidate with given info has been registered in the given session', function (hooks) {
          hooks.beforeEach(async function () {
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
          });

          test('should display an error message', function (assert) {
            // then
            assert.ok(contains(this.intl.t('pages.certification-joiner.error-messages.generic.disclaimer')));
            assert.ok(contains(this.intl.t('pages.certification-joiner.error-messages.generic.check-session-number')));
            assert.ok(contains(this.intl.t('pages.certification-joiner.error-messages.generic.check-personal-info')));
          });
        });

        module('when several candidates with given info are found in the given session', function (hooks) {
          hooks.beforeEach(async function () {
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
          });

          test('should display an error message', function (assert) {
            // then
            assert.ok(contains(this.intl.t('pages.certification-joiner.error-messages.generic.disclaimer')));
            assert.ok(contains(this.intl.t('pages.certification-joiner.error-messages.generic.check-session-number')));
            assert.ok(contains(this.intl.t('pages.certification-joiner.error-messages.generic.check-personal-info')));
          });
        });

        module('when user has already been linked to another candidate in the session', function (hooks) {
          hooks.beforeEach(async function () {
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
          });

          test('should display an error message', function (assert) {
            // then
            assert.ok(contains(this.intl.t('pages.certification-joiner.error-messages.generic.disclaimer')));
            assert.ok(contains(this.intl.t('pages.certification-joiner.error-messages.generic.check-session-number')));
            assert.ok(contains(this.intl.t('pages.certification-joiner.error-messages.generic.check-personal-info')));
          });
        });

        module('when user is already linked to this candidate', function (hooks) {
          hooks.beforeEach(async function () {
            // given
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
              eligibleSubscriptions: [],
              nonEligibleSubscriptions: [],
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
          });

          test('should redirect to certification start route', function (assert) {
            // then
            assert.strictEqual(currentURL(), '/certifications/candidat/1');
          });
        });

        module('when user is successfully linked to the candidate', function (hooks) {
          hooks.beforeEach(async function () {
            // given
            this.server.create('certification-candidate-subscription', {
              id: 2,
              sessionId: 1,
              eligibleSubscriptions: [],
              nonEligibleSubscriptions: [],
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
          });

          test('should redirect to certification start route', function (assert) {
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
              eligibleSubscriptions: [],
              nonEligibleSubscriptions: [],
            });
          });

          module('when user enter a correct code session', function (hooks) {
            hooks.beforeEach(async function () {
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
              await fillCertificationStarter({ accessCode: 'ABCD12', intl: this.intl });
            });

            test('should be redirected on the first challenge of an assessment', async function (assert) {
              // then
              assert.true(currentURL().startsWith(`/assessments/${assessment.id}/challenges`));
            });

            test('should navigate to next challenge when we click pass', async function (assert) {
              // when
              await click('.challenge-actions__action-skip-text');
              // then
              assert.true(currentURL().startsWith(`/assessments/${assessment.id}/challenges`));
            });

            module('after skipping the all challenges of the certification course', function () {
              test('should navigate to redirect to certification result page at the end of the assessment', async function (assert) {
                // when
                for (let i = 0; i < NB_CHALLENGES; ++i) {
                  await click('.challenge-actions__action-skip');
                }

                // then
                assert.strictEqual(currentURL(), `/certifications/${certificationCourse.id}/results`);
              });
            });
          });

          module('When stop and relaunch the certification course', function () {
            test('should be redirected directly on the certification course', async function (assert) {
              // given
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

              await click('.challenge-actions__action-skip');
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
          eligibleSubscriptions: [],
          nonEligibleSubscriptions: [],
        });

        await authenticate(user);
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
        await fillCertificationStarter({ accessCode: 'ABCD12', intl: this.intl });

        // when
        for (let i = 0; i < NB_CHALLENGES; ++i) {
          await click('.challenge-actions__action-skip');
        }

        // then
        assert.ok(contains('Test terminé !'));
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
          await visit(`/certifications/${certificationCourse.id}/results`);

          // then
          assert.ok(
            contains(
              'Votre surveillant a mis fin à votre test de certification. Vous ne pouvez plus continuer de répondre aux questions.'
            )
          );
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
              eligibleSubscriptions: [],
              nonEligibleSubscriptions: [],
            });

            await authenticate(user);
            await visit('/certifications');
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
            await click('.challenge-actions__action-skip');

            // then
            assert.ok(
              contains(
                'Votre surveillant a mis fin à votre test de certification. Vous ne pouvez plus continuer de répondre aux questions.'
              )
            );
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
          await visit(`/certifications/${certificationCourse.id}/results`);

          // then
          assert.ok(
            contains(
              'La session a été finalisée par votre centre de certification. Vous ne pouvez plus continuer de répondre aux questions.'
            )
          );
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
      }
    );
  };
}
