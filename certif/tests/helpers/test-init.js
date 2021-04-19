import { authenticateSession as emberAuthenticateSession } from 'ember-simple-auth/test-support';
import QUnit from 'qunit';
import { contains, notContains } from './contains';
import times from 'lodash/times';

QUnit.assert.contains = contains;
QUnit.assert.notContains = notContains;

export function createCertificationPointOfContact(pixCertifTermsOfServiceAccepted = false, certificationCenterType, certificationCenterName = 'Centre de certification du pix', isRelatedOrganizationManagingStudents = false, certificationCenterCount = 1) {
  const certificationCenters = [];

  times(certificationCenterCount, () => {
    const certificationCenter = createCertificationCenter({ certificationCenterName, certificationCenterType, isRelatedOrganizationManagingStudents });
    certificationCenters.push(certificationCenter);
  });

  const certificationPointOfContact = server.create('certification-point-of-contact', {
    firstName: 'Harry',
    lastName: 'Cover',
    email: 'harry@cover.com',
    pixCertifTermsOfServiceAccepted,
    certificationCenters,
    currentCertificationCenterId: 1,
  });
  certificationPointOfContact.save();

  return certificationPointOfContact;
}

export function createCertificationCenter({ certificationCenterName, certificationCenterType, isRelatedOrganizationManagingStudents }) {
  const certificationCenter = server.create('certification-center', {
    id: 1,
    name: certificationCenterName,
    type: certificationCenterType,
    externalId: 'ABC123',
    isRelatedOrganizationManagingStudents,
  });
  certificationCenter.save();
  return certificationCenter;
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

export function createCertificationPointOfContactWithTermsOfServiceAcceptedWithMultipleCertificationCenters(certificationCenterCount) {
  return createCertificationPointOfContact(true, 'SUP', 'Centre de certification SUP du pix', false, certificationCenterCount);
}

export function authenticateSession(userId) {
  return emberAuthenticateSession({
    user_id: userId,
    access_token: 'aaa.' + btoa(`{"user_id":${userId},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
    expires_in: 3600,
    token_type: 'Bearer token type',
  });
}
