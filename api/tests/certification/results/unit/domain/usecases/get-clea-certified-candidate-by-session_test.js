import { getCleaCertifiedCandidateBySession } from '../../../../../../src/certification/results/domain/usecases/get-clea-certified-candidate-by-session.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Results | Unit | Domain | UseCases | getCleaCertifiedCandidateBySession', function () {
  let cleaCertifiedCandidateRepository;
  let sessionEnrolmentRepository;

  beforeEach(function () {
    sessionEnrolmentRepository = { get: sinon.stub() };
    cleaCertifiedCandidateRepository = { getBySessionId: sinon.stub() };
  });

  it('should return session', async function () {
    // given
    const expectedSession = domainBuilder.certification.sessionManagement.buildSession();
    sessionEnrolmentRepository.get.withArgs({ id: 123 }).resolves(expectedSession);
    cleaCertifiedCandidateRepository.getBySessionId.withArgs(123).resolves([]);

    // when
    const { session } = await getCleaCertifiedCandidateBySession({
      sessionId: 123,
      sessionEnrolmentRepository,
      cleaCertifiedCandidateRepository,
    });

    // then
    expect(session).to.deepEqualInstance(expectedSession);
  });

  describe('when the session is publish', function () {
    describe('when there is clea certified candidates in the session', function () {
      it('should return data of certified candidates', async function () {
        // given
        cleaCertifiedCandidateRepository.getBySessionId.withArgs(1).resolves([
          domainBuilder.buildCleaCertifiedCandidate({
            firstName: 'Jean-Mi',
            lastName: 'Mi',
            resultRecipientEmail: 'jean-mi@coco.fr',
            birthdate: '2001-02-07',
            birthplace: 'Paris',
            birthPostalCode: '75015',
            birthINSEECode: '75115',
            birthCountry: 'FRANCE',
            sex: 'M',
            createdAt: new Date('2020-02-01'),
          }),
          domainBuilder.buildCleaCertifiedCandidate({
            firstName: 'Léane',
            lastName: 'Bern',
            resultRecipientEmail: 'princesse-lele@gg.fr',
            birthdate: '2001-05-10',
            birthplace: 'Paris',
            birthPostalCode: '75019',
            birthINSEECode: '75119',
            birthCountry: 'FRANCE',
            sex: 'F',
            createdAt: new Date('2020-02-01'),
          }),
        ]);

        // when
        const { cleaCertifiedCandidateData } = await getCleaCertifiedCandidateBySession({
          sessionId: 1,
          cleaCertifiedCandidateRepository,
          sessionEnrolmentRepository,
        });

        // then
        expect(cleaCertifiedCandidateData).to.deepEqualArray([
          domainBuilder.buildCleaCertifiedCandidate({
            firstName: 'Jean-Mi',
            lastName: 'Mi',
            resultRecipientEmail: 'jean-mi@coco.fr',
            birthdate: '2001-02-07',
            birthplace: 'Paris',
            birthPostalCode: '75015',
            birthINSEECode: '75115',
            birthCountry: 'FRANCE',
            sex: 'M',
            createdAt: new Date('2020-02-01'),
          }),
          domainBuilder.buildCleaCertifiedCandidate({
            firstName: 'Léane',
            lastName: 'Bern',
            resultRecipientEmail: 'princesse-lele@gg.fr',
            birthdate: '2001-05-10',
            birthplace: 'Paris',
            birthPostalCode: '75019',
            birthINSEECode: '75119',
            birthCountry: 'FRANCE',
            sex: 'F',
            createdAt: new Date('2020-02-01'),
          }),
        ]);
      });
    });
  });
});
