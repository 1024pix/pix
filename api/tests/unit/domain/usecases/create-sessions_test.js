const { domainBuilder, expect, catchErr, sinon } = require('../../../test-helper');
const createSessions = require('../../../../lib/domain/usecases/create-sessions');
const { EntityValidationError, InvalidCertificationCandidate } = require('../../../../lib/domain/errors');
const { UnprocessableEntityError } = require('../../../../lib/application/http-errors');
const sessionCodeService = require('../../../../lib/domain/services/session-code-service');
const Session = require('../../../../lib/domain/models/Session');
const certificationCpfService = require('../../../../lib/domain/services/certification-cpf-service');
const { CpfBirthInformationValidation } = require('../../../../lib/domain/services/certification-cpf-service');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');
const CertificationCandidate = require('../../../../lib/domain/models/CertificationCandidate');

describe('Unit | UseCase | create-sessions', function () {
  let accessCode;
  let certificationCenterId;
  let certificationCenterName;
  let certificationCenter;
  let certificationCenterRepository;
  let certificationCourseRepository;
  let certificationCandidateRepository;
  let complementaryCertificationRepository;
  let sessionRepository;

  beforeEach(function () {
    accessCode = 'accessCode';
    certificationCenterId = '123';
    certificationCenterName = 'certificationCenterName';
    certificationCenter = domainBuilder.buildCertificationCenter({
      id: certificationCenterId,
      name: certificationCenterName,
    });
    certificationCenterRepository = { get: sinon.stub() };
    certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
    certificationCandidateRepository = { saveInSession: sinon.stub(), deleteBySessionId: sinon.stub() };
    complementaryCertificationRepository = { getByLabel: sinon.stub() };
    sessionRepository = { save: sinon.stub(), isSessionExisting: sinon.stub() };
    sinon.stub(sessionCodeService, 'getNewSessionCode');
    sinon.stub(certificationCpfService, 'getBirthInformation');
    sessionCodeService.getNewSessionCode.returns(accessCode);
    certificationCenterRepository.get.withArgs(certificationCenterId).resolves(certificationCenter);
  });

  context('when sessions are valid', function () {
    context('when user has certification center membership', function () {
      it('should save every session one by one', async function () {
        // given
        const validSessionData = createValidSessionData();
        const sessions = [
          {
            ...validSessionData,
            room: 'Salle 1',
          },
          {
            ...validSessionData,
            room: 'Salle 2',
          },
        ];

        const expectedSessions = [
          new Session({
            ...sessions[0],
            certificationCenterId,
            certificationCenter: certificationCenterName,
            accessCode,
            supervisorPassword: sinon.match(/^[2346789BCDFGHJKMPQRTVWXY]{5}$/),
          }),
          new Session({
            ...sessions[1],
            certificationCenterId,
            certificationCenter: certificationCenterName,
            accessCode,
            supervisorPassword: sinon.match(/^[2346789BCDFGHJKMPQRTVWXY]{5}$/),
          }),
        ];
        const domainTransaction = Symbol('trx');
        sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda(domainTransaction));
        sessionRepository.save
          .onCall(0)
          .resolves(domainBuilder.buildSession({ ...expectedSessions[0], id: 1234 }))
          .onCall(1)
          .resolves(domainBuilder.buildSession({ ...expectedSessions[1], id: 567 }));

        // when
        await createSessions({
          sessions,
          certificationCenterId,
          certificationCenterRepository,
          sessionRepository,
        });

        // then

        expect(sessionRepository.save).to.have.been.calledTwice;
      });

      context('when there is only sessionId and candidate information', function () {
        context('when a session has already started', function () {
          it('should throw', async function () {
            const candidate = createValidCandidateData(1);
            const sessions = [
              {
                sessionId: 1234,
                certificationCandidates: [candidate],
              },
            ];

            certificationCourseRepository.findCertificationCoursesBySessionId
              .withArgs({ sessionId: sessions[0].sessionId })
              .resolves([domainBuilder.buildCertificationCourse({ sessionId: 1234 })]);

            // when
            const error = await catchErr(createSessions)({
              sessions,
              certificationCenterId,
              certificationCenterRepository,
              certificationCourseRepository,
              sessionRepository,
            });

            // then
            expect(error).to.be.instanceOf(UnprocessableEntityError);
            expect(error.message).to.equal("Impossible d'ajouter un candidat à une session qui a déjà commencé.");
          });
        });

        it('should only save candidate in session', async function () {
          // given
          const candidate1 = createValidCandidateData(1);
          const candidate2 = createValidCandidateData(2);
          const sessions = [
            {
              sessionId: 1234,
              certificationCandidates: [candidate1, candidate2],
            },
          ];

          const cpfBirthInformationValidation1 = CpfBirthInformationValidation.success({ ...candidate1 });
          const cpfBirthInformationValidation2 = CpfBirthInformationValidation.success({ ...candidate2 });
          certificationCpfService.getBirthInformation.onCall(0).resolves(cpfBirthInformationValidation1);
          certificationCpfService.getBirthInformation.onCall(1).resolves(cpfBirthInformationValidation2);
          certificationCourseRepository.findCertificationCoursesBySessionId.resolves([]);

          const domainTransaction = Symbol('trx');
          sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda(domainTransaction));

          // when
          await createSessions({
            sessions,
            certificationCenterId,
            certificationCenterRepository,
            certificationCandidateRepository,
            certificationCourseRepository,
            sessionRepository,
          });

          // then

          expect(sessionRepository.save).to.not.have.been.called;
          expect(certificationCandidateRepository.deleteBySessionId).to.have.been.calledOnceWithExactly({
            sessionId: 1234,
            domainTransaction,
          });
          expect(certificationCandidateRepository.saveInSession).to.have.been.calledTwice;
        });
      });
    });

    context('when the session has candidates', function () {
      context('when certification center is not managing students', function () {
        context('when a candidate is registered more than once in the same session', function () {
          it('should throw', async function () {
            // given
            const validSessionData = createValidSessionData();
            const validCandidateData = createValidCandidateData(1);
            const validCandidateDataDuplicate = createValidCandidateData(1);
            const scoCertificationCenter = domainBuilder.buildCertificationCenter({
              id: certificationCenterId,
              type: 'SUP',
            });
            certificationCenterRepository.get.withArgs(certificationCenterId).resolves(scoCertificationCenter);

            const sessions = [
              {
                ...validSessionData,
                certificationCandidates: [{ ...validCandidateData }, { ...validCandidateDataDuplicate }],
              },
            ];
            sessionRepository.save.resolves({ id: 99 });
            const domainTransaction = Symbol('trx');
            sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda(domainTransaction));

            // when
            const error = await catchErr(createSessions)({
              sessions,
              certificationCenterId,
              certificationCandidateRepository,
              certificationCenterRepository,
              sessionRepository,
            });

            // then
            expect(error.message).to.equal('Une session contient au moins un élève en double.');
          });
        });

        context('when certification candidate has complementary certification', function () {
          it('should save certificationCandidate with complementary certification', async function () {
            // given
            const validSessionData = createValidSessionData();
            const validCandidateData = createValidCandidateData();
            const complementaryCertification = domainBuilder.buildComplementaryCertification({ label: 'Pix Toto' });
            validCandidateData.complementaryCertifications = ['Pix Toto'];
            const cpfBirthInformationValidation = CpfBirthInformationValidation.success({ ...validCandidateData });
            certificationCpfService.getBirthInformation.resolves(cpfBirthInformationValidation);
            const scoCertificationCenter = domainBuilder.buildCertificationCenter({
              id: certificationCenterId,
              type: 'SUP',
            });
            complementaryCertificationRepository.getByLabel
              .withArgs({ label: 'Pix Toto' })
              .resolves(complementaryCertification);
            certificationCenterRepository.get.withArgs(certificationCenterId).resolves(scoCertificationCenter);

            const sessions = [
              {
                ...validSessionData,
                certificationCandidates: [{ ...validCandidateData }],
              },
            ];
            sessionRepository.save.resolves({ id: 99 });
            const domainTransaction = Symbol('trx');
            sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda(domainTransaction));

            // when
            await createSessions({
              sessions,
              certificationCenterId,
              certificationCandidateRepository,
              certificationCenterRepository,
              complementaryCertificationRepository,
              sessionRepository,
            });

            // then
            expect(certificationCandidateRepository.saveInSession).to.have.been.calledOnceWith({
              sessionId: 99,
              certificationCandidate: new CertificationCandidate({
                ...validCandidateData,
                sessionId: 99,
                billingMode: 'FREE',
                complementaryCertifications: [complementaryCertification],
              }),
              domainTransaction,
            });
          });
        });

        it('should save certificationCandidate', async function () {
          // given
          const validSessionData = createValidSessionData();
          const validCandidateData = createValidCandidateData();
          const cpfBirthInformationValidation = CpfBirthInformationValidation.success({ ...validCandidateData });
          certificationCpfService.getBirthInformation.resolves(cpfBirthInformationValidation);
          const scoCertificationCenter = domainBuilder.buildCertificationCenter({
            id: certificationCenterId,
            type: 'SUP',
          });
          certificationCenterRepository.get.withArgs(certificationCenterId).resolves(scoCertificationCenter);

          const sessions = [
            {
              ...validSessionData,
              certificationCandidates: [{ ...validCandidateData }],
            },
          ];
          sessionRepository.save.resolves({ id: 99 });
          const domainTransaction = Symbol('trx');
          sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda(domainTransaction));

          // when
          await createSessions({
            sessions,
            certificationCenterId,
            certificationCandidateRepository,
            certificationCenterRepository,
            sessionRepository,
          });

          // then
          expect(certificationCandidateRepository.saveInSession).to.have.been.calledOnceWith({
            sessionId: 99,
            certificationCandidate: new CertificationCandidate({
              ...validCandidateData,
              sessionId: 99,
              billingMode: 'FREE',
            }),
            domainTransaction,
          });
        });
      });
      // eslint-disable-next-line mocha/no-setup-in-describe
      [{ firstName: '' }, { firstName: null }].forEach((wrongCandidateProperty) => {
        context(
          // eslint-disable-next-line mocha/no-setup-in-describe
          `when the candidate has at least one wrong information: ${JSON.stringify(wrongCandidateProperty)}`,
          function () {
            it('should throw a validation error', async function () {
              // given
              const validSessionData = createValidSessionData();
              const validCandidateData = createValidCandidateData();
              const sessions = [
                {
                  ...validSessionData,
                  certificationCandidates: [{ ...validCandidateData, ...wrongCandidateProperty }],
                },
              ];
              sessionRepository.save.resolves({ id: 99 });

              // when
              const error = await catchErr(createSessions)({
                sessions,
                certificationCenterId,
                certificationCenterRepository,
                sessionRepository,
              });

              // then
              expect(error).to.be.instanceOf(InvalidCertificationCandidate);
            });
          }
        );

        context('when the candidate has at least one wrong cpf birth information', function () {
          it('should throw a validation error', async function () {
            // given
            const cpfBirthInformationValidation = CpfBirthInformationValidation.failure(
              'Seul l\'un des champs "Code postal" ou "Code Insee" doit être renseigné.'
            );
            certificationCpfService.getBirthInformation.resolves(cpfBirthInformationValidation);
            const validSessionData = createValidSessionData();
            const validCandidateData = createValidCandidateData();

            const sessions = [
              {
                ...validSessionData,
                certificationCandidates: [
                  {
                    ...validCandidateData,
                    birthINSEECode: '134',
                    birthPostalCode: '3456',
                  },
                ],
              },
            ];
            sessionRepository.save.resolves({ id: 99 });

            // when
            const error = await catchErr(createSessions)({
              sessions,
              certificationCenterId,
              certificationCenterRepository,
              sessionRepository,
            });

            // then
            expect(error).to.be.instanceOf(InvalidCertificationCandidate);
          });
        });

        context('when the candidate has correct information', function () {
          it('should not throw an error', async function () {
            // given
            const validSessionData = createValidSessionData();
            const validCandidateData = createValidCandidateData();
            const sessions = [
              {
                ...validSessionData,
                certificationCandidates: [{ ...validCandidateData }],
              },
            ];
            sessionRepository.save.resolves({ id: 99 });

            // when
            // then
            expect(() =>
              createSessions({
                sessions,
                certificationCenterId,
                certificationCenterRepository,
                sessionRepository,
              })
            ).not.to.throw();
          });
        });
      });
    });
  });

  context('when at least one of the sessions is not valid', function () {
    it('should throw an error', async function () {
      // given
      const validSessionData = createValidSessionData();

      const sessions = [
        {
          ...validSessionData,
          address: null,
        },
      ];

      // when
      const err = await catchErr(createSessions)({
        sessions,
        certificationCenterId,
        certificationCenterRepository,
        sessionRepository,
      });

      // then
      expect(err).to.be.instanceOf(EntityValidationError);
    });
  });

  context('when there already is an existing session with the same data as a newly imported one', function () {
    it('should throw an error', async function () {
      // given
      const sessions = [{ ...createValidSessionData(), examiner: 'Paul' }];
      sessionRepository.isSessionExisting.withArgs({ ...sessions[0] }).resolves(true);

      const domainTransaction = Symbol('trx');
      sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda(domainTransaction));

      // when
      const err = await catchErr(createSessions)({
        sessions,
        certificationCenterId,
        certificationCenterRepository,
        sessionRepository,
      });

      // then
      expect(err).to.be.instanceOf(UnprocessableEntityError);
      expect(sessionRepository.save).not.to.have.been.called;
    });
  });
});

function createValidSessionData() {
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

function createValidCandidateData(candidateNumber = 2) {
  return {
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
    billingMode: 'Gratuite',
  };
}
