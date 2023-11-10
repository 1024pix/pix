import { expect, sinon } from '../../../../../test-helper.js';
import { integrateCpfProccessingReceipts } from '../../../../../../src/certification/session/domain/usecases/integrate-cpf-processing-receipts.js';
import { CpfReceipt } from '../../../../../../src/certification/session/domain/models/CpfReceipt.js';
import { CpfInfos } from '../../../../../../src/certification/session/domain/models/CpfInfos.js';
import { CpfImportStatus } from '../../../../../../src/certification/session/domain/models/CpfImportStatus.js';

describe('Unit | UseCase | integrate-cpf-processing-receipts ', function () {
  context('#integrateCpfProccessingReceipts', function () {
    let cpfReceiptsStorage;
    let cpfCertificationResultRepository;
    beforeEach(function () {
      cpfReceiptsStorage = {
        findAll: sinon.stub(),
        getCpfInfosByReceipt: sinon.stub(),
      };
      cpfCertificationResultRepository = {
        updateCpfInfos: sinon.stub(),
      };
    });

    it('should fetch the CPF processing receipts', async function () {
      // given
      const receipt = new CpfReceipt({ filename: 'oneReceiptssippi' });
      const cpfInfos = new CpfInfos({ certificationCourseId: 1, filename: 'a', importStatus: CpfImportStatus.SUCCESS });
      cpfReceiptsStorage.findAll.resolves([receipt]);
      cpfReceiptsStorage.getCpfInfosByReceipt.resolves([cpfInfos]);
      // when
      await integrateCpfProccessingReceipts({ cpfReceiptsStorage, cpfCertificationResultRepository });

      // then
      expect(cpfReceiptsStorage.findAll).to.have.been.calledOnce;
      expect(cpfReceiptsStorage.getCpfInfosByReceipt).to.have.been.calledOnceWithExactly({ cpfReceipt: receipt });
      expect(cpfCertificationResultRepository.updateCpfInfos).to.have.been.calledOnceWithExactly({ cpfInfos });
    });
  });
});
