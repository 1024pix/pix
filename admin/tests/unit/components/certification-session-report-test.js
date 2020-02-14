import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Components | certification-session-report', function(hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function() {
    component = this.owner.lookup('component:certification-session-report');
  });

  module('#outOfSessionCertifications', function() {
    test('should return an empty array when there is no certifications out of current session', function(assert) {
      // given
      const certifications = [
        { id: 123, isInSession: true },
        { id: 456, isInSession: true },
        { id: 789, isInSession: true },
      ];
      component.set('certifications', certifications);

      // when
      const outOfSessionCertifications = component.outOfSessionCertifications;

      // then
      const expectedResult = [];
      assert.deepEqual(outOfSessionCertifications, expectedResult);
    });

    test('should return an array with certifications when some are out of session', function(assert) {
      // given
      const certifications = [
        { id: 123, isInSession: true },
        { id: 456, isInSession: false },
        { id: 789, isInSession: false },
      ];
      component.set('certifications', certifications);

      // when
      const outOfSessionCertifications = component.outOfSessionCertifications;

      // then
      const expectedResult = [
        { id: 456, isInSession: false },
        { id: 789, isInSession: false }];
      assert.deepEqual(outOfSessionCertifications, expectedResult);
    });
  });

  module('#incompleteCertifications', function() {
    test('should return an empty array when there is no incomplete certifications', function(assert) {
      // given
      const completeCertifications = [
        { firstName: 'Bruce', lastName: 'Wayne', birthdate: '1972-02-19', birthplace: 'Gotham City', id: 123 },
        { firstName: 'James', lastName: 'Howlett', birthdate: '1832', birthplace: 'Northwest Territories of Canada', id: 456 },
        { firstName: 'Natalia', lastName: 'Romanova', birthdate: '1984', birthplace: 'Stalingrad', id: 789 },
        { firstName: 'Clark', lastName: 'Kent', birthdate: '1984-05-20', birthplace: 'Smallville', id: 101112 },
      ];
      component.set('certifications', completeCertifications);

      // when
      const incompleteCertifications = component.incompleteCertifications;

      // then
      const expectedResult = [];
      assert.deepEqual(incompleteCertifications, expectedResult);
    });

    test('should return an array with appropriate certifications when first name is missing in some', function(assert) {
      // given
      const completeCertifications = [
        { firstName: 'Bruce', lastName: 'Wayne', birthdate: '1972-02-19', birthplace: 'Gotham City', id: 123 },
        { firstName: null, lastName: 'Howlett', birthdate: '1832', birthplace: 'Northwest Territories of Canada', id: 456 },
        { firstName: 'Natalia', lastName: 'Romanova', birthdate: '1984', birthplace: 'Stalingrad', id: 789 },
        { firstName: 'Clark', lastName: 'Kent', birthdate: '1984-05-20', birthplace: 'Smallville', id: 101112 },
      ];
      component.set('certifications', completeCertifications);

      // when
      const incompleteCertifications = component.incompleteCertifications;

      // then
      const expectedResult = [
        { firstName: null, lastName: 'Howlett', birthdate: '1832', birthplace: 'Northwest Territories of Canada', id: 456 }
      ];
      assert.deepEqual(incompleteCertifications, expectedResult);
    });

    test('should return an array with appropriate certifications when last name is missing in some', function(assert) {
      // given
      const completeCertifications = [
        { firstName: 'Bruce', lastName: 'Wayne', birthdate: '1972-02-19', birthplace: 'Gotham City', id: 123 },
        { firstName: 'James', lastName: null, birthdate: '1832', birthplace: 'Northwest Territories of Canada', id: 456 },
        { firstName: 'Natalia', lastName: 'Romanova', birthdate: '1984', birthplace: 'Stalingrad', id: 789 },
        { firstName: 'Clark', lastName: 'Kent', birthdate: '1984-05-20', birthplace: 'Smallville', id: 101112 },
      ];
      component.set('certifications', completeCertifications);

      // when
      const incompleteCertifications = component.incompleteCertifications;

      // then
      const expectedResult = [
        { firstName: 'James', lastName: null, birthdate: '1832', birthplace: 'Northwest Territories of Canada', id: 456 }
      ];
      assert.deepEqual(incompleteCertifications, expectedResult);
    });

    test('should return an array with appropriate certifications when birthdate is missing in some', function(assert) {
      // given
      const completeCertifications = [
        { firstName: 'Bruce', lastName: 'Wayne', birthdate: '1972-02-19', birthplace: 'Gotham City', id: 123 },
        { firstName: 'James', lastName: 'Howlett', birthdate: null, birthplace: 'Northwest Territories of Canada', id: 456 },
        { firstName: 'Natalia', lastName: 'Romanova', birthdate: '1984', birthplace: 'Stalingrad', id: 789 },
        { firstName: 'Clark', lastName: 'Kent', birthdate: '1984-05-20', birthplace: 'Smallville', id: 101112 },
      ];
      component.set('certifications', completeCertifications);

      // when
      const incompleteCertifications = component.incompleteCertifications;

      // then
      const expectedResult = [
        { firstName: 'James', lastName: 'Howlett', birthdate: null, birthplace: 'Northwest Territories of Canada', id: 456 }
      ];
      assert.deepEqual(incompleteCertifications, expectedResult);
    });

    test('should return an array with appropriate certifications when birthplace is missing in some', function(assert) {
      // given
      const completeCertifications = [
        { firstName: 'Bruce', lastName: 'Wayne', birthdate: '1972-02-19', birthplace: 'Gotham City', id: 123 },
        { firstName: 'James', lastName: 'Howlett', birthdate: '1832', birthplace: null, id: 456 },
        { firstName: 'Natalia', lastName: 'Romanova', birthdate: '1984', birthplace: 'Stalingrad', id: 789 },
        { firstName: 'Clark', lastName: 'Kent', birthdate: '1984-05-20', birthplace: 'Smallville', id: 101112 },
      ];
      component.set('certifications', completeCertifications);

      // when
      const incompleteCertifications = component.incompleteCertifications;

      // then
      const expectedResult = [
        { firstName: 'James', lastName: 'Howlett', birthdate: '1832', birthplace: null, id: 456 }
      ];
      assert.deepEqual(incompleteCertifications, expectedResult);
    });

    test('should return an array with appropriate certifications when id is missing in some', function(assert) {
      // given
      const completeCertifications = [
        { firstName: 'Bruce', lastName: 'Wayne', birthdate: '1972-02-19', birthplace: 'Gotham City', id: 123 },
        { firstName: 'James', lastName: 'Howlett', birthdate: '1832', birthplace: 'Northwest Territories of Canada', id: null },
        { firstName: 'Natalia', lastName: 'Romanova', birthdate: '1984', birthplace: 'Stalingrad', id: 789 },
        { firstName: 'Clark', lastName: 'Kent', birthdate: '1984-05-20', birthplace: 'Smallville', id: 101112 },
      ];
      component.set('certifications', completeCertifications);

      // when
      const incompleteCertifications = component.incompleteCertifications;

      // then
      const expectedResult = [
        { firstName: 'James', lastName: 'Howlett', birthdate: '1832', birthplace: 'Northwest Territories of Canada', id: null }
      ];
      assert.deepEqual(incompleteCertifications, expectedResult);
    });
  });

  module('#duplicateCertificationIds', function() {
    test('should return an empty array when there is no duplicates in certifications list', function(assert) {
      // given
      const certifications = [
        { id: 123 },
        { id: 456 },
        { id: 789 },
      ];
      component.set('certifications', certifications);

      // when
      const duplicateCertificationIds = component.duplicateCertificationIds;

      // then
      const expectedResult = [];
      assert.deepEqual(duplicateCertificationIds, expectedResult);
    });

    test('should return an array with certifications IDs when there are duplicates in certifications list', function(assert) {
      // given
      const certifications = [
        { id: 123 },
        { id: 456 },
        { id: 123 },
        { id: 456 },
        { id: 789 },
      ];
      component.set('certifications', certifications);

      // when
      const duplicateCertificationIds = component.duplicateCertificationIds;

      // then
      const expectedResult = ['123', '456'];
      assert.deepEqual(duplicateCertificationIds, expectedResult);
    });
  });

  module('#noLastScreenSeenCertifications', function() {
    test('should return an empty array when all certifications stated seeing last screen by examiner', function(assert) {
      // given
      const certifications = [
        { id: 123, hasSeenEndTestScreen: true },
        { id: 456, hasSeenEndTestScreen: true },
        { id: 789, hasSeenEndTestScreen: true },
      ];
      component.set('certifications', certifications);

      // when
      const noLastScreenSeenCertifications = component.noLastScreenSeenCertifications;

      // then
      const expectedResult = [];
      assert.deepEqual(noLastScreenSeenCertifications, expectedResult);
    });

    test('should return an array of certifications when some have not stated that examiner saw last screen', function(assert) {
      // given
      const certifications = [
        { id: 123, hasSeenEndTestScreen: true },
        { id: 456, hasSeenEndTestScreen: false },
        { id: 789, hasSeenEndTestScreen: false },
      ];
      component.set('certifications', certifications);

      // when
      const noLastScreenSeenCertifications = component.noLastScreenSeenCertifications;

      // then
      const expectedResult = [
        { id: 456, hasSeenEndTestScreen: false },
        { id: 789, hasSeenEndTestScreen: false }];
      assert.deepEqual(noLastScreenSeenCertifications, expectedResult);
    });
  });

  module('#commentedByExaminerCertifications', function() {
    test('should return an empty array when there are no certifications with examiner comment', function(assert) {
      // given
      const certifications = [
        { id: 123, examinerComment: '' },
        { id: 456, examinerComment: '' },
        { id: 789, examinerComment: '' },
      ];
      component.set('certifications', certifications);

      // when
      const commentedByExaminerCertifications = component.commentedByExaminerCertifications;

      // then
      const expectedResult = [];
      assert.deepEqual(commentedByExaminerCertifications, expectedResult);
    });

    test('should return an array of certifications when some have examiner comment', function(assert) {
      // given
      const certifications = [
        { id: 123, examinerComment: '' },
        { id: 456, examinerComment: 'examComment' },
        { id: 789, examinerComment: 'other ExamComment' },
      ];
      component.set('certifications', certifications);

      // when
      const commentedByExaminerCertifications = component.commentedByExaminerCertifications;

      // then
      const expectedResult = [
        { id: 456, examinerComment: 'examComment' },
        { id: 789, examinerComment: 'other ExamComment' },];
      assert.deepEqual(commentedByExaminerCertifications, expectedResult);
    });
  });

});
