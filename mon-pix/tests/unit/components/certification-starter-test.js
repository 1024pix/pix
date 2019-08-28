import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Component | certification-starter', function() {

  setupTest();

  let component;

  beforeEach(function() {
    component = this.owner.lookup('component:certification-starter');
  });

  describe('#submit', function() {
    let storeStub;
    let storeCreateRecordStub;
    let storeSaveStub;
    let course;

    beforeEach(() => {
      storeSaveStub = sinon.stub().resolves({ id: 12 });
      course = {
        save: storeSaveStub,
      };
      storeCreateRecordStub = sinon.stub().returns(course);
      storeStub = {
        createRecord: storeCreateRecordStub,
      };
    });

    it('should create and save a new course', function() {
      // given
      component.set('store', storeStub);
      component.set('_accessCode', 'ABCD12');

      // when
      component.send('submit');

      // then
      sinon.assert.called(storeCreateRecordStub);
      sinon.assert.calledWith(storeCreateRecordStub, 'course', { accessCode: 'ABCD12' });
      sinon.assert.called(storeSaveStub);
    });

    it('should set _loadingCertification at true', function() {
      // given
      component.set('store', storeStub);
      component.set('_accessCode', 'ABCD12');

      // when
      component.send('submit');

      // then
      expect(component.get('_loadingCertification')).to.be.true;
    });

  });
});
