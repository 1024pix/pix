import sinon from 'sinon';

import { OrganizationLearnerImportFormat } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationLearnerImportFormat.js';
import { OrganizationToJoin } from '../../../../../../src/prescription/organization-learner/domain/models/OrganizationToJoin.js';
import * as organizationToJoinRepository from '../../../../../../src/prescription/organization-learner/infrastructure/repositories/organization-to-join-repository.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Repository | organization-to-join-repository', function () {
  it('returns organization to join', async function () {
    const organizationLearnerImportFormat = new OrganizationLearnerImportFormat({
      id: 123,
      name: 'MY_TEST_EXPORT',
      fileType: 'csv',
      config: {
        acceptedEncoding: ['utf-8'],
        unicityColumns: ['firstName'],
        validationRules: {
          formats: [{ name: 'firstName', type: 'string' }],
        },
        headers: [
          {
            name: 'Prénom apprenant',
            config: {
              property: 'firstName',
              validate: {
                type: 'string',
                required: true,
              },
              reconcile: {
                name: 'COMMON_FIRSTNAME',
                fieldId: 'reconcileField2',
                position: 2,
              },
            },
            required: true,
          },
        ],
      },
      createdAt: new Date('2025-01-01'),
      createdBy: 12,
    });

    const organizationId = 1;
    const organizationApi = {
      getOrganization: sinon.stub(),
    };

    organizationApi.getOrganization.withArgs(organizationId).resolves(
      domainBuilder.organizationalEntities.buildOrganizationDto({
        id: 1,
        name: 'My orga',
        type: 'PRO',
        logoUrl: 'http://pix.fr/logo.png',
        identityProviderForCampaigns: 'GAR',
        isManagingStudents: false,
      }),
    );

    const organizationLearnerImportFormatRepository = {
      get: sinon.stub(),
    };
    organizationLearnerImportFormatRepository.get.withArgs(organizationId).resolves(organizationLearnerImportFormat);

    const organizationToJoin = await organizationToJoinRepository.get({
      id: 1,
      organizationApi,
      organizationLearnerImportFormatRepository,
    });

    expect(organizationToJoin).to.deep.equal(
      new OrganizationToJoin({
        id: 1,
        name: 'My orga',
        type: 'PRO',
        logoUrl: 'http://pix.fr/logo.png',
        identityProvider: 'GAR',
        organizationLearnerImportFormat,
        isManagingStudents: false,
      }),
    );
    expect(organizationToJoin.hasReconciliationFields).to.be.true;
    expect(organizationToJoin.isReconciliationRequired).to.be.true;
  });
});
