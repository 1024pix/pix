const { expect, sinon, catchErr } = require('../../test-helper');

const { createOrganizationWithTags } = require('../../../scripts/create-pro-organizations-with-tags');
const { FileValidationError } = require('../../../lib/domain/errors');

describe('Unit | Scripts | create-pro-organization-with-tags.js', function () {
  context('When organization file is empty', function () {
    afterEach(function () {
      sinon.restore();
    });
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
});
