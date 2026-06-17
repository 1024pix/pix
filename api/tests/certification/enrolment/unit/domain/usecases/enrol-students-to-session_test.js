import sinon from 'sinon';

import { UnknownCountryForStudentEnrolmentError } from '../../../../../../src/certification/enrolment/domain/errors.js';
import { Candidate } from '../../../../../../src/certification/enrolment/domain/models/Candidate.js';
import { enrolStudentsToSession } from '../../../../../../src/certification/enrolment/domain/usecases/enrol-students-to-session.js';
import { SUBSCRIPTION_TYPES } from '../../../../../../src/certification/shared/domain/constants.js';
import { ForbiddenAccess } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Enrolment | Unit | UseCase | enrol-students-to-session', function () {
  let organizationLearnerRepository;
  let centerRepository;
  let countryRepository;
  let sessionRepository;
  let candidateRepository;
  const certificationCpfCityRepository = Symbol('certificationCpfCityRepository');
  const certificationCpfCountryRepository = Symbol('certificationCpfCountryRepository');
  let certificationCpfService;
  let eventAdapter;
  let dependencies;
  const sessionId = 123,
    certificationCenterId = 456,
    organizationId = 789;
  const michelStudentData = {
    id: 1,
    firstName: 'Michel ',
    lastName: 'Jacques',
    birthdate: '1990-01-04',
    sex: 'M',
    birthCityCode: 'CITYCODEMICHEL',
    birthCity: 'Michelopolis',
    birthCountryCode: '100',
  };
  const jeannetteStudentData = {
    id: 2,
    firstName: 'Jeannette',
    lastName: 'Leto ',
    birthdate: '1989-02-18',
    sex: 'F',
    birthCityCode: 'CITYCODEJEANNETTE',
    birthCity: 'Jeanettopolis',
    birthCountryCode: '100',
  };

  beforeEach(function () {
    organizationLearnerRepository = {
      findByIds: sinon.stub(),
    };
    centerRepository = {
      getById: sinon.stub(),
    };
    sessionRepository = {
      get: sinon.stub(),
    };
    candidateRepository = {
      findBySessionId: sinon.stub(),
      save: sinon.stub(),
    };
    countryRepository = {
      findAll: sinon.stub(),
    };
    certificationCpfService = {
      getBirthInformation: sinon.stub(),
    };
    eventAdapter = { onCandidatesEnrolledSco: sinon.stub() };

    sessionRepository.get
      .withArgs({ id: sessionId })
      .resolves(domainBuilder.certification.enrolment.buildSession({ id: sessionId, certificationCenterId }));
    centerRepository.getById.withArgs({ id: certificationCenterId }).resolves(
      domainBuilder.certification.enrolment.buildCenter({
        matchingOrganization: domainBuilder.certification.enrolment.buildMatchingOrganization({
          id: organizationId,
        }),
      }),
    );
    const country = domainBuilder.buildCountry({
      code: '99100',
      name: 'FRANCE',
    });
    countryRepository.findAll.resolves([country]);

    dependencies = {
      organizationLearnerRepository,
      centerRepository,
      sessionRepository,
      candidateRepository,
      countryRepository,
      certificationCpfCityRepository,
      certificationCpfCountryRepository,
      certificationCpfService,
      eventAdapter,
    };
  });

  context('success case', function () {
    it('does nothing if no student ids is given as input', async function () {
      await enrolStudentsToSession({
        ...dependencies,
        sessionId,
        studentIds: [],
      });

      // then
      expect(candidateRepository.save).to.not.have.been.called;
      expect(eventAdapter.onCandidatesEnrolledSco).to.not.have.been.called;
    });

    it('enrols students to the session', async function () {
      // given
      const studentIds = [michelStudentData.id, jeannetteStudentData.id];
      candidateRepository.findBySessionId.withArgs({ sessionId }).resolves([]);
      const organizationLearners = [michelStudentData, jeannetteStudentData].map((studentData) =>
        domainBuilder.buildOrganizationLearner({
          ...studentData,
          organization: domainBuilder.certification.enrolment.buildMatchingOrganization({
            id: organizationId,
          }),
        }),
      );
      organizationLearnerRepository.findByIds.withArgs({ ids: studentIds }).resolves(organizationLearners);
      const savedCandidates = [
        new Candidate({
          id: 1,
          firstName: 'Michel',
          lastName: 'Jacques',
          birthdate: '1990-01-04',
          sex: 'M',
          birthINSEECode: 'CITYCODEMICHEL',
          birthCity: 'Michelopolis',
          birthCountry: 'FRANCE',
          sessionId,
          organizationLearnerId: 1,
          subscription: SUBSCRIPTION_TYPES.CORE,
        }),
        new Candidate({
          id: 2,
          firstName: 'Jeannette',
          lastName: 'Leto',
          birthdate: '1989-02-18',
          sex: 'F',
          birthINSEECode: 'CITYCODEJEANNETTE',
          birthCity: 'Jeanettopolis',
          birthCountry: 'FRANCE',
          sessionId,
          organizationLearnerId: 2,
          subscription: SUBSCRIPTION_TYPES.CORE,
        }),
      ];
      candidateRepository.save.resolves(savedCandidates);

      // when
      await enrolStudentsToSession({
        ...dependencies,
        sessionId,
        studentIds,
      });

      // then
      expect(candidateRepository.save).to.have.been.calledWithExactly({
        candidates: [
          new Candidate({
            firstName: 'Michel',
            lastName: 'Jacques',
            birthdate: '1990-01-04',
            sex: 'M',
            birthINSEECode: 'CITYCODEMICHEL',
            birthCity: 'Michelopolis',
            birthCountry: 'FRANCE',
            sessionId,
            organizationLearnerId: 1,
            subscription: SUBSCRIPTION_TYPES.CORE,
          }),
          new Candidate({
            firstName: 'Jeannette',
            lastName: 'Leto',
            birthdate: '1989-02-18',
            sex: 'F',
            birthINSEECode: 'CITYCODEJEANNETTE',
            birthCity: 'Jeanettopolis',
            birthCountry: 'FRANCE',
            sessionId,
            organizationLearnerId: 2,
            subscription: SUBSCRIPTION_TYPES.CORE,
          }),
        ],
      });
      expect(eventAdapter.onCandidatesEnrolledSco).to.have.been.calledWithExactly({ candidates: savedCandidates });
    });

    it('prevents from enrolling twice the same student if a student is already enrolled', async function () {
      // given
      const studentIds = [michelStudentData.id, jeannetteStudentData.id];
      candidateRepository.findBySessionId.withArgs({ sessionId }).resolves([
        domainBuilder.certification.enrolment.buildCandidate({
          organizationLearnerId: 1,
        }),
      ]);
      const jeanetteLearner = domainBuilder.buildOrganizationLearner({
        ...jeannetteStudentData,
        organization: domainBuilder.certification.enrolment.buildMatchingOrganization({
          id: organizationId,
        }),
      });
      organizationLearnerRepository.findByIds.withArgs({ ids: [2] }).resolves([jeanetteLearner]);
      const savedCandidates = [
        new Candidate({
          id: 1,
          firstName: 'Jeannette',
          lastName: 'Leto',
          birthdate: '1989-02-18',
          sex: 'F',
          birthINSEECode: 'CITYCODEJEANNETTE',
          birthCity: 'Jeanettopolis',
          birthCountry: 'FRANCE',
          sessionId,
          organizationLearnerId: 2,
          subscription: SUBSCRIPTION_TYPES.CORE,
        }),
      ];
      candidateRepository.save.resolves(savedCandidates);

      // when
      await enrolStudentsToSession({
        ...dependencies,
        sessionId,
        studentIds,
      });

      // then
      expect(candidateRepository.save).to.have.been.calledWithExactly({
        candidates: [
          new Candidate({
            firstName: 'Jeannette',
            lastName: 'Leto',
            birthdate: '1989-02-18',
            sex: 'F',
            birthINSEECode: 'CITYCODEJEANNETTE',
            birthCity: 'Jeanettopolis',
            birthCountry: 'FRANCE',
            sessionId,
            organizationLearnerId: 2,
            subscription: SUBSCRIPTION_TYPES.CORE,
          }),
        ],
      });
      expect(eventAdapter.onCandidatesEnrolledSco).to.have.been.calledWithExactly({ candidates: savedCandidates });
    });
  });

  context('when some students to enroll do not belong to organization', function () {
    it('rejects enrolment', async function () {
      // given
      const studentIds = [michelStudentData.id, jeannetteStudentData.id];
      candidateRepository.findBySessionId.withArgs({ sessionId }).resolves([]);
      const michelLearner = domainBuilder.buildOrganizationLearner({
        ...michelStudentData,
        organization: domainBuilder.certification.enrolment.buildMatchingOrganization({
          id: organizationId,
        }),
      });
      const jeanetteLearner = domainBuilder.buildOrganizationLearner({
        ...jeannetteStudentData,
        organization: domainBuilder.certification.enrolment.buildMatchingOrganization({
          id: organizationId + 1,
        }),
      });
      organizationLearnerRepository.findByIds.withArgs({ ids: studentIds }).resolves([michelLearner, jeanetteLearner]);

      // when
      const error = await catchErr(enrolStudentsToSession)({
        ...dependencies,
        sessionId,
        studentIds,
      });

      // then
      expect(error).to.be.instanceof(ForbiddenAccess);
      expect(candidateRepository.save).to.not.have.been.called;
      expect(eventAdapter.onCandidatesEnrolledSco).to.not.have.been.called;
    });
  });

  context('birth place data check', function () {
    context('when student birth country is not found', function () {
      it('rejects enrolment', async function () {
        // given
        const studentIds = [michelStudentData.id, jeannetteStudentData.id];
        candidateRepository.findBySessionId.withArgs({ sessionId }).resolves([]);
        const michelLearner = domainBuilder.buildOrganizationLearner({
          ...michelStudentData,
          organization: domainBuilder.certification.enrolment.buildMatchingOrganization({
            id: organizationId,
          }),
        });
        const jeanetteLearner = domainBuilder.buildOrganizationLearner({
          ...jeannetteStudentData,
          birthCountryCode: '99',
          organization: domainBuilder.certification.enrolment.buildMatchingOrganization({
            id: organizationId,
          }),
        });
        organizationLearnerRepository.findByIds
          .withArgs({ ids: studentIds })
          .resolves([michelLearner, jeanetteLearner]);

        // when
        const error = await catchErr(enrolStudentsToSession)({
          ...dependencies,
          sessionId,
          studentIds,
        });

        // then
        expect(error).to.be.an.instanceOf(UnknownCountryForStudentEnrolmentError);
        expect(error.message).to.equal(
          "L'élève Jeannette Leto a été inscrit avec un code pays de naissance invalide. Veuillez corriger ses informations sur l'espace PixOrga de l'établissement ou contacter le support Pix",
        );
        expect(candidateRepository.save).to.not.have.been.called;
        expect(eventAdapter.onCandidatesEnrolledSco).to.not.have.been.called;
      });
    });

    context('when student birth city is missing', function () {
      it('computes the birth city from the student birth city code', async function () {
        // given
        const studentIds = [michelStudentData.id, jeannetteStudentData.id];
        candidateRepository.findBySessionId.withArgs({ sessionId }).resolves([]);
        const michelLearner = domainBuilder.buildOrganizationLearner({
          ...michelStudentData,
          organization: domainBuilder.certification.enrolment.buildMatchingOrganization({
            id: organizationId,
          }),
        });
        const jeanetteLearner = domainBuilder.buildOrganizationLearner({
          ...jeannetteStudentData,
          birthCity: null,
          organization: domainBuilder.certification.enrolment.buildMatchingOrganization({
            id: organizationId,
          }),
        });
        organizationLearnerRepository.findByIds
          .withArgs({ ids: studentIds })
          .resolves([michelLearner, jeanetteLearner]);
        certificationCpfService.getBirthInformation
          .withArgs({
            birthCountry: 'FRANCE',
            birthINSEECode: 'CITYCODEJEANNETTE',
            birthCity: null,
            birthPostalCode: null,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
          })
          .resolves({ birthCity: 'Computed City' });
        const savedCandidates = [
          new Candidate({
            id: 1,
            firstName: 'Michel',
            lastName: 'Jacques',
            birthdate: '1990-01-04',
            sex: 'M',
            birthINSEECode: 'CITYCODEMICHEL',
            birthCity: 'Michelopolis',
            birthCountry: 'FRANCE',
            sessionId,
            organizationLearnerId: 1,
            subscription: SUBSCRIPTION_TYPES.CORE,
          }),
          new Candidate({
            id: 2,
            firstName: 'Jeannette',
            lastName: 'Leto',
            birthdate: '1989-02-18',
            sex: 'F',
            birthINSEECode: 'CITYCODEJEANNETTE',
            birthCity: 'Computed City',
            birthCountry: 'FRANCE',
            sessionId,
            organizationLearnerId: 2,
            subscription: SUBSCRIPTION_TYPES.CORE,
          }),
        ];
        candidateRepository.save.resolves(savedCandidates);

        // when
        await enrolStudentsToSession({
          ...dependencies,
          sessionId,
          studentIds,
        });

        // then
        expect(candidateRepository.save).to.have.been.calledWithExactly({
          candidates: [
            new Candidate({
              firstName: 'Michel',
              lastName: 'Jacques',
              birthdate: '1990-01-04',
              sex: 'M',
              birthINSEECode: 'CITYCODEMICHEL',
              birthCity: 'Michelopolis',
              birthCountry: 'FRANCE',
              sessionId,
              organizationLearnerId: 1,
              subscription: SUBSCRIPTION_TYPES.CORE,
            }),
            new Candidate({
              firstName: 'Jeannette',
              lastName: 'Leto',
              birthdate: '1989-02-18',
              sex: 'F',
              birthINSEECode: 'CITYCODEJEANNETTE',
              birthCity: 'Computed City',
              birthCountry: 'FRANCE',
              sessionId,
              organizationLearnerId: 2,
              subscription: SUBSCRIPTION_TYPES.CORE,
            }),
          ],
        });
        expect(eventAdapter.onCandidatesEnrolledSco).to.have.been.calledWithExactly({
          candidates: savedCandidates,
        });
      });
    });
  });
});
