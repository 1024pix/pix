import { expect } from 'chai';
import Service from '@ember/service';
import { describe, it } from 'mocha';
import { render, fillIn, click } from '@ember/test-helpers';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { contains } from '../../helpers/contains';

describe('Integration | Component | certification-starter', function() {
  setupIntlRenderingTest();

  describe('#submit', function() {

    context('when no access code is provided', function() {

      it('should display an appropriated error message', async function() {
        // given
        this.set('sessionId', '123');
        await render(hbs`<CertificationStarter @sessionId={{this.sessionId}}/>`);

        // when
        await click('[type="submit"]');

        // then
        expect(contains('Merci de saisir un code d’accès valide.'));
      });
    });

    context('when access code is provided', function() {

      context('when the creation of certification course is successful', function() {

        it('should redirect to certifications.resume', async function() {
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
            id: 456,
            save: sinon.stub(),
            deleteRecord: sinon.stub(),
          };
          createRecordStub.returns(certificationCourse);
          this.set('sessionId', '123');
          await render(hbs`<CertificationStarter @sessionId={{this.sessionId}}/>`);
          await fillIn('#certificationStarterSessionCode', 'ABC123');
          replaceWithStub.returns('ok');

          // when
          await click('[type="submit"]');

          // then
          sinon.assert.calledWithExactly(createRecordStub, 'certification-course', { accessCode: 'ABC123', sessionId: '123' });
          sinon.assert.calledOnce(certificationCourse.save);
          sinon.assert.calledWithExactly(replaceWithStub, 'certifications.resume', 456);
        });
      });

      context('when the creation of certification course is in error', function() {

        it('should display the appropriate error message when error status is 404', async function() {
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
          this.set('sessionId', '123');
          await render(hbs`<CertificationStarter @sessionId={{this.sessionId}}/>`);
          await fillIn('#certificationStarterSessionCode', 'ABC123');
          certificationCourse.save.rejects({ errors: [ { status: '404' }] });

          // when
          await click('[type="submit"]');

          // then
          expect(contains('Ce code n’existe pas ou n’est plus valide.'));
        });

        it('should display the appropriate error message when error status is 412', async function() {
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
          this.set('sessionId', '123');
          await render(hbs`<CertificationStarter @sessionId={{this.sessionId}}/>`);
          await fillIn('#certificationStarterSessionCode', 'ABC123');
          certificationCourse.save.rejects({ errors: [ { status: '412' }] });

          // when
          await click('[type="submit"]');

          // then
          expect(contains('La session de certification n\'est plus accessible.'));
        });

        it('should display a generic error message when error status unknown', async function() {
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
          this.set('sessionId', '123');
          await render(hbs`<CertificationStarter @sessionId={{this.sessionId}}/>`);
          await fillIn('#certificationStarterSessionCode', 'ABC123');
          certificationCourse.save.rejects({ errors: [ { status: 'other' }] });

          // when
          await click('[type="submit"]');

          // then
          expect(contains('Une erreur serveur inattendue vient de se produire.'));
        });
      });
    });
  });
});
