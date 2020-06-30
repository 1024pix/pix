import EmberObject from '@ember/object';
import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | Assessments', function() {
  setupTest();

  let route;

  beforeEach(function() {
    route = this.owner.lookup('route:assessments');
  });

  describe('#afterModel', function() {
    it('should return the title when the assessment is not a certification ', function() {
      // given
      const assessment = EmberObject.create({ id: 1, title: 'Programmer', isCertification: false });

      // when
      const model = route.afterModel(assessment);

      // then
      expect(model.title).to.equal('Programmer');
    });

    it('should update the title when the assessment is a certification ', function() {
      // given
      const assessment = EmberObject.create({ id: 1, title: 1223, isCertification: true });

      // when
      const model = route.afterModel(assessment);

      // then
      expect(model.title).to.equal('Certification 1223');
    });

  });
});
