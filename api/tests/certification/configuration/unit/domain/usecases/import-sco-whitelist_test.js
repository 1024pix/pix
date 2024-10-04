import { DomainTransaction } from '../../../../../../lib/infrastructure/DomainTransaction.js';
import { importScoWhitelist } from '../../../../../../src/certification/configuration/domain/usecases/import-sco-whitelist.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Configuration | Unit | UseCase | import-sco-whitelist', function () {
  let centerRepository;

  beforeEach(function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback();
    });

    centerRepository = {
      addToWhitelistByExternalIds: sinon.stub(),
      resetWhitelist: sinon.stub(),
    };
  });

  it('should whitelist a center', async function () {
    // given
    centerRepository.resetWhitelist.resolves();
    centerRepository.addToWhitelistByExternalIds.resolves();

    // when
    await importScoWhitelist({
      externalIds: [12],
      centerRepository,
    });

    // then
    expect(centerRepository.resetWhitelist).to.have.been.calledOnce;
    expect(centerRepository.addToWhitelistByExternalIds).to.have.been.calledOnceWithExactly({ externalIds: [12] });
  });
});
