import sinon from 'sinon';

import { getModuleMetadataListByIds } from '../../../../../src/devcomp/domain/usecases/get-module-metadata-list-by-ids.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | UseCases | get-module-metadata-list-by-ids', function () {
  it('should return a list of ModuleMetadata', async function () {
    // given
    const moduleMetadataList = Symbol('moduleMetadataList');
    const firstId = Symbol('firstId');
    const secondId = Symbol('secondId');
    const ids = [firstId, secondId];
    const moduleMetadataRepository = {
      getAllByIds: sinon.stub(),
    };

    moduleMetadataRepository.getAllByIds.withArgs({ ids }).resolves(moduleMetadataList);

    // when
    const result = await getModuleMetadataListByIds({ ids, moduleMetadataRepository });

    // then
    expect(result).to.deep.equal(moduleMetadataList);
    expect(moduleMetadataRepository.getAllByIds).to.have.been.calledWithExactly({ ids });
  });

  context('when a module id does not exist', function () {
    it('should throw the NotFoundError thrown by repository', async function () {
      // given
      const ids = ['notFoundModuleId1', 'notFoundModuleId2'];
      const moduleMetadataRepository = {
        getAllByIds: sinon.stub(),
      };
      moduleMetadataRepository.getAllByIds.withArgs({ ids }).throws(new NotFoundError());

      // when
      const error = await catchErr(getModuleMetadataListByIds)({ ids, moduleMetadataRepository });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
