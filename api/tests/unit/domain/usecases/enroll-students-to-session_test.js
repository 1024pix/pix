const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');

const enrollStudentsToSession = require('../../../../lib/domain/usecases/enroll-students-to-session');
const SCOCertificationCandidate = require('../../../../lib/domain/models/SCOCertificationCandidate');
const { ForbiddenAccess, UnknownCountryForStudentEnrollmentError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | enroll-students-to-session', function () {
  context('when referent is allowed to Pix Certif', function () {
    it('enrolls n students to a session', async function () {
      // given
      const { session, certificationCenterMemberships } = _buildMatchingSessionAndCertificationCenterMembership();
      const sessionId = session.id;
      const anotherSessionId = sessionId + 1;

      const referentId = Symbol('a referent id');

      const studentIds = [1, 2, 3];
      const { organizationForReferent, schoolingRegistrations } =
        _buildMatchingReferentOrganisationAndSchoolingRegistrations(studentIds);

      const country = domainBuilder.buildCountry({
        code: '99100',
        name: 'FRANCE',
      });

      const expectedCertificationCandidates = schoolingRegistrations.map((sr) => {
        return new SCOCertificationCandidate({
          firstName: sr.firstName,
          lastName: sr.lastName,
          birthdate: sr.birthdate,
          birthINSEECode: sr.birthCityCode,
          birthCountry: 'FRANCE',
          birthCity: sr.birthCity,
          sex: sr.sex,
          sessionId: sessionId,
          schoolingRegistrationId: sr.id,
        });
      });

      const scoCertificationCandidateRepository = new InMemorySCOCertificationCandidateRepository();
      const schoolingRegistrationRepository = { findByIds: sinon.stub() };
      const countryRepository = { findAll: sinon.stub() };
      countryRepository.findAll.resolves([country]);
      schoolingRegistrationRepository.findByIds.withArgs({ ids: studentIds }).resolves(schoolingRegistrations);
      const sessionRepository = { get: sinon.stub() };
      sessionRepository.get.withArgs(sessionId).resolves(session);
      const certificationCenterMembershipRepository = { findByUserId: sinon.stub() };
      certificationCenterMembershipRepository.findByUserId
        .withArgs(referentId)
        .resolves(certificationCenterMemberships);
      const organizationRepository = { getIdByCertificationCenterId: sinon.stub() };
      organizationRepository.getIdByCertificationCenterId
        .withArgs(session.certificationCenterId)
        .resolves(organizationForReferent.id);

      // when
      await enrollStudentsToSession({
        sessionId,
        studentIds,
        referentId,
        scoCertificationCandidateRepository,
        certificationCenterMembershipRepository,
        schoolingRegistrationRepository,
        sessionRepository,
        countryRepository,
        organizationRepository,
      });

      // then
      expect(scoCertificationCandidateRepository.findBySessionId(sessionId)).to.deep.equal(
        expectedCertificationCandidates
      );
      expect(scoCertificationCandidateRepository.findBySessionId(anotherSessionId)).to.deep.equal(undefined);
    });

    it('enrolls a student by trimming his first name and last name', async function () {
      // given
      const { session, certificationCenterMemberships } = _buildMatchingSessionAndCertificationCenterMembership();
      const sessionId = session.id;

      const referentId = Symbol('a referent id');

      const organizationForReferent = domainBuilder.buildOrganization();
      const country = domainBuilder.buildCountry({
        code: '99100',
        name: 'FRANCE',
      });

      const schoolingRegistration = domainBuilder.buildSchoolingRegistration({
        id: 1,
        firstName: 'Sarah Michelle ',
        lastName: ' Gellar',
        birthdate: '2020-01-01',
        sex: 'F',
        birthCityCode: '48512',
        organization: organizationForReferent,
      });

      const expectedCertificationCandidate = new SCOCertificationCandidate({
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: schoolingRegistration.birthdate,
        sex: schoolingRegistration.sex,
        birthINSEECode: schoolingRegistration.birthCityCode,
        birthCountry: country.name,
        birthCity: schoolingRegistration.birthCity,
        sessionId: sessionId,
        schoolingRegistrationId: 1,
      });

      const scoCertificationCandidateRepository = new InMemorySCOCertificationCandidateRepository();
      const schoolingRegistrationRepository = { findByIds: sinon.stub() };
      const countryRepository = { findAll: sinon.stub() };
      countryRepository.findAll.resolves([country]);
      schoolingRegistrationRepository.findByIds.withArgs({ ids: [1] }).resolves([schoolingRegistration]);
      const sessionRepository = { get: sinon.stub() };
      sessionRepository.get.withArgs(sessionId).resolves(session);
      const certificationCenterMembershipRepository = { findByUserId: sinon.stub() };
      certificationCenterMembershipRepository.findByUserId
        .withArgs(referentId)
        .resolves(certificationCenterMemberships);
      const organizationRepository = { getIdByCertificationCenterId: sinon.stub() };
      organizationRepository.getIdByCertificationCenterId
        .withArgs(session.certificationCenterId)
        .resolves(organizationForReferent.id);

      // when
      await enrollStudentsToSession({
        sessionId,
        studentIds: [1],
        referentId,
        scoCertificationCandidateRepository,
        certificationCenterMembershipRepository,
        schoolingRegistrationRepository,
        sessionRepository,
        countryRepository,
        organizationRepository,
      });

      // then
      expect(scoCertificationCandidateRepository.findBySessionId(sessionId)).to.deep.equal([
        expectedCertificationCandidate,
      ]);
    });

    it('rejects enrollment if students do not belong to same organization as referent', async function () {
      // given
      const { session, certificationCenterMemberships } = _buildMatchingSessionAndCertificationCenterMembership();

      const referentId = Symbol('an unauthorized referent id');

      const studentIds = [1, 2, 3];
      const { organizationForReferent, schoolingRegistrations } =
        _buildNonMatchingReferentOrganisationAndSchoolingRegistrations(studentIds);

      const schoolingRegistrationRepository = { findByIds: sinon.stub() };
      schoolingRegistrationRepository.findByIds.withArgs({ ids: studentIds }).resolves(schoolingRegistrations);
      const sessionRepository = { get: sinon.stub() };
      sessionRepository.get.withArgs(session.id).resolves(session);
      const certificationCenterMembershipRepository = { findByUserId: sinon.stub() };
      certificationCenterMembershipRepository.findByUserId
        .withArgs(referentId)
        .resolves(certificationCenterMemberships);
      const organizationRepository = { getIdByCertificationCenterId: sinon.stub() };
      organizationRepository.getIdByCertificationCenterId
        .withArgs(session.certificationCenterId)
        .resolves(organizationForReferent.id);

      // when
      const error = await catchErr(enrollStudentsToSession)({
        sessionId: session.id,
        studentIds,
        referentId,
        schoolingRegistrationRepository,
        organizationRepository,
        sessionRepository,
        certificationCenterMembershipRepository,
      });

      // then
      expect(error).to.be.instanceof(ForbiddenAccess);
    });

    it('rejects enrollment if session does not belong to same certification center as referent', async function () {
      // given
      const { session, certificationCenterMemberships } = _buildNonMatchingSessionAndCertificationCenterMembership();
      const referentId = Symbol('a referent id');
      const studentIds = [1, 2, 3];

      const certificationCenterMembershipRepository = { findByUserId: sinon.stub() };
      certificationCenterMembershipRepository.findByUserId
        .withArgs(referentId)
        .resolves(certificationCenterMemberships);
      const sessionRepository = { get: sinon.stub() };
      sessionRepository.get.withArgs(session.id).resolves(session);

      // when
      const error = await catchErr(enrollStudentsToSession)({
        sessionId: session.id,
        studentIds,
        referentId,
        certificationCenterMembershipRepository,
        organizationRepository: undefined,
        schoolingRegistrationRepository: undefined,
        sessionRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(ForbiddenAccess);
    });

    it('rejects enrollment if a student birth country is not found', async function () {
      // given
      const { session, certificationCenterMemberships } = _buildMatchingSessionAndCertificationCenterMembership();
      const sessionId = session.id;
      const referentId = Symbol('a referent id');

      const studentIds = [1, 2, 3];
      const { organizationForReferent, schoolingRegistrations } =
        _buildMatchingReferentOrganisationAndSchoolingRegistrations(studentIds);

      const country = domainBuilder.buildCountry({
        code: '99A07',
        name: 'COUBA',
      });

      const scoCertificationCandidateRepository = new InMemorySCOCertificationCandidateRepository();
      const schoolingRegistrationRepository = { findByIds: sinon.stub() };
      schoolingRegistrationRepository.findByIds.withArgs({ ids: studentIds }).resolves(schoolingRegistrations);
      const countryRepository = { findAll: sinon.stub() };
      countryRepository.findAll.resolves([country]);
      const sessionRepository = { get: sinon.stub() };
      sessionRepository.get.withArgs(sessionId).resolves(session);
      const certificationCenterMembershipRepository = { findByUserId: sinon.stub() };
      certificationCenterMembershipRepository.findByUserId
        .withArgs(referentId)
        .resolves(certificationCenterMemberships);
      const organizationRepository = { getIdByCertificationCenterId: sinon.stub() };
      organizationRepository.getIdByCertificationCenterId
        .withArgs(session.certificationCenterId)
        .resolves(organizationForReferent.id);

      // when
      const error = await catchErr(enrollStudentsToSession)({
        sessionId,
        studentIds,
        referentId,
        scoCertificationCandidateRepository,
        certificationCenterMembershipRepository,
        schoolingRegistrationRepository,
        sessionRepository,
        countryRepository,
        organizationRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(UnknownCountryForStudentEnrollmentError);
      expect(error.message).to.contains(`${schoolingRegistrations[0].firstName} ${schoolingRegistrations[0].lastName}`);
    });

    it('does nothing if no student ids is given as input', async function () {
      // given
      const { session, certificationCenterMemberships } = _buildMatchingSessionAndCertificationCenterMembership();
      const sessionId = session.id;
      const studentIds = [];
      const referentId = Symbol('a referent id');
      const { organizationForReferent, schoolingRegistrations } =
        _buildMatchingReferentOrganisationAndSchoolingRegistrations(studentIds);
      const country = domainBuilder.buildCountry({
        code: '99100',
        name: 'FRANCE',
      });

      const scoCertificationCandidateRepository = new InMemorySCOCertificationCandidateRepository();
      const schoolingRegistrationRepository = { findByIds: sinon.stub() };
      const countryRepository = { findAll: sinon.stub() };
      countryRepository.findAll.resolves([country]);
      schoolingRegistrationRepository.findByIds.withArgs({ ids: studentIds }).resolves(schoolingRegistrations);
      const sessionRepository = { get: sinon.stub() };
      sessionRepository.get.withArgs(sessionId).resolves(session);
      const certificationCenterMembershipRepository = { findByUserId: sinon.stub() };
      certificationCenterMembershipRepository.findByUserId
        .withArgs(referentId)
        .resolves(certificationCenterMemberships);
      const organizationRepository = { getIdByCertificationCenterId: sinon.stub() };
      organizationRepository.getIdByCertificationCenterId
        .withArgs(session.certificationCenterId)
        .resolves(organizationForReferent.id);

      // when
      await enrollStudentsToSession({
        sessionId,
        studentIds,
        referentId,
        scoCertificationCandidateRepository,
        certificationCenterMembershipRepository,
        organizationRepository,
        schoolingRegistrationRepository,
        countryRepository,
        sessionRepository,
      });

      // then
      expect(scoCertificationCandidateRepository.findBySessionId(sessionId)).to.deep.equal([]);
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
    return domainBuilder.buildSchoolingRegistration({
      id,
      organization: organizationForReferent,
    });
  });

  return { organizationForReferent, schoolingRegistrations };
}

function _buildNonMatchingReferentOrganisationAndSchoolingRegistrations(studentIds) {
  const organizationForStudents = domainBuilder.buildOrganization({ id: 123 });
  const schoolingRegistrations = studentIds.map((id) => {
    return domainBuilder.buildSchoolingRegistration({ id, organization: organizationForStudents });
  });

  const organizationForReferent = domainBuilder.buildOrganization({ id: 456 });
  return { organizationForReferent, schoolingRegistrations };
}

class InMemorySCOCertificationCandidateRepository {
  constructor() {
    this.addedCandidates = {};
  }

  addNonEnrolledCandidatesToSession({ sessionId, scoCertificationCandidates }) {
    this.addedCandidates[sessionId] = scoCertificationCandidates;
  }

  findBySessionId(sessionId) {
    return this.addedCandidates[sessionId];
  }
}
