import Service from '@ember/service';
import { module, test } from 'qunit';
import { fillIn } from '@ember/test-helpers';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { render } from '@1024pix/ember-testing-library';
import { clickByLabel } from '../../helpers/click-by-label';

module('Integration | Component | certification-starter', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the candidate has no complementary certification subscriptions', function () {
    test('should not display subscriptions panel', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      this.set(
        'certificationCandidateSubscription',
        store.createRecord('certification-candidate-subscription', {
          eligibleSubscriptions: [],
          nonEligibleSubscriptions: [],
        })
      );
      this.set('certificationCandidateSubscription', { eligibleSubscriptions: [], nonEligibleSubscriptions: [] });

      // when
      const screen = await render(
        hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`
      );

      // then
      assert.notOk(
        screen.queryByText(
          "'Vous êtes inscrit aux certification(s) complémentaire(s) suivante(s) en plus de la certification Pix :'"
        )
      );
      assert.notOk(
        screen.queryByText(
          "Vous avez été inscrit à/aux certification(s) complémentaire(s) suivantes : mais vous n'y êtes pas éligible.\n"
        )
      );
    });
  });

  module('when the candidate has complementary certification subscriptions', function () {
    module('when the candidate is eligible', function () {
      test('should display subscription eligible panel', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        this.set(
          'certificationCandidateSubscription',
          store.createRecord('certification-candidate-subscription', {
            eligibleSubscriptions: [{ label: 'Certif complémentaire 1' }, { label: 'Certif complémentaire 2' }],
            nonEligibleSubscriptions: [],
          })
        );

        // when
        const screen = await render(
          hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`
        );

        // then
        assert.ok(
          screen.getByText(
            'Vous êtes inscrit aux certifications complémentaires suivantes en plus de la certification Pix :'
          )
        );
        assert.ok(screen.getByText('Certif complémentaire 1'));
        assert.ok(screen.getByText('Certif complémentaire 2'));
      });

      test('should not display subscription non eligible panel', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        this.set(
          'certificationCandidateSubscription',
          store.createRecord('certification-candidate-subscription', {
            eligibleSubscriptions: [{ label: 'Certif complémentaire 1' }, { label: 'Certif complémentaire 2' }],
            nonEligibleSubscriptions: [],
          })
        );

        // when
        const screen = await render(
          hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`
        );

        // then
        assert.notOk(
          screen.queryByText(
            "Vous avez été inscrit aux certifications complémentaires suivantes : mais vous n'y êtes pas éligible."
          )
        );
      });
    });

    module('when the candidate is not eligible', function () {
      test('should display subscription non eligible panel for 1 complementary certification', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        this.set(
          'certificationCandidateSubscription',
          store.createRecord('certification-candidate-subscription', {
            eligibleSubscriptions: [{ label: 'Certif complémentaire 2' }],
            nonEligibleSubscriptions: [{ label: 'Certif complémentaire 1' }],
          })
        );

        // when
        const screen = await render(
          hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`
        );

        // then
        assert.ok(
          screen.getByText(
            'Vous n’êtes pas éligible à Certif complémentaire 1. Vous pouvez néanmoins passer votre certification Pix et Certif complémentaire 2.'
          )
        );
      });

      test('should display subscription non eligible panel for 2 complementary certifications', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        this.set(
          'certificationCandidateSubscription',
          store.createRecord('certification-candidate-subscription', {
            eligibleSubscriptions: [],
            nonEligibleSubscriptions: [{ label: 'Certif complémentaire 1' }, { label: 'Certif complémentaire 2' }],
          })
        );

        // when
        const screen = await render(
          hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`
        );

        // then
        assert.ok(
          screen.getByText(
            'Vous n’êtes pas éligible à Certif complémentaire 1, Certif complémentaire 2. Vous pouvez néanmoins passer votre certification Pix.'
          )
        );
      });

      test('should display subscription panel', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        this.set(
          'certificationCandidateSubscription',
          store.createRecord('certification-candidate-subscription', {
            eligibleSubscriptions: [],
            nonEligibleSubscriptions: [{ label: 'Certif complémentaire 1' }, { label: 'Certif complémentaire 2' }],
          })
        );

        // when
        const screen = await render(
          hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`
        );

        // then
        assert.ok(
          screen.getByText(
            'Vous êtes inscrit aux certifications complémentaires suivantes en plus de la certification Pix :'
          )
        );
      });
    });
  });

  module('#submit', function () {
    module('when access code is provided', function () {
      module('when the creation of certification course is successful', function () {
        test('should redirect to certifications.resume', async function (assert) {
          // given

          const certificationCourse = {
            id: 456,
            save: sinon.stub(),
            deleteRecord: sinon.stub(),
          };

          const replaceWithStub = sinon.stub();

          class RouterServiceStub extends Service {
            replaceWith = replaceWithStub;
          }

          this.owner.register('service:router', RouterServiceStub);

          const createRecordStub = sinon.stub();

          class StoreServiceStub extends Service {
            createRecord = createRecordStub;
          }

          this.owner.register('service:store', StoreServiceStub);
          createRecordStub.returns(certificationCourse);

          const resetStub = sinon.stub();

          class FocusedCertificationChallengeWarningManagerStub extends Service {
            reset = resetStub;
          }

          this.owner.register(
            'service:focused-certification-challenge-warning-manager',
            FocusedCertificationChallengeWarningManagerStub
          );

          this.set('certificationCandidateSubscription', { sessionId: 123 });
          await render(
            hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`
          );
          await fillIn('#certificationStarterSessionCode', 'ABC123');
          replaceWithStub.returns('ok');

          // when
          await clickByLabel(this.intl.t('pages.certification-start.actions.submit'));

          // then
          sinon.assert.calledWithExactly(createRecordStub, 'certification-course', {
            accessCode: 'ABC123',
            sessionId: 123,
          });
          sinon.assert.calledOnce(certificationCourse.save);
          sinon.assert.calledOnce(resetStub);
          sinon.assert.calledWithExactly(replaceWithStub, 'authenticated.certifications.resume', 456);
          assert.ok(true);
        });
      });

      module('when the creation of certification course is in error', function () {
        test('should display the appropriate error message when error status is 404', async function (assert) {
          // given
          const replaceWithStub = sinon.stub();

          class RouterServiceStub extends Service {
            replaceWith = replaceWithStub;
          }

          this.owner.register('service:router', RouterServiceStub);
          const createRecordStub = sinon.stub();

          class StoreStubService extends Service {
            createRecord = createRecordStub;
          }

          this.owner.register('service:store', StoreStubService);
          const certificationCourse = {
            id: 123,
            save: sinon.stub(),
            deleteRecord: sinon.stub(),
          };
          createRecordStub.returns(certificationCourse);
          this.set('certificationCandidateSubscription', { sessionId: 123 });
          const screen = await render(
            hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`
          );
          await fillIn('#certificationStarterSessionCode', 'ABC123');
          certificationCourse.save.rejects({ errors: [{ status: '404' }] });

          // when
          await clickByLabel(this.intl.t('pages.certification-start.actions.submit'));

          // then
          assert.ok(screen.getByText('Ce code n’existe pas ou n’est plus valide.'));
        });

        test('should display the appropriate error message when error status is 412', async function (assert) {
          // given
          const replaceWithStub = sinon.stub();

          class RouterServiceStub extends Service {
            replaceWith = replaceWithStub;
          }

          this.owner.register('service:router', RouterServiceStub);
          const createRecordStub = sinon.stub();

          class StoreStubService extends Service {
            createRecord = createRecordStub;
          }

          this.owner.register('service:store', StoreStubService);
          const certificationCourse = {
            id: 123,
            save: sinon.stub(),
            deleteRecord: sinon.stub(),
          };
          createRecordStub.returns(certificationCourse);
          this.set('certificationCandidateSubscription', { sessionId: 123 });
          const screen = await render(
            hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`
          );
          await fillIn('#certificationStarterSessionCode', 'ABC123');
          certificationCourse.save.rejects({ errors: [{ status: '412' }] });

          // when
          await clickByLabel(this.intl.t('pages.certification-start.actions.submit'));

          // then
          assert.ok(screen.getByText("La session de certification n'est plus accessible."));
        });

        module('when error status is 403', function () {
          test('should display the appropriate error message when error candidate not authorized to join session', async function (assert) {
            // given
            const replaceWithStub = sinon.stub();

            class RouterServiceStub extends Service {
              replaceWith = replaceWithStub;
            }

            this.owner.register('service:router', RouterServiceStub);
            const createRecordStub = sinon.stub();

            class StoreStubService extends Service {
              createRecord = createRecordStub;
            }

            this.owner.register('service:store', StoreStubService);
            const certificationCourse = {
              id: 123,
              save: sinon.stub(),
              deleteRecord: sinon.stub(),
            };
            createRecordStub.returns(certificationCourse);
            this.set('certificationCandidateSubscription', { sessionId: 123 });
            const screen = await render(
              hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`
            );
            await fillIn('#certificationStarterSessionCode', 'ABC123');
            certificationCourse.save.rejects({
              errors: [{ status: '403', code: 'CANDIDATE_NOT_AUTHORIZED_TO_JOIN_SESSION' }],
            });

            // when
            await clickByLabel(this.intl.t('pages.certification-start.actions.submit'));

            // then
            assert.ok(
              screen.getByText(
                this.intl.t('pages.certification-start.error-messages.candidate-not-authorized-to-start')
              )
            );
          });

          test('should display the appropriate error message when error candidate not authorized to resume session', async function (assert) {
            // given
            const replaceWithStub = sinon.stub();

            class RouterServiceStub extends Service {
              replaceWith = replaceWithStub;
            }

            this.owner.register('service:router', RouterServiceStub);
            const createRecordStub = sinon.stub();

            class StoreStubService extends Service {
              createRecord = createRecordStub;
            }

            this.owner.register('service:store', StoreStubService);
            const certificationCourse = {
              id: 123,
              save: sinon.stub(),
              deleteRecord: sinon.stub(),
            };
            createRecordStub.returns(certificationCourse);
            this.set('certificationCandidateSubscription', { sessionId: 123 });
            const screen = await render(
              hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`
            );
            await fillIn('#certificationStarterSessionCode', 'ABC123');
            certificationCourse.save.rejects({
              errors: [{ status: '403', code: 'CANDIDATE_NOT_AUTHORIZED_TO_RESUME_SESSION' }],
            });

            // when
            await clickByLabel(this.intl.t('pages.certification-start.actions.submit'));

            // then
            assert.ok(
              screen.getByText(
                this.intl.t('pages.certification-start.error-messages.candidate-not-authorized-to-resume')
              )
            );
          });
        });

        test('should display a generic error message when error status unknown', async function (assert) {
          // given
          const replaceWithStub = sinon.stub();

          class RouterServiceStub extends Service {
            replaceWith = replaceWithStub;
          }

          this.owner.register('service:router', RouterServiceStub);
          const createRecordStub = sinon.stub();

          class StoreStubService extends Service {
            createRecord = createRecordStub;
          }

          this.owner.register('service:store', StoreStubService);
          const certificationCourse = {
            id: 123,
            save: sinon.stub(),
            deleteRecord: sinon.stub(),
          };
          createRecordStub.returns(certificationCourse);
          this.set('certificationCandidateSubscription', { sessionId: 123 });
          const screen = await render(
            hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`
          );
          await fillIn('#certificationStarterSessionCode', 'ABC123');
          certificationCourse.save.rejects({ errors: [{ status: 'other' }] });

          // when
          await clickByLabel(this.intl.t('pages.certification-start.actions.submit'));

          // then
          assert.ok(screen.getByText('Une erreur serveur inattendue vient de se produire.'));
        });
      });
    });
  });
});
