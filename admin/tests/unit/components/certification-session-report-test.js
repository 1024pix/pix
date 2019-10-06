import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Components | certification-session-report', function(hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function() {
    component = this.owner.lookup('component:certification-session-report');
  });

  module('#duplicates', function() {
    test('should return an empty array when there is no duplicates in candidate list', function(assert) {
      // given
      const candidates = [
        { row: 1, certificationId: '123' },
        { row: 2, certificationId: '456' },
        { row: 3, certificationId: '789' },
      ];
      component.set('candidates', candidates);

      // when
      const duplicates = component.duplicates;

      // then
      const expectedResult = [];
      assert.deepEqual(duplicates, expectedResult);
    });

    test('should return an array with certifications IDs when there is one duplicate in candidate list', function(assert) {
      // given
      const candidates = [
        { row: 1, certificationId: '123' },
        { row: 2, certificationId: '123' },
        { row: 3, certificationId: '789' },
      ];
      component.set('candidates', candidates);

      // when
      const duplicates = component.duplicates;

      // then
      const expectedResult = ['123'];
      assert.deepEqual(duplicates, expectedResult);
    });

    test('should return an array with certifications IDs when there are duplicates in candidate list', function(assert) {
      // given
      const candidates = [
        { row: 1, certificationId: '123' },
        { row: 2, certificationId: '123' },
        { row: 1, certificationId: '456' },
        { row: 2, certificationId: '456' },
        { row: 3, certificationId: '789' },
      ];
      component.set('candidates', candidates);

      // when
      const duplicates = component.duplicates;

      // then
      const expectedResult = ['123', '456'];
      assert.deepEqual(duplicates, expectedResult);
    });
  });

  module('#incomplete', function() {
    test('should return an empty array when there is no empty candidate', function(assert) {
      // given
      const completeCandidates = [
        { row: 1, firstName: 'Bruce', lastName: 'Wayne', birthdate: '1972-02-19', birthplace: 'Gotham City', certificationId: '123' },
        { row: 2, firstName: 'James', lastName: 'Howlett', birthdate: '1832', birthplace: 'Northwest Territories of Canada', certificationId: '456' },
        { row: 3, firstName: 'Natalia', lastName: 'Romanova', birthdate: '1984', birthplace: 'Stalingrad', certificationId: '789' },
        { row: 4, firstName: 'Clark', lastName: 'Kent', birthdate: '1984-05-20', birthplace: 'Smallville', certificationId: '101112' },
      ];
      component.set('candidates', completeCandidates);

      // when
      const incomplete = component.incomplete;

      // then
      const expectedResult = [];
      assert.deepEqual(incomplete, expectedResult);
    });

    test('should return an array with candidate that miss first name', function(assert) {
      // given
      const candidatesMissingFirstName = [
        { row: 1, lastName: 'Wayne', birthdate: '1972-02-19', birthplace: 'Gotham City', certificationId: '123' },
        { row: 2, firstName: null, lastName: 'Wayne', birthdate: '1972-02-19', birthplace: 'Gotham City', certificationId: '123' },
        { row: 3, firstName: '', lastName: 'Howlett', birthdate: '1832', birthplace: 'Northwest Territories of Canada', certificationId: '456' },
        { row: 4, firstName: '   ', lastName: 'Romanova', birthdate: '1984', birthplace: 'Stalingrad', certificationId: '789' },
      ];
      component.set('candidates', candidatesMissingFirstName);

      // when
      const incomplete = component.incomplete;

      // then
      assert.deepEqual(incomplete, candidatesMissingFirstName);
    });

    test('should return an array with candidate that miss last name', function(assert) {
      // given
      const candidatesMissingLastName = [
        { row: 1, firstName: 'Bruce', birthdate: '19/02/1972', birthplace: 'Gotham City', certificationId: '123' },
        { row: 2, firstName: 'James', lastName: null, birthdate: '1832', birthplace: 'Northwest Territories of Canada', certificationId: '456' },
        { row: 3, firstName: 'Natalia', lastName: '', birthdate: '1984', birthplace: 'Stalingrad', certificationId: '789' },
        { row: 4, firstName: 'Clark', lastName: '    ', birthdate: '1984-05-20', birthplace: 'Smallville', certificationId: '101112' },
      ];
      component.set('candidates', candidatesMissingLastName);

      // when
      const incomplete = component.incomplete;

      // then
      assert.deepEqual(incomplete, candidatesMissingLastName);
    });

    test('should return an array with candidate that miss birth date', function(assert) {
      // given
      const candidatesMissingBirthDate = [
        { row: 1, firstName: 'Bruce', lastName: 'Wayne', birthplace: 'Gotham City', certificationId: '123' },
        { row: 2, firstName: 'James', lastName: 'Howlett', birthdate: null, birthplace: 'Northwest Territories of Canada', certificationId: '456' },
        { row: 3, firstName: 'Natalia', lastName: 'Romanova', birthdate: '', birthplace: 'Stalingrad', certificationId: '789' },
        { row: 4, firstName: 'Clark', lastName: 'Kent', birthdate: '    ', birthplace: 'Smallville', certificationId: '101112' },
      ];
      component.set('candidates', candidatesMissingBirthDate);

      // when
      const incomplete = component.incomplete;

      // then
      assert.deepEqual(incomplete, candidatesMissingBirthDate);
    });

    test('should return an array with candidate that miss birth place', function(assert) {
      // given
      const candidatesMissingBirthPlace = [
        { row: 1, firstName: 'Bruce', lastName: 'Wayne', birthdate: '1972-02-19', certificationId: '123' },
        { row: 2, firstName: 'James', lastName: 'Howlett', birthdate: '1832', birthplace: null, certificationId: '456' },
        { row: 3, firstName: 'Natalia', lastName: 'Romanova', birthdate: '1984', birthplace: '', certificationId: '789' },
        { row: 4, firstName: 'Clark', lastName: 'Kent', birthdate: '1984-05-20', birthplace: '    ', certificationId: '101112' },
      ];
      component.set('candidates', candidatesMissingBirthPlace);

      // when
      const incomplete = component.incomplete;

      // then
      assert.deepEqual(incomplete, candidatesMissingBirthPlace);
    });

    test('should return an array with candidate that miss certification ID', function(assert) {
      // given
      const candidatesMissingBirthPlace = [
        { row: 1, firstName: 'Bruce', lastName: 'Wayne', birthdate: '1972-02-19', birthplace: 'Gotham City' },
        { row: 2, firstName: 'James', lastName: 'Howlett', birthdate: '1832', birthplace: 'Northwest Territories of Canada', certificationId: null },
        { row: 3, firstName: 'Natalia', lastName: 'Romanova', birthdate: '1984', birthplace: 'Stalingrad', certificationId: '789' },
        { row: 4, firstName: 'Clark', lastName: 'Kent', birthdate: '1984-05-20', birthplace: 'Smallville', certificationId: '  101112  ' },
      ];
      component.set('candidates', candidatesMissingBirthPlace);

      // when
      const incomplete = component.incomplete;

      // then
      const expected = [
        { row: 1, firstName: 'Bruce', lastName: 'Wayne', birthdate: '1972-02-19', birthplace: 'Gotham City' },
        { row: 2, firstName: 'James', lastName: 'Howlett', birthdate: '1832', birthplace: 'Northwest Territories of Canada', certificationId: null },
      ];
      assert.deepEqual(incomplete, expected);
    });
  });

  module('#withoutCandidate', function() {
    test('should return an empty array when every certification has an associated candidate', function(assert) {
      // given
      const candidates = [
        { row: 1, certificationId: '123' },
        { row: 2, certificationId: '456' },
        { row: 3, certificationId: '789' },
      ];
      component.set('candidates', candidates);

      const certifications = [
        { id: '123' },
        { id: '456' },
        { id: '789' },
      ];
      component.set('certifications', certifications);

      // when
      const certificationsWithoutCandidate = component.withoutCandidate;

      // then
      const expectedResult = [];
      assert.deepEqual(certificationsWithoutCandidate, expectedResult);
    });

    test('should return an array with certifications missing associated candidate', function(assert) {
      // given
      const candidates = [
        { row: 1, certificationId: '123' },
        { row: 2, certificationId: '456' },
        { row: 3, certificationId: '789' },
      ];
      component.set('candidates', candidates);

      const certifications = [
        { id: '123' },
        { id: '100000' },
        { id: '200000' },
      ];
      component.set('certifications', certifications);

      // when
      const certificationsWithoutCandidate = component.withoutCandidate;

      // then
      const expectedResult = [
        { id: '100000' },
        { id: '200000' }
      ];
      assert.deepEqual(certificationsWithoutCandidate, expectedResult);
    });
  });

  module('#notFromSession', function() {
    test('should return an empty array when every candidates certification IDs match an existing certification', function(assert) {
      // given
      const candidates = [
        { firstName: 'Toto', certificationId: '123' },
        { firstName: 'Jean', certificationId: '456' },
        { firstName: 'Michel', certificationId: '789' },
      ];
      component.set('candidates', candidates);

      const certifications = [
        { id: '123' },
        { id: '456' },
        { id: '789' },
      ];
      component.set('certifications', certifications);

      // when
      const notFromSession = component.notFromSession;

      // then
      const expectedResult = [];
      assert.deepEqual(notFromSession, expectedResult);
    });

    test('should return an array with candidates missing associated certification', function(assert) {
      // given
      const candidateWithCertification =
        { firstName: 'Candidate with certification', certificationId: '123' };
      component.set('candidates', candidateWithCertification);

      const candidatesWithoutCertification = [
        { firstName: 'Candidate without certification 1', certificationId: '456' },
        { firstName: 'Candidate without certification 2', certificationId: '789' },
      ];
      component.set('candidates', candidatesWithoutCertification);

      const certifications = [
        { id: '123' },
        { id: '100000' },
        { id: '200000' },
      ];
      component.set('certifications', certifications);

      // when
      const notFromSession = component.notFromSession;

      // then
      assert.deepEqual(notFromSession, candidatesWithoutCertification);
    });
  });

  module('#sessionCandidates', function() {
    test('should return an empty array when no candidates certification IDs match an existing certification', function(assert) {
      // given
      const candidates = [
        { firstName: 'Toto', certificationId: '123' },
        { firstName: 'Jean', certificationId: '456' },
        { firstName: 'Michel', certificationId: '789' },
      ];
      component.set('candidates', candidates);

      const certifications = [
        { id: '321' },
        { id: '654' },
        { id: '987' },
      ];
      component.set('certifications', certifications);

      // when
      const sessionCandidates = component.sessionCandidates;

      // then
      const expectedResult = [];
      assert.deepEqual(sessionCandidates, expectedResult);
    });

    test('should return an array with candidates corresponding to session certifications', function(assert) {
      // given
      const candidates = [
        { firstName: 'Toto', certificationId: '123' },
        { firstName: 'Jean', certificationId: '456' },
        { firstName: 'Michel', certificationId: '0' },
      ];
      component.set('candidates', candidates);

      const certifications = [
        { id: '123' },
        { id: '456' },
        { id: '789' },
      ];
      component.set('certifications', certifications);

      // when
      const sessionCandidates = component.sessionCandidates;

      // then
      const expectedResult = [
        { firstName: 'Toto', certificationId: '123' },
        { firstName: 'Jean', certificationId: '456' },
      ];
      assert.deepEqual(sessionCandidates, expectedResult);
    });
  });

  module('#missingEndScreen', function() {
    test('should return an empty array when all candidates saw the end screen', function(assert) {
      // given
      const candidates = [
        { row: 1, certificationId: '123', lastScreen: 'X' },
        { row: 2, certificationId: '456', lastScreen: 'X' },
        { row: 3, certificationId: '789', lastScreen: 'X' },
      ];
      component.set('candidates', candidates);

      // when
      const missingEndScreen = component.missingEndScreen;

      // then
      const expectedResult = [];
      assert.deepEqual(missingEndScreen, expectedResult);
    });

    test('should return an array with candidates having not seen the end screen', function(assert) {
      // given
      const candidates = [
        { row: 1, certificationId: '123', },
        { row: 2, certificationId: '456', lastScreen: null },
        { row: 3, certificationId: '789', lastScreen: '   ' },
      ];
      component.set('candidates', candidates);

      // when
      const missingEndScreen = component.missingEndScreen;

      // then
      const expectedResult = [
        { row: 1, certificationId: '123', },
        { row: 2, certificationId: '456', lastScreen: null },
        { row: 3, certificationId: '789', lastScreen: '   ' },
      ];
      assert.deepEqual(missingEndScreen, expectedResult);
    });
  });

  module('#comments', function() {
    test('should return an empty array when no candidates have comment', function(assert) {
      // given
      const candidates = [
        { row: 1, certificationId: '123' },
        { row: 2, certificationId: '456', comments: null },
        { row: 3, certificationId: '789', comments: '      ' },
      ];
      component.set('candidates', candidates);

      // when
      const comments = component.comments;

      // then
      const expectedResult = [];
      assert.deepEqual(comments, expectedResult);
    });

    test('should return an array with candidates having comments', function(assert) {
      // given
      const candidates = [
        { row: 1, certificationId: '123', comments: '' },
        { row: 2, certificationId: '456', comments: '     ' },
        { row: 3, certificationId: '456', comments: 'null' },
        { row: 4, certificationId: '789', comments: 'My comment' },
      ];
      component.set('candidates', candidates);

      // when
      const comments = component.comments;

      // then
      const expectedResult = [
        { row: 3, certificationId: '456', comments: 'null' },
        { row: 4, certificationId: '789', comments: 'My comment' },
      ];
      assert.deepEqual(comments, expectedResult);
    });
  });

});
