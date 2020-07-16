import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Serializer | serializer/schooling-registration-user-association', function() {
  setupTest();

  describe('when student number is not present', function() {

    it('should serialize default user data', function() {
      const store = this.owner.lookup('service:store');
      const record = store.createRecord('schooling-registration-user-association', {
        lastName: 'dupond',
        firstName: 'jean',
        birthdate: '10/10/2010',
        campaignCode: '1234',
        username: 'jd',
      });
    
      const data = {
        type: 'schooling-registration-user-associations',
        attributes: {
          'first-name': 'jean',
          'last-name': 'dupond',
          'birthdate': '10/10/2010',
          'campaign-code': '1234',
          'username': 'jd'
        }
      };

      expect(record.serialize()).to.deep.equal({ data });
    });
  });
    
  describe('when student number is present', function() {
        
    it('should serialize only student number', function() {
      const store = this.owner.lookup('service:store');
      const record = store.createRecord('schooling-registration-user-association', {
        studentNumber: '4321',
        campaignCode: '1234',
      });
    
      const data = {
        type: 'schooling-registration-user-associations',
        attributes: {
          'student-number': '4321',
          'campaign-code': '1234'
        }
      };
    
      expect(record.serialize()).to.deep.equal({ data });
    });
  });
    
});
