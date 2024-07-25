import { ParticipantRepartition } from '../../../../src/shared/domain/models/ParticipantRepartition.js';
import { expect } from '../../../test-helper.js';

describe('Unit | Domain | Models | ParticipantRepartition', function () {
  it('counts the number of registred users', function () {
    // given & when
    const participantList = [{ isAnonymous: true }, { isAnonymous: false }, { isAnonymous: false }];
    const participantRepartition = new ParticipantRepartition(participantList);
    // then
    expect(participantRepartition.totalRegisteredParticipant).to.equal(2);
  });

  it('counts the number of not registred users', function () {
    // given & when
    const participantList = [{ isAnonymous: true }, { isAnonymous: false }, { isAnonymous: false }];
    const participantRepartition = new ParticipantRepartition(participantList);
    // then
    expect(participantRepartition.totalUnRegisteredParticipant).to.equal(1);
  });
});
