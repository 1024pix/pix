import { expect, catchErr, databaseBuilder } from '../../test-helper';
import { doSomething } from '../../../scripts/_template';

describe('#doSomething', function () {
  describe('#if throwError is false', function () {
    it('should return an identifier ', async function () {
      // given
      databaseBuilder.factory.buildUser({ id: 1 });
      await databaseBuilder.commit();
      const throwError = false;

      // when
      const data = await doSomething({ throwError });

      // then
      expect(data).to.deep.equal({ id: 1 });
    });
  });
  describe('#if throwError is true', function () {
    it('should throw a error', async function () {
      // given
      const throwError = true;

      // when
      const error = await catchErr(doSomething)({ throwError });

      // then
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.be.equal('An error occurred');
    });
  });
});
