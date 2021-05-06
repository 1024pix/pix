const { expect, sinon } = require('../../../test-helper');

const tagController = require('../../../../lib/application/tags/tag-controller');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | Application | Tags | tag-controller', () => {

  describe('#findAllOrganizationsTags', () => {

    it('should call the usecase findAllOrganizationsTags', async () => {

      // given
      sinon.stub(usecases, 'findAllOrganizationsTags');
      usecases.findAllOrganizationsTags.resolves();

      // when
      await tagController.findAllOrganizationsTags();

      // then
      expect(usecases.findAllOrganizationsTags).to.have.been.called;
    });

  });

});
