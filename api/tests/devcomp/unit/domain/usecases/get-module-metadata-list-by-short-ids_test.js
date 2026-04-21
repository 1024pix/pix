import sinon from 'sinon';

import { getModuleMetadataListByShortIds } from '../../../../../src/devcomp/domain/usecases/get-module-metadata-list-by-short-ids.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';

import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | UseCases | get-module-metadata-list-by-short-ids', function () {
  it('should return a list of ModuleMetadata', async function () {
    // given
    const moduleMetadataList = Symbol('moduleMetadataList');
    const firstShortId = Symbol('firstShortId');
    const secondShortId = Symbol('secondShortId');
    const shortIds = [firstShortId, secondShortId];
    const moduleMetadataRepository = {
      getAllByShortIds: sinon.stub(),
    };

    moduleMetadataRepository.getAllByShortIds.withArgs({ shortIds }).resolves(moduleMetadataList);

    // when
    const moduleMetadataListResult = await getModuleMetadataListByShortIds({ shortIds, moduleMetadataRepository });

    // then
    expect(moduleMetadataListResult).to.equal(moduleMetadataList);
    expect(moduleMetadataRepository.getAllByShortIds).to.have.been.calledWithExactly({ shortIds });
  });

  context('when a module short id does not exist', function () {
    it('should throw the NotFoundError thrown by repository', async function () {
      // given
      const shortIds = ['notFoundModuleId1', 'notFoundModuleId2'];
      const moduleMetadataRepository = {
        getAllByShortIds: sinon.stub(),
      };
      moduleMetadataRepository.getAllByShortIds.withArgs({ shortIds }).throws(new NotFoundError());

      // when
      const error = await catchErr(getModuleMetadataListByShortIds)({ shortIds, moduleMetadataRepository });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
