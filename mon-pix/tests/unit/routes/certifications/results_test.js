import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import EmberObject from '@ember/object';
import Service from '@ember/service';

describe('Unit | Route | Certifications | Results', function () {
  setupTest();

  describe('model', function () {
    it('should retrieve certification course', async function () {
      // given
      const reloadStub = sinon.stub().resolves();
      const assessment = EmberObject.create({ reload: reloadStub });
      const certificationCourse = EmberObject.create({
        id: 1,
        assessment,
      });
      const findRecordStub = sinon.stub().resolves(certificationCourse);
      const storeStub = Service.create({ findRecord: findRecordStub });
      const route = this.owner.lookup('route:certifications.results');
      route.set('store', storeStub);

      // when
      const model = await route.model({ certification_id: 1 });

      // then
      expect(model).to.equal(certificationCourse);
      sinon.assert.calledWith(findRecordStub, 'certification-course', 1);
      sinon.assert.called(reloadStub);
    });
  });
});
