import { OrganizationParticipant } from '../../../../../../src/prescription/organization-learner/domain/read-models/OrganizationParticipant.js';
import { findPaginatedFilteredParticipants } from '../../../../../../src/prescription/organization-learner/domain/usecases/find-paginated-filtered-participants.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCases | find-paginated-participants', function () {
  let organizationId,
    page,
    sort,
    filters,
    extraFilters,
    columnsToDisplay,
    filtersToDisplay,
    extraColumns,
    organizationLearnerImportFormatRepository,
    organizationParticipantRepository,
    organizationFeaturesAPI,
    organizationLearnerFeatureRepository;

  beforeEach(function () {
    organizationId = Symbol('organizationId');
    page = Symbol('page');
    sort = Symbol('sort');
    filters = Symbol('filter');
    extraFilters = Symbol('extraFilter');
    columnsToDisplay = Symbol('columnsToDisplay');
    filtersToDisplay = Symbol('filtersToDisplay');
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

    organizationLearnerFeatureRepository = {
      getLearnersByFeature: sinon.stub(),
    };
  });

  it('should call findPaginatedFilteredParticipants when import not enabled', async function () {
    // given
    organizationFeaturesAPI.getAllFeaturesFromOrganization.resolves({ hasLearnersImportFeature: false });
    // when
    await findPaginatedFilteredParticipants({
      organizationId,
      filters,
      extraFilters,
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

    organizationLearnerImportFormatRepository.get
      .withArgs(organizationId)
      .resolves({ columnsToDisplay, extraColumns, filtersToDisplay });
    organizationParticipantRepository.findPaginatedFilteredImportedParticipants.resolves({
      organizationParticipants: [],
      meta: {},
    });
    // when
    const result = await findPaginatedFilteredParticipants({
      organizationId,
      filters,
      extraFilters,
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
      extraFilters,
    });
    expect(result.meta.headingCustomColumns).to.be.equals(columnsToDisplay);
    expect(result.meta.customFilters).to.be.equals(filtersToDisplay);
  });

  context('when oralization feature is linked to organization', function () {
    it('should return an headingCustomColumns with oralization', async function () {
      organizationFeaturesAPI.getAllFeaturesFromOrganization
        .withArgs(organizationId)
        .resolves({ hasLearnersImportFeature: true, hasOralizationFeature: true });

      organizationLearnerImportFormatRepository.get
        .withArgs(organizationId)
        .resolves({ columnsToDisplay: [], extraColumns, filtersToDisplay });

      organizationParticipantRepository.findPaginatedFilteredImportedParticipants.resolves({
        organizationParticipants: [],
        meta: {},
      });

      const result = await findPaginatedFilteredParticipants({
        organizationId,
        filters,
        extraFilters,
        page,
        sort,
        organizationParticipantRepository,
        organizationLearnerImportFormatRepository,
        organizationLearnerFeatureRepository,
        organizationFeaturesAPI,
      });

      expect(result.meta.headingCustomColumns).to.be.deep.equals(['ORALIZATION']);
    });
    it('should add oralization value to participants', async function () {
      // given
      organizationFeaturesAPI.getAllFeaturesFromOrganization
        .withArgs(organizationId)
        .resolves({ hasLearnersImportFeature: true, hasOralizationFeature: true });

      organizationLearnerImportFormatRepository.get
        .withArgs(organizationId)
        .resolves({ columnsToDisplay: [], extraColumns, filtersToDisplay });
      const learnerWithOralization = domainBuilder.buildOrganizationLearner({ id: 1 });

      const participantWithOralization = new OrganizationParticipant({
        id: learnerWithOralization.id,
        FAKE_COLUMN: 'fake value',
      });
      const participantWithoutOralization = new OrganizationParticipant({
        id: 2,
        FAKE_COLUMN: 'fake value',
      });
      organizationParticipantRepository.findPaginatedFilteredImportedParticipants.resolves({
        organizationParticipants: [participantWithOralization, participantWithoutOralization],
        meta: {},
      });
      organizationLearnerFeatureRepository.getLearnersByFeature.resolves([learnerWithOralization]);

      // when
      const result = await findPaginatedFilteredParticipants({
        organizationId,
        filters,
        extraFilters,
        page,
        sort,
        organizationParticipantRepository,
        organizationLearnerImportFormatRepository,
        organizationFeaturesAPI,
        organizationLearnerFeatureRepository,
      });

      // then
      expect(
        organizationParticipantRepository.findPaginatedFilteredImportedParticipants,
      ).to.have.been.calledWithExactly({
        organizationId,
        extraColumns,
        page,
        sort,
        filters,
        extraFilters,
      });

      const expectedParticipantWithOralization = new OrganizationParticipant({
        id: participantWithOralization.id,
        FAKE_COLUMN: 'fake value',
        ORALIZATION: true,
      });
      const expectedParticipantWithoutOralization = new OrganizationParticipant({
        id: participantWithoutOralization.id,
        FAKE_COLUMN: 'fake value',
        ORALIZATION: false,
      });

      expect(result.organizationParticipants).to.have.deep.members([
        expectedParticipantWithOralization,
        expectedParticipantWithoutOralization,
      ]);
    });
  });
});
