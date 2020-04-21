import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Component | certification-starter', function() {

  setupTest();
  let component;

  beforeEach(function() {
    component = this.owner.lookup('component:certification-starter');
  });

  describe('#submit', function() {

    context('when no access code is provided', function() {
      it('should display an appropriated error message', async function() {
        // given
        component.set('accessCode', '');

        // when
        await component.send('submit');

        // then
        expect(component.get('errorMessage')).to.equal('Merci de saisir un code d’accès valide.');
      });
    });

    context('when access code is provided', function() {

      let accessCode;
      let sessionId;
      let certificationId;
      let peekerFindOneStub;
      let peekerStub;
      let replaceWithStub;
      let routerStub;

      beforeEach(() => {
        accessCode = 'accessCode';
        sessionId = 111;
        peekerFindOneStub = sinon.stub();
        peekerStub = {
          findOne: peekerFindOneStub,
        };
        replaceWithStub = sinon.stub().resolves();
        routerStub = {
          replaceWith: replaceWithStub,
        };
        component.set('accessCode', accessCode);
        component.set('stepsData', { joiner: { sessionId } });
        component.set('router', routerStub);
        component.set('peeker', peekerStub);
      });

      context('when user\'s certification course is already saved in ember storage', function() {

        it('should redirect to certifications.resume', async function() {
          // given
          certificationId = 'existing course id';
          peekerFindOneStub.returns({ id: certificationId });

          // when
          await component.send('submit');

          // then
          sinon.assert.calledWith(replaceWithStub, 'authenticated.certifications.resume', certificationId);
        });
      });

      context('when user\'s certification course is not saved in ember storage', function() {

        let storeCreateRecordStub;
        let storeSaveStub;
        let storeStub;
        let peekerCourse;
        let course;

        beforeEach(() => {
          storeCreateRecordStub = sinon.stub();
          storeStub = {
            createRecord: storeCreateRecordStub,
          };
          storeSaveStub = sinon.stub();
          course = {
            save: storeSaveStub,
          };
          certificationId = 'new course id';
          peekerCourse = { id: certificationId };
          peekerFindOneStub.onCall(0).returns(null);
          peekerFindOneStub.onCall(1).returns(peekerCourse);
          storeCreateRecordStub.returns(course);
          component.set('store', storeStub);
        });

        context('when the creation of certification course is successful', function() {

          it('should redirect to certifications.resume', async function() {
            // given
            storeSaveStub.resolves();

            // when
            await component.send('submit');

            // then
            sinon.assert.calledWithExactly(storeCreateRecordStub, 'certification-course', { accessCode, sessionId });
            await sinon.assert.called(storeSaveStub);
            sinon.assert.calledWith(replaceWithStub, 'authenticated.certifications.resume', certificationId);
          });
        });

        context('when the creation of certification course failed', function() {

          let courseDeleteRecordStub;
          let err;

          beforeEach(() => {
            courseDeleteRecordStub = sinon.stub();
            peekerCourse.deleteRecord = courseDeleteRecordStub;
            courseDeleteRecordStub.returns();
          });

          context('when the error is known', function() {

            beforeEach(() => {
              err = { errors: [{ status: '404' }] };
            });

            it('should display a specific error', async function() {
              // given
              storeSaveStub.rejects(err);

              // when
              await component.send('submit');

              // then
              sinon.assert.calledWithExactly(storeCreateRecordStub, 'certification-course', { accessCode, sessionId });
              await sinon.assert.called(courseDeleteRecordStub);
              expect(component.get('errorMessage')).to.equal('Ce code n’existe pas ou n’est plus valide.');
            });
          });

          context('when the error is unknown', function() {

            beforeEach(() => {
              err = {};
            });

            it('should display a general error', async function() {
              // given
              storeSaveStub.rejects(err);

              // when
              await component.send('submit');

              // then
              sinon.assert.calledWithExactly(storeCreateRecordStub, 'certification-course', { accessCode, sessionId });
              await sinon.assert.called(courseDeleteRecordStub);
              expect(component.get('errorMessage')).to.equal('Une erreur serveur inattendue vient de se produire');
            });
          });
        });
      });
    });
  });
});
