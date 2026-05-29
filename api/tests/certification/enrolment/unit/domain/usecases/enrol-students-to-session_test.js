import sinon from 'sinon';

import { UnknownCountryForStudentEnrolmentError } from '../../../../../../src/certification/enrolment/domain/errors.js';
import { SCOCertificationCandidate } from '../../../../../../src/certification/enrolment/domain/models/SCOCertificationCandidate.js';
import { enrolStudentsToSession } from '../../../../../../src/certification/enrolment/domain/usecases/enrol-students-to-session.js';
import { ForbiddenAccess } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Enrolment | Unit | UseCase | enrol-students-to-session', function () {
  let scoCertificationCandidateRepository;
  let organizationLearnerRepository;
  let centerRepository;
  let countryRepository;
  let sessionRepository;
  const certificationCpfCityRepository = Symbol('certificationCpfCityRepository');
  const certificationCpfCountryRepository = Symbol('certificationCpfCountryRepository');
  let certificationCpfService;
  let eventApi;
  let dependencies;

  beforeEach(function () {
    scoCertificationCandidateRepository = {
      addNonEnrolledCandidatesToSession: sinon.stub(),
    };
    organizationLearnerRepository = {
      findByIds: sinon.stub(),
    };
    centerRepository = {
      getById: sinon.stub(),
    };
    countryRepository = {
      findAll: sinon.stub(),
    };
    sessionRepository = {
      get: sinon.stub(),
    };
    certificationCpfService = {
      getBirthInformation: sinon.stub(),
    };
    eventApi = { pushMultipleCandidatesEnrolledEvent: sinon.stub() };

    dependencies = {
      scoCertificationCandidateRepository,
      organizationLearnerRepository,
      centerRepository,
      countryRepository,
      sessionRepository,
      certificationCpfCityRepository,
      certificationCpfCountryRepository,
      certificationCpfService,
      eventApi,
    };
  });

  context('when referent is allowed to Pix Certif', function () {
    it('enrols n students to a session', async function () {
      // given
      const session = domainBuilder.certification.enrolment.buildSession();
      const sessionId = session.id;

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
          subscriptions: [
            domainBuilder.certification.enrolment.buildCoreSubscription({ certificationCandidateId: null }),
          ],
        });
      });

      scoCertificationCandidateRepository.addNonEnrolledCandidatesToSession
        .withArgs({
          sessionId,
          scoCertificationCandidates: expectedCertificationCandidates,
        })
        .resolves(expectedCertificationCandidates);
      countryRepository.findAll.resolves([country]);
      organizationLearnerRepository.findByIds.withArgs({ ids: studentIds }).resolves(organizationLearners);
      sessionRepository.get.withArgs({ id: sessionId }).resolves(session);
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
        ...dependencies,
      });

      // then
      expect(eventApi.pushMultipleCandidatesEnrolledEvent).to.have.been.calledOnceWith(
        expectedCertificationCandidates.map((savedCandidate) => savedCandidate.toDTO()),
      );
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
        subscriptions: [
          domainBuilder.certification.enrolment.buildCoreSubscription({ certificationCandidateId: null }),
        ],
      });

      scoCertificationCandidateRepository.addNonEnrolledCandidatesToSession
        .withArgs({
          sessionId,
          scoCertificationCandidates: [expectedCertificationCandidate],
        })
        .resolves([expectedCertificationCandidate]);
      countryRepository.findAll.resolves([country]);
      organizationLearnerRepository.findByIds.withArgs({ ids: [1] }).resolves([organizationLearner]);
      sessionRepository.get.withArgs({ id: sessionId }).resolves(session);
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
        ...dependencies,
      });

      // then
      expect(eventApi.pushMultipleCandidatesEnrolledEvent).to.have.been.calledOnceWith([
        expectedCertificationCandidate.toDTO(),
      ]);
    });

    it('rejects enrolment if students do not belong to same organization as referent', async function () {
      // given
      const session = domainBuilder.certification.enrolment.buildSession();

      const studentIds = [1, 2, 3];
      const { organizationForReferent, organizationLearners } =
        _buildNonMatchingReferentOrganisationAndOrganizationLearners(studentIds);

      organizationLearnerRepository.findByIds.withArgs({ ids: studentIds }).resolves(organizationLearners);
      sessionRepository.get.withArgs({ id: session.id }).resolves(session);
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
        ...dependencies,
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

      organizationLearnerRepository.findByIds.withArgs({ ids: studentIds }).resolves(organizationLearners);
      countryRepository.findAll.resolves([country]);
      sessionRepository.get.withArgs({ id: sessionId }).resolves(session);
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
        ...dependencies,
      });

      // then
      expect(error).to.be.an.instanceOf(UnknownCountryForStudentEnrolmentError);
      expect(error.message).to.contains(`${organizationLearners[0].firstName} ${organizationLearners[0].lastName}`);
    });

    context('when student birth city is missing', function () {
      it('should get birth city from the student birth city code', async function () {
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
          birthCity: null,
          birthCityCode: '75115',
          organization: organizationForReferent,
        });

        const expectedCertificationCandidate = new SCOCertificationCandidate({
          firstName: 'Sarah Michelle',
          lastName: 'Gellar',
          birthdate: organizationLearner.birthdate,
          sex: organizationLearner.sex,
          birthINSEECode: organizationLearner.birthCityCode,
          birthCountry: country.name,
          birthCity: 'expected city',
          sessionId: sessionId,
          organizationLearnerId: 1,
          subscriptions: [
            domainBuilder.certification.enrolment.buildCoreSubscription({ certificationCandidateId: null }),
          ],
        });

        scoCertificationCandidateRepository.addNonEnrolledCandidatesToSession
          .withArgs({
            sessionId,
            scoCertificationCandidates: [expectedCertificationCandidate],
          })
          .resolves([expectedCertificationCandidate]);
        countryRepository.findAll.resolves([country]);
        organizationLearnerRepository.findByIds.withArgs({ ids: [1] }).resolves([organizationLearner]);
        sessionRepository.get.withArgs({ id: sessionId }).resolves(session);
        centerRepository.getById.withArgs({ id: session.certificationCenterId }).resolves(
          domainBuilder.certification.enrolment.buildCenter({
            matchingOrganization: domainBuilder.certification.enrolment.buildMatchingOrganization({
              id: organizationForReferent.id,
            }),
          }),
        );
        certificationCpfService.getBirthInformation.resolves({ birthCity: expectedCertificationCandidate.birthCity });

        // when
        await enrolStudentsToSession({
          sessionId,
          studentIds: [1],
          ...dependencies,
        });

        // then
        expect(certificationCpfService.getBirthInformation).to.have.been.calledOnceWithExactly({
          birthCountry: country.name,
          birthINSEECode: organizationLearner.birthCityCode,
          birthCity: null,
          birthPostalCode: null,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
        });
        expect(eventApi.pushMultipleCandidatesEnrolledEvent).to.have.been.calledOnceWith([
          expectedCertificationCandidate.toDTO(),
        ]);
      });
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

      scoCertificationCandidateRepository.addNonEnrolledCandidatesToSession.resolves([]);
      countryRepository.findAll.resolves([country]);
      organizationLearnerRepository.findByIds.withArgs({ ids: studentIds }).resolves(organizationLearners);
      sessionRepository.get.withArgs({ id: sessionId }).resolves(session);
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
        ...dependencies,
      });

      // then
      expect(eventApi.pushMultipleCandidatesEnrolledEvent).to.have.been.calledOnceWith([]);
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
