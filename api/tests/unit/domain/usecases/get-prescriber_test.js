const { expect, sinon } = require('../../../test-helper');
const getPrescriber = require('../../../../lib/domain/usecases/get-prescriber');

describe('Unit | UseCase | get-prescriber', () => {

  let prescriberRepository;

  beforeEach(() => {
    prescriberRepository = { getPrescriber: sinon.stub() };
  });

  it('should get the prescriber', async () => {
    // given
    prescriberRepository.getPrescriber.withArgs(1).resolves({ id: 1 });

    // when
    const result = await getPrescriber({
      userId: 1,
      prescriberRepository,
    });

    // then
    expect(result).to.deep.equal({ id: 1 });
  });
});
