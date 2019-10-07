import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Component | certification-starter', function() {

  setupTest();
  let routerStub;
  let component;

  beforeEach(function() {
    component = this.owner.lookup('component:certification-starter');
  });

  describe('#submit', function() {

    const certificationId = 42;
    let accessCode;
    let course;
    let storeStub;
    let storeCreateRecordStub;
    let storeSaveStub;
    let replaceWithStub;
    beforeEach(() => {
      storeSaveStub = sinon.stub();
      course = {
        save: storeSaveStub,
      };
      storeCreateRecordStub = sinon.stub();
      storeStub = {
        createRecord: storeCreateRecordStub,
      };
      replaceWithStub = sinon.stub();
      routerStub = {
        replaceWith: replaceWithStub,
      };
      component.set('store', storeStub);
      component.set('router', routerStub);
    });

    it('should create and save a new course when access code is given', async function() {
      // given
      accessCode = 'someAccessCode';
      storeCreateRecordStub.returns(course);
      storeSaveStub.resolves({ id: certificationId });

      component.set('store', storeStub);
      component.set('accessCode', accessCode);

      // when
      await component.send('submit');

      // then
      expect(component.isLoading).to.be.true;
      sinon.assert.calledWithExactly(storeCreateRecordStub, 'course', { accessCode });
      sinon.assert.called(storeSaveStub);
      sinon.assert.calledWith(replaceWithStub, 'certifications.resume', certificationId);
    });

  });

  describe('handleErrorStatus', () => {
    let status;
    let transitionToStub;
    let renderStub;
    beforeEach(() => {
      transitionToStub = sinon.stub();
      renderStub = sinon.stub();
      routerStub = {
        transitionTo: transitionToStub,
        render: renderStub,
      };
      component.set('router', routerStub);
    });
    it('should exit the loading state when the code doesnt match any session', function() {
      // given
      status = '404';

      // when
      component.handleErrorStatus(status);

      // then
      expect(component.errorMessage).to.equal('Ce code n’existe pas ou n’est plus valide.');
      expect(component.isLoading).to.be.false;
    });
    it('should render the start error state when the user not unauthorized', function() {
      // given
      status = '403';

      // when
      component.handleErrorStatus(status);

      // then
      sinon.assert.calledWithExactly(component.router.render, 'certifications.start-error');
    });
    it('should transition back to index route for any other errors', function() {
      // given
      status = '500';

      // when
      component.handleErrorStatus(status);

      // then
      sinon.assert.calledWithExactly(component.router.transitionTo, 'index');
    });
  });

});
