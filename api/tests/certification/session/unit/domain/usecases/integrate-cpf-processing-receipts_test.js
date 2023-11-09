import { expect, sinon } from '../../../../../test-helper.js';
import { integrateCpfProccessingReceipts } from '../../../../../../src/certification/session/domain/usecases/integrate-cpf-processing-receipts.js';
import { CpfReceipt } from '../../../../../../src/certification/session/domain/models/CpfReceipt.js';

describe('Unit | UseCase | integrate-cpf-processing-receipts ', function () {
  context('#integrateCpfProccessingReceipts', function () {
    let cpfReceiptsStorage;
    beforeEach(function () {
      cpfReceiptsStorage = {
        findAll: sinon.stub(),
        getCpfInfosByReceipt: sinon.stub(),
      };
    });

    it('should fetch the CPF processing receipts', async function () {
      // given
      const receipt = new CpfReceipt({ filename: 'oneReceiptssippi' });
      cpfReceiptsStorage.findAll.resolves([receipt]);
      cpfReceiptsStorage.getCpfInfosByReceipt.resolves(sinon.stub());
      // when
      await integrateCpfProccessingReceipts({ cpfReceiptsStorage });

      // then
      expect(cpfReceiptsStorage.findAll).to.have.been.calledOnce;
      expect(cpfReceiptsStorage.getCpfInfosByReceipt).to.have.been.calledOnceWithExactly({ cpfReceipt: receipt });
    });
  });
});
