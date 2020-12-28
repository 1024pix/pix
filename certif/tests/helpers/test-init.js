import { authenticateSession as emberAuthenticateSession } from 'ember-simple-auth/test-support';
import QUnit from 'qunit';
import { contains, notContains } from './contains';

QUnit.assert.contains = contains;
QUnit.assert.notContains = notContains;

export function createCertificationPointOfContact(pixCertifTermsOfServiceAccepted = false, certificationCenterType, certificationCenterName = 'Centre de certification du pix', isRelatedOrganizationManagingStudents = false) {
  const certificationPointOfContact = server.create('certification-point-of-contact', {
    firstName: 'Harry',
    lastName: 'Cover',
    email: 'harry@cover.com',
    pixCertifTermsOfServiceAccepted,
    certificationCenterId: 1,
    certificationCenterName,
    certificationCenterType,
    certificationCenterExternalId: 'ABC123',
    isRelatedOrganizationManagingStudents,
  });
  certificationPointOfContact.save();

  return certificationPointOfContact;
}

export function createScoIsManagingStudentsCertificationPointOfContactWithTermsOfServiceAccepted() {
  return createCertificationPointOfContactWithTermsOfServiceAccepted('SCO', 'Centre de certification SCO du pix', true);
}

export function createCertificationPointOfContactWithTermsOfServiceAccepted(certificationCenterType = undefined, certificationCenterName = 'Centre de certification du pix', isRelatedOrganizationManagingStudents = false) {
  return createCertificationPointOfContact(true, certificationCenterType, certificationCenterName, isRelatedOrganizationManagingStudents);
}

export function createCertificationPointOfContactWithTermsOfServiceNotAccepted() {
  return createCertificationPointOfContact(false);
}

export function authenticateSession(userId) {
  return emberAuthenticateSession({
    user_id: userId,
    access_token: 'aaa.' + btoa(`{"user_id":${userId},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
    expires_in: 3600,
    token_type: 'Bearer token type',
  });
}
