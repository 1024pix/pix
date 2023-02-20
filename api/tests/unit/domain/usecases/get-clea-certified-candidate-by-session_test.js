import { sinon, domainBuilder, expect } from '../../../test-helper';
import getCleaCertifiedCandidateBySession from '../../../../lib/domain/usecases/get-clea-certified-candidate-by-session';

describe('Unit | UseCase | getCleaCertifiedCandidateBySession', function () {
  let cleaCertifiedCandidateRepository;
  let sessionRepository;

  beforeEach(function () {
    sessionRepository = { get: sinon.stub() };
    cleaCertifiedCandidateRepository = { getBySessionId: sinon.stub() };
  });

  it('should return session', async function () {
    // given
    const expectedSession = domainBuilder.buildSession();
    sessionRepository.get.withArgs(123).resolves(expectedSession);
    cleaCertifiedCandidateRepository.getBySessionId.withArgs(123).resolves([]);

    // when
    const { session } = await getCleaCertifiedCandidateBySession({
      sessionId: 123,
      sessionRepository,
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
          sessionRepository,
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
