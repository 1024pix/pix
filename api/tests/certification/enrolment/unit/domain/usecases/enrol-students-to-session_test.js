import { UnknownCountryForStudentEnrolmentError } from '../../../../../../src/certification/enrolment/domain/errors.js';
import { SCOCertificationCandidate } from '../../../../../../src/certification/enrolment/domain/models/SCOCertificationCandidate.js';
import { enrolStudentsToSession } from '../../../../../../src/certification/enrolment/domain/usecases/enrol-students-to-session.js';
import { ForbiddenAccess } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | UseCase | enrol-students-to-session', function () {
  context('when referent is allowed to Pix Certif', function () {
    it('enrols n students to a session', async function () {
      // given
      const session = domainBuilder.certification.enrolment.buildSession();
      const sessionId = session.id;
      const anotherSessionId = sessionId + 1;

      const studentIds = [1, 2, 3];
      const { organizationForReferent, organizationLearners } =
        _buildMatchingReferentOrganisationAndOrganizationLearners(studentIds);

      const country = domainBuilder.buildCountry({
        code: '99100',
        name: 'FRANCE',
      });

      const expectedCertificationCandidates = organizationLearners.map((sr) => {
        return new SCOCertificationCandidate({
          firstName: sr.firstName,
          lastName: sr.lastName,
          birthdate: sr.birthdate,
          birthINSEECode: sr.birthCityCode,
          birthCountry: 'FRANCE',
          birthCity: sr.birthCity,
          sex: sr.sex,
          sessionId: sessionId,
          organizationLearnerId: sr.id,
          subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
        });
      });

      const scoCertificationCandidateRepository = new InMemorySCOCertificationCandidateRepository();
      const organizationLearnerRepository = { findByIds: sinon.stub() };
      const countryRepository = { findAll: sinon.stub() };
      countryRepository.findAll.resolves([country]);
      organizationLearnerRepository.findByIds.withArgs({ ids: studentIds }).resolves(organizationLearners);
      const sessionRepository = { get: sinon.stub() };
      sessionRepository.get.withArgs({ id: sessionId }).resolves(session);
      const centerRepository = { getById: sinon.stub() };
      centerRepository.getById.withArgs({ id: session.certificationCenterId }).resolves(
        domainBuilder.certification.enrolment.buildCenter({
          matchingOrganization: domainBuilder.certification.enrolment.buildMatchingOrganization({
            id: organizationForReferent.id,
          }),
        }),
      );

      // when
      await enrolStudentsToSession({
        sessionId,
        studentIds,
        scoCertificationCandidateRepository,
        organizationLearnerRepository,
        sessionRepository,
        countryRepository,
        centerRepository,
      });

      // then
      expect(scoCertificationCandidateRepository.findBySessionId(sessionId)).to.deep.equal(
        expectedCertificationCandidates,
      );
      expect(scoCertificationCandidateRepository.findBySessionId(anotherSessionId)).to.deep.equal(undefined);
    });

    it('enrols a student by trimming his first name and last name', async function () {
      // given
      const session = domainBuilder.certification.enrolment.buildSession();
      const sessionId = session.id;

      const organizationForReferent = domainBuilder.buildOrganization();
      const country = domainBuilder.buildCountry({
        code: '99100',
        name: 'FRANCE',
      });

      const organizationLearner = domainBuilder.buildOrganizationLearner({
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
        birthdate: organizationLearner.birthdate,
        sex: organizationLearner.sex,
        birthINSEECode: organizationLearner.birthCityCode,
        birthCountry: country.name,
        birthCity: organizationLearner.birthCity,
        sessionId: sessionId,
        organizationLearnerId: 1,
        subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
      });

      const scoCertificationCandidateRepository = new InMemorySCOCertificationCandidateRepository();
      const organizationLearnerRepository = { findByIds: sinon.stub() };
      const countryRepository = { findAll: sinon.stub() };
      countryRepository.findAll.resolves([country]);
      organizationLearnerRepository.findByIds.withArgs({ ids: [1] }).resolves([organizationLearner]);
      const sessionRepository = { get: sinon.stub() };
      sessionRepository.get.withArgs({ id: sessionId }).resolves(session);
      const centerRepository = { getById: sinon.stub() };
      centerRepository.getById.withArgs({ id: session.certificationCenterId }).resolves(
        domainBuilder.certification.enrolment.buildCenter({
          matchingOrganization: domainBuilder.certification.enrolment.buildMatchingOrganization({
            id: organizationForReferent.id,
          }),
        }),
      );

      // when
      await enrolStudentsToSession({
        sessionId,
        studentIds: [1],
        scoCertificationCandidateRepository,
        organizationLearnerRepository,
        sessionRepository,
        countryRepository,
        centerRepository,
      });

      // then
      expect(scoCertificationCandidateRepository.findBySessionId(sessionId)).to.deep.equal([
        expectedCertificationCandidate,
      ]);
    });

    it('rejects enrolment if students do not belong to same organization as referent', async function () {
      // given
      const session = domainBuilder.certification.enrolment.buildSession();

      const studentIds = [1, 2, 3];
      const { organizationForReferent, organizationLearners } =
        _buildNonMatchingReferentOrganisationAndOrganizationLearners(studentIds);

      const organizationLearnerRepository = { findByIds: sinon.stub() };
      organizationLearnerRepository.findByIds.withArgs({ ids: studentIds }).resolves(organizationLearners);
      const sessionRepository = { get: sinon.stub() };
      sessionRepository.get.withArgs({ id: session.id }).resolves(session);
      const centerRepository = { getById: sinon.stub() };
      centerRepository.getById.withArgs({ id: session.certificationCenterId }).resolves(
        domainBuilder.certification.enrolment.buildCenter({
          matchingOrganization: domainBuilder.certification.enrolment.buildMatchingOrganization({
            id: organizationForReferent.id,
          }),
        }),
      );

      // when
      const error = await catchErr(enrolStudentsToSession)({
        sessionId: session.id,
        studentIds,
        organizationLearnerRepository,
        centerRepository,
        sessionRepository,
      });

      // then
      expect(error).to.be.instanceof(ForbiddenAccess);
    });

    it('rejects enrolment if a student birth country is not found', async function () {
      // given
      const session = domainBuilder.certification.enrolment.buildSession();
      const sessionId = session.id;

      const studentIds = [1, 2, 3];
      const { organizationForReferent, organizationLearners } =
        _buildMatchingReferentOrganisationAndOrganizationLearners(studentIds);

      const country = domainBuilder.buildCountry({
        code: '99A07',
        name: 'COUBA',
      });

      const scoCertificationCandidateRepository = new InMemorySCOCertificationCandidateRepository();
      const organizationLearnerRepository = { findByIds: sinon.stub() };
      organizationLearnerRepository.findByIds.withArgs({ ids: studentIds }).resolves(organizationLearners);
      const countryRepository = { findAll: sinon.stub() };
      countryRepository.findAll.resolves([country]);
      const sessionRepository = { get: sinon.stub() };
      sessionRepository.get.withArgs({ id: sessionId }).resolves(session);
      const centerRepository = { getById: sinon.stub() };
      centerRepository.getById.withArgs({ id: session.certificationCenterId }).resolves(
        domainBuilder.certification.enrolment.buildCenter({
          matchingOrganization: domainBuilder.certification.enrolment.buildMatchingOrganization({
            id: organizationForReferent.id,
          }),
        }),
      );

      // when
      const error = await catchErr(enrolStudentsToSession)({
        sessionId,
        studentIds,
        scoCertificationCandidateRepository,
        organizationLearnerRepository,
        sessionRepository,
        countryRepository,
        centerRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(UnknownCountryForStudentEnrolmentError);
      expect(error.message).to.contains(`${organizationLearners[0].firstName} ${organizationLearners[0].lastName}`);
    });

    it('does nothing if no student ids is given as input', async function () {
      // given
      const session = domainBuilder.certification.enrolment.buildSession();
      const sessionId = session.id;
      const studentIds = [];
      const { organizationForReferent, organizationLearners } =
        _buildMatchingReferentOrganisationAndOrganizationLearners(studentIds);
      const country = domainBuilder.buildCountry({
        code: '99100',
        name: 'FRANCE',
      });

      const scoCertificationCandidateRepository = new InMemorySCOCertificationCandidateRepository();
      const organizationLearnerRepository = { findByIds: sinon.stub() };
      const countryRepository = { findAll: sinon.stub() };
      countryRepository.findAll.resolves([country]);
      organizationLearnerRepository.findByIds.withArgs({ ids: studentIds }).resolves(organizationLearners);
      const sessionRepository = { get: sinon.stub() };
      sessionRepository.get.withArgs({ id: sessionId }).resolves(session);
      const centerRepository = { getById: sinon.stub() };
      centerRepository.getById.withArgs({ id: session.certificationCenterId }).resolves(
        domainBuilder.certification.enrolment.buildCenter({
          matchingOrganization: domainBuilder.certification.enrolment.buildMatchingOrganization({
            id: organizationForReferent.id,
          }),
        }),
      );

      // when
      await enrolStudentsToSession({
        sessionId,
        studentIds,
        scoCertificationCandidateRepository,
        centerRepository,
        organizationLearnerRepository,
        countryRepository,
        sessionRepository,
      });

      // then
      expect(scoCertificationCandidateRepository.findBySessionId(sessionId)).to.deep.equal([]);
    });
  });
});

function _buildMatchingReferentOrganisationAndOrganizationLearners(studentIds) {
  const organizationForReferent = domainBuilder.buildOrganization();
  const organizationLearners = studentIds.map((id) => {
    return domainBuilder.buildOrganizationLearner({
      id,
      organization: organizationForReferent,
    });
  });

  return { organizationForReferent, organizationLearners };
}

function _buildNonMatchingReferentOrganisationAndOrganizationLearners(studentIds) {
  const organizationForStudents = domainBuilder.buildOrganization({ id: 123 });
  const organizationLearners = studentIds.map((id) => {
    return domainBuilder.buildOrganizationLearner({ id, organization: organizationForStudents });
  });

  const organizationForReferent = domainBuilder.buildOrganization({ id: 456 });
  return { organizationForReferent, organizationLearners };
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
