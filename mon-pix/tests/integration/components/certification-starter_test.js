import { expect } from 'chai';
import Service from '@ember/service';
import { describe, it } from 'mocha';
import { render, fillIn } from '@ember/test-helpers';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { contains } from '../../helpers/contains';
import { clickByLabel } from '../../helpers/click-by-label';

describe('Integration | Component | certification-starter', function () {
  setupIntlRenderingTest();

  describe('when the candidate has no complementary certification subscriptions', function () {
    it('should not display subscriptions panel', async function () {
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
      await render(
        hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`
      );

      // expect
      expect(
        contains(
          'Vous êtes inscrit aux certification(s) complémentaire(s) suivante(s) en plus de la certification Pix :'
        )
      ).to.not.exist;
      expect(
        contains(
          "Vous avez été inscrit à/aux certification(s) complémentaire(s) suivantes : mais vous n'y êtes pas éligible.\n"
        )
      ).to.not.exist;
    });
  });

  describe('when the candidate has complementary certification subscriptions', function () {
    describe('when the candidate is eligible', function () {
      it('should display subscription eligible panel', async function () {
        // given
        const store = this.owner.lookup('service:store');
        this.set(
          'certificationCandidateSubscription',
          store.createRecord('certification-candidate-subscription', {
            eligibleSubscriptions: [{ name: 'Certif complémentaire 1' }, { name: 'Certif complémentaire 2' }],
            nonEligibleSubscriptions: [],
          })
        );

        // when
        await render(
          hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`
        );

        // then
        expect(
          contains('Vous êtes inscrit aux certifications complémentaires suivantes en plus de la certification Pix :'),
          'Vous êtes inscrit...'
        ).to.exist;
        expect(contains('Certif complémentaire 1'), 'Certif complémentaire 1').to.exist;
        expect(contains('Certif complémentaire 2'), 'Certif complémentaire 2').to.exist;
      });

      it('should not display subscription non eligible panel', async function () {
        // given
        const store = this.owner.lookup('service:store');
        this.set(
          'certificationCandidateSubscription',
          store.createRecord('certification-candidate-subscription', {
            eligibleSubscriptions: [{ name: 'Certif complémentaire 1' }, { name: 'Certif complémentaire 2' }],
            nonEligibleSubscriptions: [],
          })
        );

        // when
        await render(
          hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`
        );

        // expect
        expect(
          contains(
            "Vous avez été inscrit aux certifications complémentaires suivantes : mais vous n'y êtes pas éligible."
          )
        ).to.not.exist;
      });
    });

    describe('when the candidate is not eligible', function () {
      it('should display subscription non eligible panel for 1 complementary certification', async function () {
        // given
        const store = this.owner.lookup('service:store');
        this.set(
          'certificationCandidateSubscription',
          store.createRecord('certification-candidate-subscription', {
            eligibleSubscriptions: [{ name: 'Certif complémentaire 2' }],
            nonEligibleSubscriptions: [{ name: 'Certif complémentaire 1' }],
          })
        );

        // when
        await render(
          hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`
        );

        // expect
        expect(
          contains(
            'Vous n’êtes pas éligible à Certif complémentaire 1. Vous pouvez néanmoins passer votre certification Pix et Certif complémentaire 2'
          )
        ).to.exist;
      });

      it('should display subscription non eligible panel for 2 complementary certifications', async function () {
        // given
        const store = this.owner.lookup('service:store');
        this.set(
          'certificationCandidateSubscription',
          store.createRecord('certification-candidate-subscription', {
            eligibleSubscriptions: [],
            nonEligibleSubscriptions: [{ name: 'Certif complémentaire 1' }, { name: 'Certif complémentaire 2' }],
          })
        );

        // when
        await render(
          hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`
        );

        // expect
        expect(
          contains(
            'Vous n’êtes pas éligible à Certif complémentaire 1, Certif complémentaire 2. Vous pouvez néanmoins passer votre certification Pix'
          )
        ).to.exist;
      });

      it('should display subscription panel', async function () {
        // given
        const store = this.owner.lookup('service:store');
        this.set(
          'certificationCandidateSubscription',
          store.createRecord('certification-candidate-subscription', {
            eligibleSubscriptions: [],
            nonEligibleSubscriptions: [{ name: 'Certif complémentaire 1' }, { name: 'Certif complémentaire 2' }],
          })
        );

        // when
        await render(
          hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`
        );

        // expect
        expect(
          contains('Vous êtes inscrit aux certifications complémentaires suivantes en plus de la certification Pix :')
        ).to.exist;
      });
    });
  });

  describe('#submit', function () {
    context('when no access code is provided', function () {
      it('should display an appropriated error message', async function () {
        // given
        this.set('certificationCandidateSubscription', { sessionId: 123 });
        await render(
          hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`
        );

        // when
        await clickByLabel(this.intl.t('pages.certification-start.actions.submit'));

        // then
        expect(contains('Merci de saisir un code d’accès valide.'));
      });
    });

    context('when access code is provided', function () {
      context('when the creation of certification course is successful', function () {
        it('should redirect to certifications.resume', async function () {
          // given
          const replaceWithStub = sinon.stub();
          class RouterStubService extends Service {
            replaceWith = replaceWithStub;
          }
          this.owner.register('service:router', RouterStubService);
          const createRecordStub = sinon.stub();
          class StoreStubService extends Service {
            createRecord = createRecordStub;
          }

          const clearStub = sinon.stub();
          class FocusedCertificationChallengeManagerStubService extends Service {
            clear = clearStub;
          }

          this.owner.register('service:store', StoreStubService);
          this.owner.register(
            'service:focused-certification-challenges-manager',
            FocusedCertificationChallengeManagerStubService
          );
          const certificationCourse = {
            id: 456,
            save: sinon.stub(),
            deleteRecord: sinon.stub(),
          };
          createRecordStub.returns(certificationCourse);
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
          sinon.assert.calledOnce(clearStub);
          sinon.assert.calledWithExactly(replaceWithStub, 'certifications.resume', 456);
        });
      });

      context('when the creation of certification course is in error', function () {
        it('should display the appropriate error message when error status is 404', async function () {
          // given
          const replaceWithStub = sinon.stub();
          class RouterStubService extends Service {
            replaceWith = replaceWithStub;
          }
          this.owner.register('service:router', RouterStubService);
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
          await render(
            hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`
          );
          await fillIn('#certificationStarterSessionCode', 'ABC123');
          certificationCourse.save.rejects({ errors: [{ status: '404' }] });

          // when
          await clickByLabel(this.intl.t('pages.certification-start.actions.submit'));

          // then
          expect(contains('Ce code n’existe pas ou n’est plus valide.'));
        });

        it('should display the appropriate error message when error status is 412', async function () {
          // given
          const replaceWithStub = sinon.stub();
          class RouterStubService extends Service {
            replaceWith = replaceWithStub;
          }
          this.owner.register('service:router', RouterStubService);
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
          await render(
            hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`
          );
          await fillIn('#certificationStarterSessionCode', 'ABC123');
          certificationCourse.save.rejects({ errors: [{ status: '412' }] });

          // when
          await clickByLabel(this.intl.t('pages.certification-start.actions.submit'));

          // then
          expect(contains("La session de certification n'est plus accessible."));
        });

        it('should display the appropriate error message when error status is 403', async function () {
          // given
          const replaceWithStub = sinon.stub();
          class RouterStubService extends Service {
            replaceWith = replaceWithStub;
          }
          this.owner.register('service:router', RouterStubService);
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
          await render(
            hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`
          );
          await fillIn('#certificationStarterSessionCode', 'ABC123');
          certificationCourse.save.rejects({
            errors: [{ status: '403', detail: "Message d'erreur envoyé par l 'API" }],
          });

          // when
          await clickByLabel(this.intl.t('pages.certification-start.actions.submit'));

          // then
          expect(contains("'Message d'erreur envoyé par l'API'"));
        });

        it('should display a generic error message when error status unknown', async function () {
          // given
          const replaceWithStub = sinon.stub();
          class RouterStubService extends Service {
            replaceWith = replaceWithStub;
          }
          this.owner.register('service:router', RouterStubService);
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
          await render(
            hbs`<CertificationStarter @certificationCandidateSubscription={{this.certificationCandidateSubscription}}/>`
          );
          await fillIn('#certificationStarterSessionCode', 'ABC123');
          certificationCourse.save.rejects({ errors: [{ status: 'other' }] });

          // when
          await clickByLabel(this.intl.t('pages.certification-start.actions.submit'));

          // then
          expect(contains('Une erreur serveur inattendue vient de se produire.'));
        });
      });
    });
  });
});
