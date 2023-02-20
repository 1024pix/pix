import { expect } from '../../../../test-helper';
import ReachedStage from '../../../../../lib/domain/read-models/participant-results/ReachedStage';

describe('Unit | Domain | Read-Models | ParticipantResults | ReachedStage', function () {
  it('gives the stage reached and the number of stars', function () {
    const stages = [
      { id: 1, title: 'Stage1', message: 'message1', threshold: 25 },
      { id: 2, title: 'Stage2', message: 'message2', threshold: 60 },
      { id: 3, title: 'Stage3', message: 'message3', threshold: 90 },
    ];

    const profileStage = new ReachedStage(0.66, stages);

    expect(profileStage).to.deep.equal({
      id: 2,
      title: 'Stage2',
      message: 'message2',
      threshold: 60,
      starCount: 2,
    });
  });
});
