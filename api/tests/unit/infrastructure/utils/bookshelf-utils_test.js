const { expect, sinon } = require('../../../test-helper');
const bookShelfUtils = require('../../../../lib/infrastructure/utils/bookshelf-utils');

describe('Unit | Utils | Bookhelf utils', function() {

  describe('#mergeModelWithRelationship', () => {
    it('should be a function', () => {
      // then
      expect(bookShelfUtils.mergeModelWithRelationship).to.be.a('function');
    });

    it('should apply a load function to each bookshelf model', () => {
      // given
      const loadStub = sinon.stub().resolves();
      const model = [{ load: loadStub }, { load: loadStub }];
      // when
      const promise = bookShelfUtils.mergeModelWithRelationship(model, 'user');

      // then
      return promise.then(() => {
        sinon.assert.calledTwice(loadStub);
      });
    });
  });
});
