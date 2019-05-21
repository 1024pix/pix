const { expect, sinon } = require('../../../test-helper');
const findSnapshots = require('../../../../lib/domain/usecases/find-snapshots');

describe('Unit | UseCase | find-snapshots', () => {

  let options;
  let snapshotRepository;

  beforeEach(() => {
    options = {
      filter: { organisationId: 1 },
    };
    snapshotRepository = {
      find: sinon.stub(),
    };
  });

  it('should find the snapshots', async () => {
    // given
    snapshotRepository.find.withArgs(options).resolves('ok');

    // when
    const result = await findSnapshots({ options, snapshotRepository });

    // then
    expect(result).to.equal('ok');
  });

});
