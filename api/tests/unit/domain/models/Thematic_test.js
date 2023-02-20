import Thematic from '../../../../lib/domain/models/Thematic';
import { expect } from '../../../test-helper';

describe('Unit | Domain | Models | Thematic', function () {
  it('should return a thematic', function () {
    // given
    const thematic = new Thematic({ id: '1', name: 'Test', index: 0, tubeIds: ['1', '2'] });

    // then
    expect(thematic.id).to.be.equal('1');
    expect(thematic.name).to.be.equal('Test');
    expect(thematic.index).to.be.equal(0);
    expect(thematic.tubeIds).to.be.deep.equal(['1', '2']);
  });
});
