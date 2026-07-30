import { expect } from 'chai';
import sinon from 'sinon';

import {
  CannotEnrollScoCandidateError,
  UnknownCountryForStudentEnrolmentError,
} from '../../../../../../src/certification/enrolment/domain/errors.js';
import { Candidate } from '../../../../../../src/certification/enrolment/domain/models/Candidate.js';
import { enrolStudentsToSession } from '../../../../../../src/certification/enrolment/domain/usecases/enrol-students-to-session.js';
import { SUBSCRIPTION_TYPES } from '../../../../../../src/certification/shared/domain/constants.js';
import { ForbiddenAccess } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr, preventStubsToBeCalledUnexpectedly } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Enrolment | Unit | UseCase | enrol-students-to-session', function () {
  let organizationLearnerRepository;
  let countryRepository;
  let candidateRepository;
  const certificationCpfCityRepository = Symbol('certificationCpfCityRepository');
  const certificationCpfCountryRepository = Symbol('certificationCpfCountryRepository');
  let certificationCpfService;
  let eventAdapter;
  let sessionAuthorizationAdapter;
  let dependencies;
  const sessionId = 123,
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
    candidateRepository = {
      findBySessionId: sinon.stub(),
      save: sinon.stub(),
    };
    countryRepository = {
      findAll: sinon.fake.resolves([
        domainBuilder.buildCountry({
          code: '99100',
          name: 'FRANCE',
        }),
      ]),
    };
    certificationCpfService = {
      getBirthInformation: sinon.stub(),
    };
    eventAdapter = { onCandidatesEnrolledSco: sinon.stub() };
    sessionAuthorizationAdapter = { find: sinon.stub() };

    preventStubsToBeCalledUnexpectedly([
      organizationLearnerRepository.findByIds,
      candidateRepository.findBySessionId,
      candidateRepository.save,
      certificationCpfService.getBirthInformation,
      eventAdapter.onCandidatesEnrolledSco,
      sessionAuthorizationAdapter.find,
    ]);

    dependencies = {
      organizationLearnerRepository,
      candidateRepository,
      countryRepository,
      certificationCpfCityRepository,
      certificationCpfCountryRepository,
      certificationCpfService,
      eventAdapter,
      sessionAuthorizationAdapter,
    };
  });

  context('when no ids provided', function () {
    it('does nothing if no student ids is given as input', async function () {
      await enrolStudentsToSession({
        ...dependencies,
        sessionId,
        studentIds: [],
      });

      // then
      sinon.assert.notCalled(sessionAuthorizationAdapter.find);
    });
  });

  context('when adding candidate to session is not allowed', function () {
    it('throws a CannotEnrollScoCandidateError', async function () {
      sessionAuthorizationAdapter.find
        .withArgs({ sessionId })
        .resolves(
          domainBuilder.certification.enrolment.sessionAuthorizationBuilder().cannotEnrollScoCandidate().build(),
        );

      const err = await catchErr(enrolStudentsToSession)({
        ...dependencies,
        sessionId,
        studentIds: [michelStudentData.id, jeannetteStudentData.id],
      });

      // then
      expect(err).to.be.instanceOf(CannotEnrollScoCandidateError);
    });
  });

  context('success case', function () {
    beforeEach(function () {
      sessionAuthorizationAdapter.find
        .withArgs({ sessionId })
        .resolves(
          domainBuilder.certification.enrolment
            .sessionAuthorizationBuilder()
            .canEnrollScoCandidate()
            .withParameters({ scoIsManagingStudentsOrganizationId: organizationId })
            .build(),
        );
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
      eventAdapter.onCandidatesEnrolledSco.resolves();

      // when
      await enrolStudentsToSession({
        ...dependencies,
        sessionId,
        studentIds,
      });

      // then
      sinon.assert.calledWithExactly(candidateRepository.save, {
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
      sinon.assert.calledWithExactly(eventAdapter.onCandidatesEnrolledSco, { candidates: savedCandidates });
    });

    it('prevents from enrolling twice the same student if a student is already enrolled', async function () {
      // given
      const studentIds = [michelStudentData.id, jeannetteStudentData.id];
      candidateRepository.findBySessionId.withArgs({ sessionId }).resolves([
        domainBuilder.certification.enrolment
          .candidateBuilder()
          .asScoCandidate({
            organizationLearnerId: 1,
          })
          .build(),
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
      eventAdapter.onCandidatesEnrolledSco.resolves();

      // when
      await enrolStudentsToSession({
        ...dependencies,
        sessionId,
        studentIds,
      });

      // then
      sinon.assert.calledWithExactly(candidateRepository.save, {
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
      sinon.assert.calledWithExactly(eventAdapter.onCandidatesEnrolledSco, { candidates: savedCandidates });
    });
  });

  context('when some students to enroll do not belong to organization', function () {
    beforeEach(function () {
      sessionAuthorizationAdapter.find
        .withArgs({ sessionId })
        .resolves(
          domainBuilder.certification.enrolment
            .sessionAuthorizationBuilder()
            .canEnrollScoCandidate()
            .withParameters({ scoIsManagingStudentsOrganizationId: organizationId })
            .build(),
        );
    });

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
    });
  });

  context('birth place data check', function () {
    beforeEach(function () {
      sessionAuthorizationAdapter.find
        .withArgs({ sessionId })
        .resolves(
          domainBuilder.certification.enrolment
            .sessionAuthorizationBuilder()
            .canEnrollScoCandidate()
            .withParameters({ scoIsManagingStudentsOrganizationId: organizationId })
            .build(),
        );
    });
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
        eventAdapter.onCandidatesEnrolledSco.resolves();

        // when
        await enrolStudentsToSession({
          ...dependencies,
          sessionId,
          studentIds,
        });

        // then
        sinon.assert.calledWithExactly(candidateRepository.save, {
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
        sinon.assert.calledWithExactly(eventAdapter.onCandidatesEnrolledSco, {
          candidates: savedCandidates,
        });
      });
    });
  });
});
