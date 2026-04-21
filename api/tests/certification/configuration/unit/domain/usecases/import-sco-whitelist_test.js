import sinon from 'sinon';

import { InvalidScoWhitelistError } from '../../../../../../src/certification/configuration/domain/errors.js';
import { importScoWhitelist } from '../../../../../../src/certification/configuration/domain/usecases/import-sco-whitelist.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

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
    centerRepository.addToWhitelistByExternalIds.resolves([12]);

    // when
    await importScoWhitelist({
      externalIds: [12],
      centerRepository,
    });

    // then
    expect(centerRepository.resetWhitelist).to.have.been.calledOnce;
    expect(centerRepository.addToWhitelistByExternalIds).to.have.been.calledOnceWithExactly({ externalIds: [12] });
  });

  describe('when there is at least one external ID not found in input data', function () {
    it('should throw an error', async function () {
      // given
      const externalIds = [11, 12];
      centerRepository.resetWhitelist.resolves();
      centerRepository.addToWhitelistByExternalIds.resolves([11]);
      const csvLineNumbersWithError = [3];

      // when
      const error = await catchErr((externalIds) =>
        importScoWhitelist({
          externalIds,
          centerRepository,
        }),
      )(externalIds);

      // then
      expect(error).to.be.instanceOf(InvalidScoWhitelistError);
      expect(error.message).to.equal('La liste blanche contient des données invalides.');
      expect(error.meta.lineNumbersWithError).to.deep.equal(csvLineNumbersWithError);
    });
  });

  describe('when there are duplicated external id on error', function () {
    it('should return specific lines on error', async function () {
      // given
      const externalIds = [11, 77, 12, 11, 78, 12];
      centerRepository.resetWhitelist.resolves();
      centerRepository.addToWhitelistByExternalIds.resolves([77]);

      const csvLineNumbersWithError = [2, 4, 5, 6, 7];

      // when
      const error = await catchErr((externalIds) =>
        importScoWhitelist({
          externalIds,
          centerRepository,
        }),
      )(externalIds);

      // then
      expect(error.meta.lineNumbersWithError).to.deep.equal(csvLineNumbersWithError);
    });
  });
});
