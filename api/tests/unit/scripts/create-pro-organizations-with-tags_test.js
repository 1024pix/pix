const { expect, sinon, catchErr } = require('../../test-helper');

const { createOrganizationWithTags } = require('../../../scripts/create-pro-organizations-with-tags');
const organizationTagRepository = require('../../../lib/infrastructure/repositories/organization-tag-repository');
const organizationRepository = require('../../../lib/infrastructure/repositories/organization-repository');
const tagRepository = require('../../../lib/infrastructure/repositories/tag-repository');
const organizationInvitationRepository = require('../../../lib/infrastructure/repositories/organization-invitation-repository');
const organizationInvitationService = require('../../../lib/domain/services/organization-invitation-service');
const { FileValidationError } = require('../../../lib/domain/errors');

describe('Unit | Scripts | create-pro-organization-with-tags.js', function () {
  beforeEach(function () {
    sinon.stub(console, 'log');
  });

  context('When organization file is empty', function () {
    it('should throw an error', async function () {
      // given
      const organizationsWithValidDataPath = `${__dirname}/helpers/files/organizations-empty-file.csv`;

      // when
      const error = await catchErr(createOrganizationWithTags)(organizationsWithValidDataPath);

      // then
      expect(error).to.be.instanceOf(FileValidationError);
      expect(error.meta).to.be.equal('File is empty');
    });
  });

  context('When some required headers are missing', function () {
    it('should throw an error', async function () {
      // given
      const organizationsWithValidDataPath = `${__dirname}/helpers/files/organizations-with-missing-headers-test.csv`;

      // when
      const error = await catchErr(createOrganizationWithTags)(organizationsWithValidDataPath);

      // then
      expect(error).to.be.instanceOf(FileValidationError);
      expect(error.meta).to.be.equal('Headers missing: externalId,createdBy');
    });
  });

  context('When required headers are present but data is missing', function () {
    it('should throw an error', async function () {
      // given
      const organizationsWithValidDataPath = `${__dirname}/helpers/files/organizations-with-header-and-missing-data-test.csv`;

      // when
      const error = await catchErr(createOrganizationWithTags)(organizationsWithValidDataPath);

      // then
      expect(error).to.be.instanceOf(FileValidationError);
      expect(error.meta).to.be.equal('File is empty');
    });
  });

  context('When data file is valid', function () {
    let sandbox;

    beforeEach(async function () {
      sandbox = sinon.createSandbox();
      sandbox.stub(organizationRepository, 'findByExternalIdsFetchingIdsOnly');
    });

    afterEach(function () {
      sandbox.restore();
    });
    it('should create organizations with tags', async function () {
      // given
      const organizationsWithValidDataPath = `${__dirname}/helpers/files/organizations-with-header-and-valid-data-test.csv`;
      const createdOrganizations = [
        {
          id: 16000,
          externalId: 'b2066',
          email: 'youness.yahya@pix.fr',
          name: 'Nom orga',
        },
        {
          id: 16001,
          externalId: 'b2067',
          email: 'youness.yahya@pix.fr',
          name: 'Nom orga',
        },
      ];

      const allTags = [
        { id: 1, name: 'AGRICULTURE' },
        { id: 2, name: 'PUBLIC' },
      ];

      organizationRepository.batchCreateProOrganizations = sinon.stub().resolves(createdOrganizations);
      organizationRepository.batchCreate = sinon.stub();
      tagRepository.create = sinon.stub();
      tagRepository.findAll = sinon.stub().resolves(allTags);
      organizationTagRepository.batchCreate = sinon.stub();
      organizationInvitationRepository.create = sinon.stub();
      organizationInvitationService.createProOrganizationInvitation = sinon.stub();

      // when
      const response = await createOrganizationWithTags(organizationsWithValidDataPath);

      // then
      expect(organizationInvitationService.createProOrganizationInvitation).to.have.been.called;
      expect(response).to.equal('Organizations created with success !');
    });
  });
});
