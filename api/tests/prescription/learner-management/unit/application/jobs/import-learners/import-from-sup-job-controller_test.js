import sinon from 'sinon';

import { ImportFromSupJobController } from '../../../../../../../src/prescription/learner-management/application/jobs/import-learners/import-from-sup-job-controller.js';
import { SUP_IMPORT_TYPES } from '../../../../../../../src/prescription/learner-management/domain/constants.js';
import { usecases } from '../../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { config } from '../../../../../../../src/shared/config.js';
import { DomainTransaction } from '../../../../../../../src/shared/domain/DomainTransaction.js';
import { OrganizationLearnersCouldNotBeSavedError } from '../../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../../test-helper.js';
import { catchErr } from '../../../../../../tooling/test-utils/error.js';

describe('Unit | Prescription | Application | Jobs | ImportFromSupJobController', function () {
  describe('#isJobEnabled', function () {
    it('return true when job is enabled', function () {
      //given
      sinon.stub(config.pgBoss, 'importFileJobEnabled').value(true);

      // when
      const handler = new ImportFromSupJobController();

      // then
      expect(handler.isJobEnabled).to.be.true;
    });

    it('return false when job is disabled', function () {
      //given
      sinon.stub(config.pgBoss, 'importFileJobEnabled').value(false);

      //when
      const handler = new ImportFromSupJobController();

      //then
      expect(handler.isJobEnabled).to.be.false;
    });
  });

  describe('#handle', function () {
    beforeEach(function () {
      sinon.stub(DomainTransaction, 'execute');
      DomainTransaction.execute.callsFake((fn) => {
        return fn({});
      });
    });

    it('should not throw when error is from domain', async function () {
      const error = new OrganizationLearnersCouldNotBeSavedError();
      sinon.stub(usecases, 'importLearnersFromSupFile').rejects(error);

      // given
      const errorStub = sinon.stub();
      const handler = new ImportFromSupJobController({ logger: { error: errorStub } });
      const data = { organizationImportId: Symbol('organizationImportId'), locale: 'en', type: SUP_IMPORT_TYPES.ADDITIONAL_STUDENT };

      // when & then
      await expect(handler.handle({ data })).fulfilled;
      expect(errorStub).to.have.been.calledWithExactly(error);
    });

    it('should throw when error is not from domain', async function () {
      const error = new Error();
      sinon.stub(usecases, 'importLearnersFromSupFile').rejects(error);

      // given
      const errorStub = sinon.stub();
      const handler = new ImportFromSupJobController({ logger: { error: errorStub } });
      const data = { organizationImportId: Symbol('organizationImportId'), locale: 'en', type: SUP_IMPORT_TYPES.ADDITIONAL_STUDENT };

      // when
      const result = await catchErr(handler.handle)({ data });

      // then
      expect(result).to.equal(error);
      expect(errorStub).not.called;
    });
  });
});
