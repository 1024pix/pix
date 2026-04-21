import sinon from 'sinon';

import { OrganizationBatchUpdateError } from '../../../../../src/organizational-entities/domain/errors.js';
import { updateOrganizationsInBatch } from '../../../../../src/organizational-entities/domain/usecases/update-organizations-in-batch.usecase.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';
import { createTempFile, removeTempFile } from '../../../../tooling/test-utils/file.js';

describe('Unit | Organizational Entities | Domain | UseCase | update-organizations-in-batch', function () {
  let filePath,
    organizationForAdminRepository,
    administrationTeamRepository,
    countryRepository,
    organizationLearnerTypeRepository;

  const csvHeaders =
    'Organization ID;Organization Name;Organization External ID;Organization Identity Provider Code;Organization Documentation URL;Organization Province Code;DPO Last Name;DPO First Name;DPO E-mail;Administration Team ID;Country Code';

  beforeEach(function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback();
    });

    organizationForAdminRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
      exist: sinon.stub(),
    };

    organizationForAdminRepository.findExistingIds = sinon.stub().resolves([]);

    countryRepository = {
      getByCode: sinon.stub().resolves(domainBuilder.buildCountry({ code: '99100' })),
      findExistingCodes: sinon.stub().resolves([]),
    };

    administrationTeamRepository = {
      getById: sinon.stub().resolves(domainBuilder.buildAdministrationTeam({ id: 1234 })),
    };

    administrationTeamRepository.findExistingIds = sinon.stub().resolves([]);

    organizationLearnerTypeRepository = {
      getById: sinon.stub().resolves(domainBuilder.acquisition.buildOrganizationLearnerType({ id: 12 })),
      findExistingIds: sinon.stub().resolves([]),
    };
  });

  afterEach(async function () {
    await removeTempFile(filePath);
  });

  context('when parsing a CSV file without organization', function () {
    it('does nothing', async function () {
      // given
      const fileData = `${csvHeaders}`;
      filePath = await createTempFile('test.csv', fileData);

      // when
      await updateOrganizationsInBatch({
        filePath,
        organizationForAdminRepository,
        administrationTeamRepository,
        organizationLearnerTypeRepository,
      });

      // then
      expect(organizationForAdminRepository.get).to.not.have.been.called;
      expect(organizationForAdminRepository.update).to.not.have.been.called;
    });
  });

  context('when CSV files contains some errors in the list of organizations to update', function () {
    context('when an unexpected error happens', function () {
      it('throws an OrganizationBatchUpdateError', async function () {
        // given
        const fileData = `${csvHeaders}
        1;;12;OIDC_EXAMPLE_NET;https://doc.url;;Troisjour;Adam;;1234;
        `;
        filePath = await createTempFile('test.csv', fileData);
        organizationForAdminRepository.exist.resolves(true);
        organizationForAdminRepository.get.onCall(0).resolves(domainBuilder.buildOrganizationForAdmin({ id: 1 }));
        organizationForAdminRepository.update.rejects('Unexpected error');
        organizationForAdminRepository.findExistingIds.resolves(['1']);
        administrationTeamRepository.findExistingIds.resolves(['1234']);
        countryRepository.findExistingCodes.resolves(['99100']);
        organizationLearnerTypeRepository.findExistingIds.resolves([]);

        // when
        const error = await catchErr(updateOrganizationsInBatch)({
          filePath,
          organizationForAdminRepository,
          administrationTeamRepository,
          countryRepository,
          organizationLearnerTypeRepository,
        });

        // then
        expect(error).to.be.instanceOf(OrganizationBatchUpdateError);
        expect(error.message).to.equal('Organization batch update failed');
        expect(error.meta.organizationId).to.equal('1');
      });
    });
  });
});
