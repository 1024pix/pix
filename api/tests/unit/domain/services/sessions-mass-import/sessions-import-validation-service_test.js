const { catchErr, expect, sinon, domainBuilder } = require('../../../../test-helper');
const sessionsImportValidationService = require('../../../../../lib/domain/services/sessions-mass-import/sessions-import-validation-service');
const {
  SessionWithIdAndInformationOnMassImportError,
  EntityValidationError,
  InvalidCertificationCandidate,
} = require('../../../../../lib/domain/errors');
const { UnprocessableEntityError } = require('../../../../../lib/application/http-errors');
const { CpfBirthInformationValidation } = require('../../../../../lib/domain/services/certification-cpf-service');
const certificationCpfService = require('../../../../../lib/domain/services/certification-cpf-service');

describe('Unit | Service | sessions import validation Service', function () {
  describe('#validateSession', function () {
    let clock;
    let sessionRepository;
    let certificationCourseRepository;

    beforeEach(function () {
      clock = sinon.useFakeTimers({
        now: new Date('2023-01-01'),
        toFake: ['Date'],
      });
      sessionRepository = { isSessionExisting: sinon.stub() };
      certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
    });

    afterEach(async function () {
      clock.restore();
    });

    context('when the parsed data is valid', function () {
      context('when the session has not started yet', function () {
        context('when there is no sessionId', function () {
          it('should not throw', async function () {
            // given
            const session = _buildValidSessionWithoutId();
            sessionRepository.isSessionExisting.withArgs({ ...session }).resolves(false);

            // when
            // then
            expect(
              await sessionsImportValidationService.validateSession({
                session,
                sessionRepository,
                certificationCourseRepository,
              })
            ).to.not.throw;
          });
        });

        context('when there is a sessionId', function () {
          it('should not throw', async function () {
            // given
            const sessionId = 1;
            const session = _buildValidSessionWithId(sessionId);
            certificationCourseRepository.findCertificationCoursesBySessionId.resolves([]);

            // when
            // then
            expect(
              await sessionsImportValidationService.validateSession({
                session,
                sessionRepository,
                certificationCourseRepository,
              })
            ).to.not.throw;
          });
        });
      });
    });

    context('when the session has already started', function () {
      it('should throw an UnprocessableEntityError', async function () {
        const session = _buildValidSessionWithId(1234);
        certificationCourseRepository.findCertificationCoursesBySessionId
          .withArgs({ sessionId: 1234 })
          .resolves([domainBuilder.buildCertificationCourse({ sessionId: 1234 })]);

        // when
        const error = await catchErr(sessionsImportValidationService.validateSession)({
          session,
          sessionRepository,
          certificationCourseRepository,
        });

        // then
        expect(error).to.be.instanceOf(UnprocessableEntityError);
        expect(error.message).to.equal("Impossible d'ajouter un candidat à une session qui a déjà commencé.");
      });
    });

    context('date validation', function () {
      context('when at least one session is scheduled in the past', function () {
        it('should throw', async function () {
          // given
          const session = _buildValidSessionWithoutId();
          session.date = '2020-03-12';

          // when
          const error = await catchErr(sessionsImportValidationService.validateSession)({
            session,
            sessionRepository,
            certificationCourseRepository,
          });

          // then
          expect(error.message).to.equal('Une session ne peut pas être programmée dans le passé');
        });
      });
    });

    context('conflicting session information validation', function () {
      context('when there is a sessionId and session information', function () {
        it('should throw', async function () {
          // given
          const session = _buildValidSessionWithoutId();
          session.id = 1234;

          // when
          const error = await catchErr(sessionsImportValidationService.validateSession)({
            session,
            sessionRepository,
            certificationCourseRepository,
          });

          // then
          expect(error).to.be.an.instanceOf(SessionWithIdAndInformationOnMassImportError);
          expect(error.message).to.equal(
            'Merci de ne pas renseigner les informations de session pour la session: 1234'
          );
        });
      });

      context('when there is session information but no sessionId', function () {
        it('should not throw', async function () {
          const session = domainBuilder.buildSession({
            ..._createValidSessionData(),
            id: null,
            certificationCandidates: [],
          });

          // when
          // then
          expect(
            sessionsImportValidationService.validateSession({
              session,
              sessionRepository,
              certificationCourseRepository,
            })
          ).not.to.throw;
        });
      });
    });

    context('when there already is an existing session with the same data as a newly imported one', function () {
      it('should throw an error', async function () {
        // given
        const session = _buildValidSessionWithoutId();
        sessionRepository.isSessionExisting.withArgs({ ...session }).resolves(true);

        // when
        const err = await catchErr(sessionsImportValidationService.validateSession)({
          session,
          sessionRepository,
          certificationCourseRepository,
        });

        // then
        expect(err).to.be.instanceOf(UnprocessableEntityError);
      });
    });

    context('when session has certification candidates', function () {
      context('when at least one candidate is duplicated', function () {
        it('should throw', async function () {
          // given
          const validCandidateData = _buildValidCandidateData(1);
          const validCandidateDataDuplicate = _buildValidCandidateData(1);
          const session = _buildValidSessionWithoutId();
          session.certificationCandidates = [validCandidateData, validCandidateDataDuplicate];

          // when
          const error = await catchErr(sessionsImportValidationService.validateSession)({
            session,
            sessionRepository,
            certificationCourseRepository,
          });

          // then
          expect(error.message).to.equal('Une session contient au moins un élève en double.');
        });
      });
    });

    context('when session has at least one invalid field', function () {
      it('should throw an EntityValidationError', async function () {
        // given
        const session = _buildValidSessionWithoutId();
        session.room = null;

        // when
        const error = await catchErr(sessionsImportValidationService.validateSession)({
          session,
          sessionRepository,
          certificationCourseRepository,
        });

        // then
        expect(error).to.be.instanceOf(EntityValidationError);
        expect(error.message).to.equal("Échec de validation de l'entité.");
      });
    });
  });

  describe('#getValidatedCandidateBirthInformation', function () {
    beforeEach(function () {
      sinon.stub(certificationCpfService, 'getBirthInformation');
    });

    context('when the parsed data is valid', function () {
      it('should not throw', async function () {
        // given
        const candidateInformation = {
          birthCountry: 'Pérou',
          birthCity: 'Pétaouchnok',
          birthPostalCode: '44329',
          birthINSEECode: '67890',
        };
        const candidate = _buildValidCandidateData();

        certificationCpfService.getBirthInformation.resolves(
          CpfBirthInformationValidation.success(candidateInformation)
        );

        // when
        const cpfBirthInformation = await sessionsImportValidationService.getValidatedCandidateBirthInformation({
          candidate,
          isSco: false,
        });

        // then
        expect(cpfBirthInformation).not.to.throw;
        expect(cpfBirthInformation).to.deep.equal({ ...candidateInformation });
      });
    });

    context('when candidate parsed data is invalid', function () {
      it('should throw an InvalidCertificationCandidate', async function () {
        // given
        const isSco = false;
        const candidate = _buildValidCandidateData();
        candidate.firstName = null;

        // when
        const error = await catchErr(sessionsImportValidationService.getValidatedCandidateBirthInformation)({
          candidate,
          isSco,
        });

        // then
        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.message).to.equal('Candidat de certification invalide.');
      });
    });

    context('when candidate has missing billing information', function () {
      context('when the parsed candidate is not sco', function () {
        it('should throw an InvalidCertificationCandidate', async function () {
          // given
          const isSco = false;
          const candidate = _buildValidCandidateData();
          candidate.billingMode = null;

          // when
          const error = await catchErr(sessionsImportValidationService.getValidatedCandidateBirthInformation)({
            candidate,
            isSco,
          });

          // then
          expect(error).to.be.instanceOf(InvalidCertificationCandidate);
          expect(error.message).to.equal('Candidat de certification invalide.');
        });
      });

      context('when the parsed candidate is sco', function () {
        it('should not throw an InvalidCertificationCandidate', async function () {
          // given
          const isSco = true;
          const candidateInformation = {
            birthCountry: 'Pérou',
            birthCity: 'Pétaouchnok',
            birthPostalCode: '44329',
            birthINSEECode: '67890',
          };
          const candidate = _buildValidCandidateData();
          candidate.billingMode = null;

          certificationCpfService.getBirthInformation.resolves(
            CpfBirthInformationValidation.success(candidateInformation)
          );

          // when
          // then
          expect(
            await sessionsImportValidationService.getValidatedCandidateBirthInformation({
              candidate,
              isSco,
            })
          ).not.to.throw;
        });
      });
    });

    context('when the parsed candidate data has invalid CPF information', function () {
      it('should throw an InvalidCertificationCandidate', async function () {
        // given
        const candidate = _buildValidCandidateData();
        const certificationCpfCountryRepository = Symbol();
        const certificationCpfCityRepository = Symbol();
        certificationCpfService.getBirthInformation
          .withArgs({
            birthCountry: candidate.birthCountry,
            birthCity: candidate.birthCity,
            birthPostalCode: candidate.birthPostalCode,
            birthINSEECode: candidate.birthINSEECode,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
          })
          .resolves(CpfBirthInformationValidation.failure());

        // when
        const error = await catchErr(sessionsImportValidationService.getValidatedCandidateBirthInformation)({
          candidate,
          isSco: false,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
        });

        // then
        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
      });
    });
  });
});

