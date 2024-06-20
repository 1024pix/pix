import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { clickByLabel } from '../../helpers/click-by-label';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | certification-starter', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the candidate has no complementary certification subscription', function () {
    test('should not display subscriptions panel', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      this.set(
        'certificationCandidateSubscription',
        store.createRecord('certification-candidate-subscription', {
          eligibleSubscription: null,
          nonEligibleSubscription: null,
        }),
      );
      this.set('certificationCandidateSubscription', { eligibleSubscription: null, nonEligibleSubscription: null });

      // when
      const screen = await render(
        hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`,
      );

      // then
      assert.notOk(
        screen.queryByText(
          "'Vous êtes inscrit à la certification complémentaire suivante en plus de la certification Pix :",
        ),
      );
      assert.notOk(screen.queryByText('Vous n’êtes pas éligible à'));
    });
  });

  module('when the candidate has complementary certification subscription', function () {
    module('when the candidate is eligible', function () {
      test('should display subscription eligible panel', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        this.set(
          'certificationCandidateSubscription',
          store.createRecord('certification-candidate-subscription', {
            eligibleSubscription: { label: 'Certif complémentaire 1' },
            nonEligibleSubscription: null,
          }),
        );

        // when
        const screen = await render(
          hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`,
        );

        // then
        assert.ok(
          screen.getByText(
            'Vous êtes inscrit à la certification complémentaire suivante en plus de la certification Pix :',
          ),
        );
        assert.ok(screen.getByText('Certif complémentaire 1'));
      });

      test('should not display subscription non eligible panel', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        this.set(
          'certificationCandidateSubscription',
          store.createRecord('certification-candidate-subscription', {
            eligibleSubscription: { label: 'Certif complémentaire 1' },
            nonEligibleSubscription: null,
          }),
        );

        // when
        const screen = await render(
          hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`,
        );

        // then
        assert.notOk(screen.queryByText('Vous n’êtes pas éligible à'));
      });
    });

    module('when the candidate is not eligible', function () {
      test('should display subscription non eligible panel', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        this.set(
          'certificationCandidateSubscription',
          store.createRecord('certification-candidate-subscription', {
            eligibleSubscription: null,
            nonEligibleSubscription: { label: 'Certif complémentaire 1' },
          }),
        );

        // when
        const screen = await render(
          hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`,
        );

        // then
        assert.ok(
          screen.getByText(
            "Vous n'êtes pas éligible à Certif complémentaire 1. Vous pouvez néanmoins passer votre certification Pix.",
          ),
        );
      });

      test('should not display subscription eligible panel', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        this.set(
          'certificationCandidateSubscription',
          store.createRecord('certification-candidate-subscription', {
            eligibleSubscription: null,
            nonEligibleSubscription: { label: 'Certif complémentaire 1' },
          }),
        );

        // when
        const screen = await render(
          hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`,
        );

        // then
        assert.notOk(
          screen.queryByText(
            'Vous êtes inscrit aux certifications complémentaires suivantes en plus de la certification Pix :',
          ),
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
            FocusedCertificationChallengeWarningManagerStub,
          );
          const postMessageStub = sinon.stub();
          class WindowPostMessageServiceStub extends Service {
            startCertification = postMessageStub;
          }
          this.owner.register('service:window-post-message', WindowPostMessageServiceStub);

          const routerObserver = this.owner.lookup('service:router');
          routerObserver.replaceWith = sinon.stub();

          this.set('certificationCandidateSubscription', { sessionId: 123 });
          await render(
            hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`,
          );
          await fillIn('#certificationStarterSessionCode', 'ABC123');
          routerObserver.replaceWith.returns('ok');

          // when
          await clickByLabel(this.intl.t('pages.certification-start.actions.submit'));

          // then
          sinon.assert.calledWithExactly(createRecordStub, 'certification-course', {
            accessCode: 'ABC123',
            sessionId: 123,
          });

          sinon.assert.calledOnce(certificationCourse.save);
          sinon.assert.calledOnce(resetStub);
          sinon.assert.calledOnce(postMessageStub);
          sinon.assert.calledWithExactly(routerObserver.replaceWith, 'authenticated.certifications.resume', 456);

          assert.ok(true);
        });
      });

      module('when the creation of certification course is in error', function () {
        test('should not send a postMessage', async function (assert) {
          // given
          const replaceWithStub = sinon.stub();
          const postMessageStub = sinon.stub();
          class WindowPostMessageServiceStub extends Service {
            startCertification = postMessageStub;
          }
          this.owner.register('service:window-post-message', WindowPostMessageServiceStub);

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
          this.set('postMessageStub', postMessageStub);
          const screen = await render(
            hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}} @postMessage={{this.postMessageStub}}/>`,
          );
          await fillIn('#certificationStarterSessionCode', 'ABC123');
          certificationCourse.save.rejects({ errors: [{ status: '404' }] });

          // when
          await clickByLabel(this.intl.t('pages.certification-start.actions.submit'));

          // then
          assert.ok(screen.getByText('Ce code n’existe pas ou n’est plus valide.'));
          sinon.assert.notCalled(postMessageStub);
        });

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
            hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`,
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
            hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`,
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
              hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`,
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
                this.intl.t('pages.certification-start.error-messages.candidate-not-authorized-to-start'),
              ),
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
              hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`,
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
                this.intl.t('pages.certification-start.error-messages.candidate-not-authorized-to-resume'),
              ),
            );
          });
        });

        module('when error status unknown', function () {
          test('should display a generic error message', async function (assert) {
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
              hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`,
            );
            await fillIn('#certificationStarterSessionCode', 'ABC123');
            certificationCourse.save.throws(new Error("Détails de l'erreur à envoyer à Pix"));

            // when
            await clickByLabel(this.intl.t('pages.certification-start.actions.submit'));

            // then
            assert.ok(screen.getByText('Une erreur serveur inattendue vient de se produire.'));
            await click(screen.getByText('Afficher plus de détails :'));
            const group = screen.getByRole('group');

            assert.ok(group.textContent.includes("Détails de l'erreur à envoyer à Pix"));
          });
        });
      });
    });
  });
});
