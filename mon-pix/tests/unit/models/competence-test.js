import { run } from '@ember/runloop';
import { get } from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | competence model', function() {
  setupModelTest('competence', {
    needs: ['model:area']
  });

  it('exists', function() {
    const model = this.subject();
    expect(model).to.be.ok;
  });

  describe('#area relationship', () => {

    it('should exist', function() {
      // given
      const Competence = this.store().modelFor('competence');

      // when
      const relationship = get(Competence, 'relationshipsByName').get('area');

      // then
      expect(relationship.key).to.equal('area');
      expect(relationship.kind).to.equal('belongsTo');
    });
  });

  describe('#areaName computed property', () => {

    it('should be an alias for "area" relationship on "name" property', function() {
      run(() => {
        // given
        const store = this.store();
        const area = store.createRecord('area', { name: 'coucou' });
        const competence = this.subject({ area });

        // when
        const areaName = competence.get('areaName');

        // then
        expect(areaName).to.equal('coucou');
      });
    });
  });

  describe('#isAssessed', function() {

    it('should return true if status is "assessed"', function() {
      // given
      const competence = this.subject({ status: 'assessed' });

      // when/then
      expect(competence.get('isAssessed')).to.be.true;
    });

    it('should return false if status is not "assessed"', function() {
      // given
      const competence = this.subject({ status: 'tralala' });

      // when/then
      expect(competence.get('isAssessed')).to.be.false;
    });

  });

  describe('#isNotAssessed', function() {

    it('should return true if status is "notAssessed"', function() {
      // given
      const competence = this.subject({ status: 'notAssessed' });

      // when/then
      expect(competence.get('isNotAssessed')).to.be.true;
    });

    it('should return false if status is not "notAssessed"', function() {
      // given
      const competence = this.subject({ status: 'tralala' });

      // when/then
      expect(competence.get('isNotAssessed')).to.be.false;
    });

  });

  describe('#isBeingAssessed', function() {

    it('should return true if status is "assessmentNotCompleted"', function() {
      // given
      const competence = this.subject({ status: 'assessmentNotCompleted' });

      // when/then
      expect(competence.get('isBeingAssessed')).to.be.true;
    });

    it('should return false if status is not "assessmentNotCompleted"', function() {
      // given
      const competence = this.subject({ status: 'tralala' });

      // when/then
      expect(competence.get('isBeingAssessed')).to.be.false;
    });

  });

  describe('#isAssessableForTheFirstTime', function() {

    it('should be true if there is a courseId status is "notAssessed"', function() {
      // given
      const competence = this.subject({ courseId: 'recDhfez76uygze', status: 'notAssessed' });

      // when/then
      expect(competence.get('isAssessableForTheFirstTime')).to.be.true;
    });

    it('should be false if there is a courseId status is not "notAssessed"', function() {
      // given
      const competence = this.subject({ courseId: 'recDhfez76uygze', status: 'assessed' });

      // when/then
      expect(competence.get('isAssessableForTheFirstTime')).to.be.false;
    });

    it('should be false if status is "notAssessed" but there is no courseId', function() {
      // given
      const competence = this.subject({ status: 'notAssessed' });

      // when/then
      expect(competence.get('isAssessableForTheFirstTime')).to.be.false;
    });

  });

});
