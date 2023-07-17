import { authenticateSession as emberAuthenticateSession } from 'ember-simple-auth/test-support';
import QUnit from 'qunit';
import { contains, notContains } from './contains';
import times from 'lodash/times';

QUnit.assert.contains = contains;
QUnit.assert.notContains = notContains;

export function createCertificationPointOfContact(
  pixCertifTermsOfServiceAccepted = false,
  certificationCenterType,
  certificationCenterName = 'Centre de certification du pix',
  isRelatedOrganizationManagingStudents = false,
  certificationCenterCount = 1,
) {
  const allowedCertificationCenterAccesses = _createCertificationCenters(certificationCenterCount, {
    certificationCenterName,
    certificationCenterType,
    isRelatedOrganizationManagingStudents,
  });
  return createCertificationPointOfContactWithCustomCenters({
    pixCertifTermsOfServiceAccepted,
    allowedCertificationCenterAccesses,
  });
}

export function createCertificationPointOfContactWithCustomCenters({
  pixCertifTermsOfServiceAccepted = false,
  allowedCertificationCenterAccesses = [],
}) {
  return server.create('certification-point-of-contact', {
    firstName: 'Harry',
    lastName: 'Cover',
    email: 'harry@cover.com',
    lang: 'fr',
    pixCertifTermsOfServiceAccepted,
    allowedCertificationCenterAccesses,
  });
}

function _createCertificationCenters(certificationCenterCount, certificationCenterTemplate) {
  const certificationCenters = [];
  times(certificationCenterCount, () => {
    const certificationCenter = createAllowedCertificationCenterAccess(certificationCenterTemplate);
    certificationCenters.push(certificationCenter);
  });
  return certificationCenters;
}

export function createAllowedCertificationCenterAccess({
  certificationCenterName,
  certificationCenterType,
  isRelatedOrganizationManagingStudents,
}) {
  return server.create('allowed-certification-center-access', {
    name: certificationCenterName,
    type: certificationCenterType,
    externalId: 'ABC123',
    isRelatedToManagingStudentsOrganization: isRelatedOrganizationManagingStudents,
    isAccessBlockedCollege: false,
    isAccessBlockedLycee: false,
    isAccessBlockedAEFE: false,
    isAccessBlockedAgri: false,
  });
}

export function createScoIsManagingStudentsCertificationPointOfContactWithTermsOfServiceAccepted() {
  return createCertificationPointOfContactWithTermsOfServiceAccepted('SCO', 'Centre de certification SCO du pix', true);
}

export function createCertificationPointOfContactWithTermsOfServiceAccepted(
  certificationCenterType = undefined,
  certificationCenterName = 'Centre de certification du pix',
  isRelatedOrganizationManagingStudents = false,
) {
  return createCertificationPointOfContact(
    true,
    certificationCenterType,
    certificationCenterName,
    isRelatedOrganizationManagingStudents,
  );
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
