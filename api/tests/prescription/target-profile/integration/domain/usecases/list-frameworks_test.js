import { Framework } from '../../../../../../src/prescription/target-profile/domain/read-models/Framework.js';
import { usecases } from '../../../../../../src/prescription/target-profile/domain/usecases/index.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Prescription | Target Profile | Integration | Domain | usecases | list-frameworks', function () {
  it('should return the frameworks when there are some', async function () {
    // given
    databaseBuilder.factory.learningContent.buildFramework({
      id: 'recId0',
      name: 'mon framework 0',
    });
    databaseBuilder.factory.learningContent.buildFramework({
      id: 'recId1',
      name: 'mon framework 1',
    });
    await databaseBuilder.commit();

    // when
    const frameworks = await usecases.listFrameworks();

    // then
    expect(frameworks).to.deepEqualArray([
      new Framework({ id: 'recId0', name: 'mon framework 0' }),
      new Framework({ id: 'recId1', name: 'mon framework 1' }),
    ]);
  });

  it('should return an empty array when no framework exist', async function () {
    // when
    const frameworks = await usecases.listFrameworks();

    // then
    expect(frameworks).to.deep.equal([]);
  });
});
