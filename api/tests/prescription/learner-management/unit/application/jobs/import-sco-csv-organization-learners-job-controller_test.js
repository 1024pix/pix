import sinon from 'sinon';

import { ImportScoCsvOrganizationLearnersJobController } from '../../../../../../src/prescription/learner-management/application/jobs/import-sco-csv-organization-learners-job-controller.js';
import { usecases } from '../../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { config } from '../../../../../../src/shared/config.js';
import { OrganizationLearnersCouldNotBeSavedError } from '../../../../../../src/shared/domain/errors.js';
import { getI18n } from '../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Prescription | Application | Jobs | importSupOrganizationLearnersJobController', function () {
  describe('#isJobEnabled', function () {
    it('return true when job is enabled', function () {
      //given
      sinon.stub(config.pgBoss, 'importFileJobEnabled').value(true);

      // when
      const handler = new ImportScoCsvOrganizationLearnersJobController();

      // then
      expect(handler.isJobEnabled).to.be.true;
    });

    it('return false when job is disabled', function () {
      //given
      sinon.stub(config.pgBoss, 'importFileJobEnabled').value(false);

      //when
      const handler = new ImportScoCsvOrganizationLearnersJobController();

      //then
      expect(handler.isJobEnabled).to.be.false;
    });
  });

  describe('#handle', function () {
    it('should call usecase', async function () {
      sinon.stub(usecases, 'importOrganizationLearnersFromSIECLECSVFormat');

      // given
      const handler = new ImportScoCsvOrganizationLearnersJobController();
      const data = { organizationImportId: Symbol('organizationImportId'), locale: 'en', type: 'REPLACE_STUDENT' };

      // when
      await handler.handle({ data });

      // then
      expect(usecases.importOrganizationLearnersFromSIECLECSVFormat).to.have.been.calledOnce;
      expect(usecases.importOrganizationLearnersFromSIECLECSVFormat).to.have.been.calledWithExactly({
        organizationImportId: data.organizationImportId,
        i18n: getI18n(data.locale),
      });
    });

    it('should not throw when error is from domain', async function () {
      const error = new OrganizationLearnersCouldNotBeSavedError();
      sinon.stub(usecases, 'importOrganizationLearnersFromSIECLECSVFormat').rejects(error);

      // given
      const errorStub = sinon.stub();
      const handler = new ImportScoCsvOrganizationLearnersJobController({ logger: { error: errorStub } });
      const data = { organizationImportId: Symbol('organizationImportId'), locale: 'en', type: 'REPLACE_STUDENT' };

      // when & then
      await handler.handle({ data });

      expect(errorStub).to.have.been.calledWithExactly(error);
    });

    it('should throw when error is not from domain', async function () {
      const error = new Error();
      sinon.stub(usecases, 'importOrganizationLearnersFromSIECLECSVFormat').rejects(error);

      // given
      const handler = new ImportScoCsvOrganizationLearnersJobController();
      const data = { organizationImportId: Symbol('organizationImportId'), locale: 'en', type: 'REPLACE_STUDENT' };

      // when
      const result = await catchErr(handler.handle)({ data });

      // then
      expect(result).to.equal(error);
    });
  });
});