function _createValidSessionData() {
  return {
    sessionId: undefined,
    address: 'Site 1',
    room: 'Salle 1',
    date: '2023-03-12',
    time: '01:00',
    examiner: 'Pierre',
    description: 'desc',
    certificationCandidates: [],
  };
}

function _buildValidSessionWithId(sessionId) {
  return domainBuilder.buildSession({
    id: sessionId,
    address: null,
    room: null,
    date: null,
    time: null,
    examiner: null,
    description: null,
    certificationCandidates: null,
  });
}

function _buildValidSessionWithoutId() {
  return domainBuilder.buildSession({
    id: null,
    date: '2024-03-12',
  });
}

function _buildValidCandidateData(candidateNumber = 2) {
  return domainBuilder.buildCertificationCandidate({
    lastName: `Candidat ${candidateNumber}`,
    firstName: `Candidat ${candidateNumber}`,
    birthdate: '1981-03-12',
    sex: 'M',
    birthINSEECode: '134',
    birthPostalCode: null, //'3456',
    birthCity: '',
    birthCountry: 'France',
    resultRecipientEmail: 'robindahood@email.fr',
    email: 'robindahood2@email.fr',
    externalId: 'htehte',
    extraTimePercentage: '20',
    billingMode: 'PAID',
  });
}
