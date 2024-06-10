import { addTagsToOrganizations } from '../../../scripts/add-tags-to-organizations.js';
import { Tag } from '../../../src/organizational-entities/domain/models/Tag.js';
import { expect, sinon } from '../../test-helper.js';

describe('Unit | Scripts | add-tags-to-organizations.js', function () {
  context('When tag already exists for an organization', function () {
    it('should not throw an error', async function () {
      // given
      const tagsByName = new Map([['tagName', new Tag({ name: 'tagName' })]]);
      const checkedData = [{ organizationId: 1, tagName: 'tagName' }];
      const organizationTagRepository = {
        create: sinon.stub(),
        isExistingByOrganizationIdAndTagId: sinon.stub().resolves(true),
      };

      // when
      await addTagsToOrganizations({ tagsByName, checkedData, dependencies: { organizationTagRepository } });

      // then
      expect(organizationTagRepository.create).to.not.have.been.called;
    });
  });
});
