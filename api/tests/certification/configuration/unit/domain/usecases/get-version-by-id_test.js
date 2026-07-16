import sinon from 'sinon';

import { getVersionById } from '../../../../../../src/certification/configuration/domain/usecases/get-version-by-id.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Configuration | Unit | UseCase | get-version-by-id', function () {
  let versionDetailsRepository;

  beforeEach(function () {
    versionDetailsRepository = { getById: sinon.stub() };
  });

  context('when version is not found', function () {
    it('throws a NotFoundError', async function () {
      versionDetailsRepository.getById.withArgs(123).resolves(null);

      const err = await catchErr(getVersionById)({ id: 123, versionDetailsRepository });

      expect(err).to.be.instanceOf(NotFoundError);
      expect(err.message).to.equal('No certification version found for id: 123');
    });
  });

  context('when a version is found for given id', function () {
    it('returns a version details model', async function () {
      const expectedVersionDetails = Symbol('versionDetails');
      versionDetailsRepository.getById.withArgs(123).resolves(expectedVersionDetails);

      const actualVersionDetails = await getVersionById({ id: 123, versionDetailsRepository });

      expect(actualVersionDetails).to.deep.equal(expectedVersionDetails);
    });
  });
});
