import { expect, sinon } from '../../../../../test-helper.js';
import { integrateCpfProccessingReceipts } from '../../../../../../src/certification/session/domain/usecases/integrate-cpf-processing-receipts.js';

describe('Unit | UseCase | integrate-cpf-processing-receipts ', function () {
  context('#integrateCpfProccessingReceipts', function () {
    let cpfReceiptsStorage;
    beforeEach(function () {
      cpfReceiptsStorage = { findAll: sinon.stub() };
    });

    it('should fetch the CPF processing receipts', async function () {
      // given

      // when
      await integrateCpfProccessingReceipts({ cpfReceiptsStorage });

      // then
      expect(cpfReceiptsStorage.findAll).to.have.been.calledOnce;
    });
  });
});
