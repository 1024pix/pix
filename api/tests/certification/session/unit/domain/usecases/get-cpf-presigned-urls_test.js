import { expect, sinon } from '../../../../../test-helper.js';
import { cpfExportsStorage } from '../../../../../../src/certification/session/infrastructure/storage/cpf-exports-storage.js';
import { getPreSignedUrls } from '../../../../../../src/certification/session/domain/usecases/get-cpf-presigned-urls.js';

describe('Unit | UseCase | get-cpf-presigned-urls ', function () {
  context('#getPreSignedUrls', function () {
    it('should pre sign files modified after a date', async function () {
      // given
      const date = new Date('2022-03-01');
      const filesModifiedBeforeDate = [
        { filename: 'firstFile', lastModifiedDate: new Date('2022-02-14') },
        { filename: 'secondFile', lastModifiedDate: new Date('2022-02-17') },
      ];
      const filesModifiedAfterDate = [
        { filename: 'thirdFile', lastModifiedDate: new Date('2022-03-01') },
        { filename: 'fourthFile', lastModifiedDate: new Date('2022-03-04') },
      ];
      const listFilesStub = sinon.stub(cpfExportsStorage, 'findAll');
      listFilesStub.resolves([...filesModifiedBeforeDate, ...filesModifiedAfterDate]);
      const preSignFilesStub = sinon.stub(cpfExportsStorage, 'preSignFiles');

      // when
      await getPreSignedUrls({ date, cpfExportsStorage });

      // then
      expect(listFilesStub).to.have.been.calledOnce;
      expect(preSignFilesStub).to.have.been.calledWithExactly({
        keys: ['thirdFile', 'fourthFile'],
        expiresIn: 3600,
      });
    });

    it('should not pre signed url of files modified before a date', async function () {
      // given
      const date = new Date('2022-03-01');
      const filesModifiedBeforeDate = [
        { filename: 'firstFile', lastModifiedDate: new Date('2022-02-14') },
        { filename: 'secondFile', lastModifiedDate: new Date('2022-02-17') },
      ];
      const filesModifiedAfterDate = [
        { filename: 'thirdFile', lastModifiedDate: new Date('2022-03-01') },
        { filename: 'fourthFile', lastModifiedDate: new Date('2022-03-04') },
      ];

      const listFilesStub = sinon.stub(cpfExportsStorage, 'findAll');
      listFilesStub.resolves([...filesModifiedBeforeDate, ...filesModifiedAfterDate]);
      const preSignFilesStub = sinon.stub(cpfExportsStorage, 'preSignFiles');
      preSignFilesStub.resolves(['preSignedThirdFile', 'preSignedFourthFile']);

      // when
      const result = await getPreSignedUrls({ date, cpfExportsStorage });

      // then
      expect(result).to.deep.equals(['preSignedThirdFile', 'preSignedFourthFile']);
    });
  });
});
