import { getCertificationsResultsForLivretScolaire } from '../../../../../../src/certification/results/domain/usecases/get-certifications-results-for-livret-scolaire.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Results | Unit | Domain | UseCases | get-certifications-results-for-livret-scolaire', function () {
  it('should call its repositories', async function () {
    // given
    const uai = Symbol('uai');
    const certificationLivretScolaireRepositoryStub = {
      getCertificatesByOrganizationUAI: sinon.stub(),
    };
    certificationLivretScolaireRepositoryStub.getCertificatesByOrganizationUAI.withArgs(uai).resolves();
    const competenceTreeRepositoryStub = {
      get: sinon.stub(),
    };
    competenceTreeRepositoryStub.get.resolves({
      areas: [],
    });

    // when
    await getCertificationsResultsForLivretScolaire({
      uai,
      certificationLivretScolaireRepository: certificationLivretScolaireRepositoryStub,
      competenceTreeRepository: competenceTreeRepositoryStub,
    });

    // then
    expect(certificationLivretScolaireRepositoryStub.getCertificatesByOrganizationUAI).to.have.been.calledOnceWith(uai);
    expect(competenceTreeRepositoryStub.get).to.have.been.calledOnce;
  });
});
