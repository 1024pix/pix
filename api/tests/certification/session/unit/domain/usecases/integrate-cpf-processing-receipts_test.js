import { logger } from '../../../../../../src/shared/infrastructure/utils/logger.js';
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
        deleteReceipt: sinon.stub(),
      };
      cpfCertificationResultRepository = {
        updateCpfInfos: sinon.stub(),
      };
    });

    it('should integrate the CPF processing receipts', async function () {
      // given
      const receipt = new CpfReceipt({ filename: 'oneReceiptssippi' });
      const cpfInfos = new CpfInfos({ certificationCourseId: 1, filename: 'a', importStatus: CpfImportStatus.SUCCESS });
      cpfReceiptsStorage.findAll.resolves([receipt]);
      cpfReceiptsStorage.getCpfInfosByReceipt.resolves([cpfInfos]);
      cpfCertificationResultRepository.updateCpfInfos.resolves();
      cpfReceiptsStorage.deleteReceipt.resolves();
      // when
      await integrateCpfProccessingReceipts({ cpfReceiptsStorage, cpfCertificationResultRepository });

      // then
      expect(cpfReceiptsStorage.findAll).to.have.been.calledOnce;
      expect(cpfReceiptsStorage.getCpfInfosByReceipt).to.have.been.calledOnceWithExactly({ cpfReceipt: receipt });
      expect(cpfCertificationResultRepository.updateCpfInfos).to.have.been.calledOnceWithExactly({ cpfInfos });
      expect(cpfReceiptsStorage.deleteReceipt).to.have.been.calledOnceWithExactly({ cpfReceipt: receipt });
    });

    context('when one of the receipt is in error', function () {
      it('should not block other receipts integration', async function () {
        // given
        const receiptOne = new CpfReceipt({ filename: 'oneReceiptssippi' });
        const receiptTwo = new CpfReceipt({ filename: 'twoReceiptssippi' });
        const receiptThree = new CpfReceipt({ filename: 'threeReceiptssippi' });
        const cpfInfos = new CpfInfos({
          certificationCourseId: 1,
          filename: 'a',
          importStatus: CpfImportStatus.SUCCESS,
        });
        cpfReceiptsStorage.findAll.resolves([receiptOne, receiptTwo, receiptThree]);
        // First CPF recepti failed when fetching infos
        cpfReceiptsStorage.getCpfInfosByReceipt.onCall(0).rejects();
        cpfReceiptsStorage.getCpfInfosByReceipt.onCall(1).resolves([cpfInfos]);
        cpfReceiptsStorage.getCpfInfosByReceipt.onCall(2).resolves([cpfInfos]);
        // Second CPF failed when deleting object
        cpfReceiptsStorage.deleteReceipt.onCall(0).resolves();
        cpfReceiptsStorage.deleteReceipt.onCall(1).rejects();
        cpfReceiptsStorage.deleteReceipt.onCall(2).resolves();

        cpfCertificationResultRepository.updateCpfInfos.resolves();
        const logError = sinon.stub(logger, 'error');

        // when
        await integrateCpfProccessingReceipts({ cpfReceiptsStorage, cpfCertificationResultRepository });

        // then
        expect(cpfReceiptsStorage.findAll).to.have.been.calledOnce;
        expect(cpfReceiptsStorage.getCpfInfosByReceipt).to.have.been.calledThrice;
        expect(cpfCertificationResultRepository.updateCpfInfos).to.have.been.calledTwice;
        expect(logError).to.have.been.calledTwice;
      });
    });
  });
});
