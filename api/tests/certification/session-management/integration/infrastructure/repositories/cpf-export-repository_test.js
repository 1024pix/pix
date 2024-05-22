import { CpfImportStatus } from '../../../../../../src/certification/session-management/domain/models/CpfImportStatus.js';
import * as cpfExportRepository from '../../../../../../src/certification/session-management/infrastructure/repositories/cpf-export-repository.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Repository | Cpfexport', function () {
  describe('#findFileNamesByStatus', function () {
    context('when given a status', function () {
      it('should return a cpfFileNames array', async function () {
        // given
        databaseBuilder.factory.buildCertificationCoursesCpfInfos({
          filename: 'toto.xml',
          importStatus: CpfImportStatus.READY_TO_SEND,
        });
        databaseBuilder.factory.buildCertificationCoursesCpfInfos({
          filename: 'toto.xml',
          importStatus: CpfImportStatus.READY_TO_SEND,
        });
        databaseBuilder.factory.buildCertificationCoursesCpfInfos({
          filename: 'tata.xml',
          importStatus: CpfImportStatus.PENDING,
        });

        await databaseBuilder.commit();

        // when
        const result = await cpfExportRepository.findFileNamesByStatus({
          cpfImportStatus: CpfImportStatus.READY_TO_SEND,
        });

        // then
        expect(result).to.deep.equal(['toto.xml']);
      });
    });
  });
});
