import { findPaginatedFilteredParticipants } from '../../../../../../src/prescription/organization-learner/domain/usecases/find-paginated-filtered-participants.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCases | get-paginated-participants-for-an-organization', function () {
  let organizationId,
    page,
    sort,
    filters,
    columnsToDisplay,
    extraColumns,
    organizationLearnerImportFormatRepository,
    organizationParticipantRepository,
    organizationFeaturesAPI;

  beforeEach(function () {
    organizationId = Symbol('organizationId');
    page = Symbol('page');
    sort = Symbol('sort');
    filters = Symbol('filter');
    columnsToDisplay = Symbol('columnsToDisplay');
    extraColumns = Symbol('extraColumns');

    organizationLearnerImportFormatRepository = {
      get: sinon.stub(),
    };

    organizationParticipantRepository = {
      findPaginatedFilteredParticipants: sinon.stub(),
      findPaginatedFilteredImportedParticipants: sinon.stub(),
    };

    organizationFeaturesAPI = {
      getAllFeaturesFromOrganization: sinon.stub(),
    };
  });

  it('should call findPaginatedFilteredParticipants when import not enabled', async function () {
    // given
    organizationFeaturesAPI.getAllFeaturesFromOrganization.resolves({ hasLearnersImportFeature: false });
    // when
    await findPaginatedFilteredParticipants({
      organizationId,
      filters,
      page,
      sort,
      organizationParticipantRepository,
      organizationFeaturesAPI,
    });

    // then
    expect(organizationParticipantRepository.findPaginatedFilteredParticipants).to.have.been.calledWithExactly({
      organizationId,
      page,
      sort,
      filters,
    });
  });

  it('should call findPaginatedFilteredImportedParticipants when import is enabled', async function () {
    // given
    organizationFeaturesAPI.getAllFeaturesFromOrganization
      .withArgs(organizationId)
      .resolves({ hasLearnersImportFeature: true });

    organizationLearnerImportFormatRepository.get.withArgs(organizationId).resolves({ columnsToDisplay, extraColumns });
    organizationParticipantRepository.findPaginatedFilteredImportedParticipants.resolves({
      organizationParticipants: [],
      meta: {},
    });
    // when
    const result = await findPaginatedFilteredParticipants({
      organizationId,
      filters,
      page,
      sort,
      organizationParticipantRepository,
      organizationLearnerImportFormatRepository,
      organizationFeaturesAPI,
    });

    // then
    expect(organizationParticipantRepository.findPaginatedFilteredImportedParticipants).to.have.been.calledWithExactly({
      organizationId,
      extraColumns,
      page,
      sort,
      filters,
    });
    expect(result.meta.headingCustomColumns).to.be.equals(columnsToDisplay);
  });
});
