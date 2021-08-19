const { expect, sinon } = require('../../test-helper');
const { addTagsToOrganizations } = require('../../../scripts/add-tags-to-organizations');
const organizationTagRepository = require('../../../lib/infrastructure/repositories/organization-tag-repository');
const Tag = require('../../../lib/domain/models/Tag');

describe('Unit | Scripts | add-tags-to-organizations.js', function() {

  context('When tag already exists for an organization', function() {

    it('should not throw an error', async function() {
      // given
      const tagsByName = new Map([['tagName', new Tag({ name: 'tagName' })]]);
      const checkedData = [{ organizationId: 1, tagName: 'tagName' }];

      organizationTagRepository.create = sinon.stub();
      organizationTagRepository.isExistingByOrganizationIdAndTagId = sinon.stub().resolves(true);

      // when
      await addTagsToOrganizations({ tagsByName, checkedData });

      // then
      expect(organizationTagRepository.create).to.not.have.been.called;
    });
  });
});
