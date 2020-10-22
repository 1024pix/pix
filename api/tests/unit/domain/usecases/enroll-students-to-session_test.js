const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');

const enrollStudentsToSession = require('../../../../lib/domain/usecases/enroll-students-to-session');
const CertificationCandidate = require('../../../../lib/domain/models/CertificationCandidate');
const { ForbiddenAccess } = require('../../../../lib/domain/errors');

// ajouter une liste vide (qu'est-ce qu'on veut que ça fasse ? rien, supprimer ?)
// une session qui n'existe pas (erreur utilisateur)
// n étudiants qui n'existent pas parmi m ?? Exception (erreur utilisateur)

describe('Unit | UseCase | enroll-students-to-session', () => {
  context('when referent is allowed to Pix Certif', () => {

    it('enrolls n students to a session', async () => {
      // given
      const { session, certificationCenterMemberships } = _buildMatchingSessionAndCertificationCenterMembership();
      const sessionId = session.id;

      const referentId = Symbol('a referent id');

      const studentIds = [1, 2, 3];
      const { organizationForReferents, schoolingRegistrations } =
        _buildMatchingReferentOrganisationAndSchoolingRegistrations(studentIds);

      const expectedCertificationCandidates = schoolingRegistrations.map((sr) => {
        return new CertificationCandidate({
          firstName: sr.firstName,
          lastName: sr.lastName,
          birthdate: sr.birthdate,
          sessionId: sessionId,
        });
      });

      const certificationCandidateRepository = { setSessionCandidates: sinon.stub() };
      const schoolingRegistrationRepository = { findByIds: sinon.stub() };
      schoolingRegistrationRepository.findByIds.withArgs({ ids: studentIds }).resolves(schoolingRegistrations);
      const membershipRepository = { findByUserId: sinon.stub() };
      membershipRepository.findByUserId.withArgs({ userId: referentId }).resolves(organizationForReferents);
      const sessionRepository = { get: sinon.stub() };
      sessionRepository.get.withArgs(sessionId).resolves(session);
      const certificationCenterMembershipRepository = { findByUserId: sinon.stub() };
      certificationCenterMembershipRepository.findByUserId.withArgs(referentId).resolves(certificationCenterMemberships);

      // when
      await enrollStudentsToSession({
        sessionId,
        studentIds,
        referentId,
        certificationCandidateRepository,
        certificationCenterMembershipRepository,
        membershipRepository,
        schoolingRegistrationRepository,
        sessionRepository,
      });

      // then
      expect(certificationCandidateRepository.setSessionCandidates).to.have.been.calledWithExactly(sessionId, expectedCertificationCandidates);
    });

    it('rejects enrollment if students do not belong to same organization as referent', async () => {
      // given
      const { session, certificationCenterMemberships } = _buildMatchingSessionAndCertificationCenterMembership();

      const referentId = Symbol('an unauthorized referent id');

      const studentIds = [1, 2, 3];
      const { organizationForReferents, schoolingRegistrations } =
        _buildNonMatchingReferentOrganisationAndSchoolingRegistrations(studentIds);

      const schoolingRegistrationRepository = { findByIds: sinon.stub() };
      schoolingRegistrationRepository.findByIds.withArgs({ ids: studentIds }).resolves(schoolingRegistrations);
      const membershipRepository = { findByUserId: sinon.stub() };
      membershipRepository.findByUserId.withArgs({ userId: referentId }).resolves(organizationForReferents);
      const sessionRepository = { get: sinon.stub() };
      sessionRepository.get.withArgs(session.id).resolves(session);
      const certificationCenterMembershipRepository = { findByUserId: sinon.stub() };
      certificationCenterMembershipRepository.findByUserId.withArgs(referentId).resolves(certificationCenterMemberships);

      // when
      const error = await catchErr(enrollStudentsToSession)({
        sessionId: session.id,
        studentIds,
        referentId,
        schoolingRegistrationRepository,
        membershipRepository,
        sessionRepository,
        certificationCenterMembershipRepository,
      });

      // then
      expect(error).to.be.instanceof(ForbiddenAccess);
    });

    it('rejects enrollment if session does not belong to same certification center as referent', async () => {
      // given
      const { session, certificationCenterMemberships } = _buildNonMatchingSessionAndCertificationCenterMembership();
      const referentId = Symbol('a referent id');
      const studentIds = [1, 2, 3];

      const certificationCenterMembershipRepository = { findByUserId: sinon.stub() };
      certificationCenterMembershipRepository.findByUserId.withArgs(referentId).resolves(certificationCenterMemberships);
      const sessionRepository = { get: sinon.stub() };
      sessionRepository.get.withArgs(session.id).resolves(session);

      // when
      const error = await catchErr(enrollStudentsToSession)({
        sessionId: session.id,
        studentIds,
        referentId,
        certificationCenterMembershipRepository,
        membershipRepository: undefined,
        schoolingRegistrationRepository: undefined,
        sessionRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(ForbiddenAccess);
    });
  });
});

function _buildMatchingSessionAndCertificationCenterMembership() {
  const certificationCenter = domainBuilder.buildCertificationCenter();
  const session = domainBuilder.buildSession({
    certificationCenterId: certificationCenter.id,
  });

  const certificationCenterMembership = domainBuilder.buildCertificationCenterMembership({
    certificationCenter,
  });

  return { session, certificationCenterMemberships: [certificationCenterMembership] };
}

function _buildNonMatchingSessionAndCertificationCenterMembership() {
  const certificationCenterForSession = domainBuilder.buildCertificationCenter({ id: 1234 });
  const session = domainBuilder.buildSession({
    certificationCenterId: certificationCenterForSession.id,
  });

  const certificationCenterForReferent = domainBuilder.buildCertificationCenter({ id: 5678 });
  const certificationCenterMembership = domainBuilder.buildCertificationCenterMembership({
    certficicationCenter: certificationCenterForReferent,
  });

  return { session, certificationCenterMemberships: [certificationCenterMembership] };
}

function _buildMatchingReferentOrganisationAndSchoolingRegistrations(studentIds) {
  const organizationForReferent = domainBuilder.buildOrganization();
  const schoolingRegistrations = studentIds.map((id) => {
    return domainBuilder.buildSchoolingRegistration({ id, organization: organizationForReferent });
  });

  return { organizationForReferents: [{ organization: organizationForReferent }], schoolingRegistrations };
}

function _buildNonMatchingReferentOrganisationAndSchoolingRegistrations(studentIds) {
  const organizationForStudents = domainBuilder.buildOrganization();
  const schoolingRegistrations = studentIds.map((id) => {
    return domainBuilder.buildSchoolingRegistration({ id, organization: organizationForStudents });
  });

  const organizationForReferent = domainBuilder.buildOrganization();
  return { organizationForReferents: [{ organization: organizationForReferent }], schoolingRegistrations };
}
