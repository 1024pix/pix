import sinon from 'sinon';

import { getAnnouncement } from '../../../../../src/communication/announcements/domain/usecases/get-announcement.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | UseCase | Get Announcement', function () {
  it('should use announcement repository to get the announcement by name', async function () {
    // given
    const name = 'SCO';
    const expectedAnnouncement = Symbol('announcement');
    const announcementRepository = {
      get: sinon.stub().resolves(expectedAnnouncement),
    };

    // when
    const result = await getAnnouncement({ name, announcementRepository });

    // then
    expect(result).to.equal(expectedAnnouncement);
    expect(announcementRepository.get).to.have.been.calledOnceWithExactly(name);
  });
});
