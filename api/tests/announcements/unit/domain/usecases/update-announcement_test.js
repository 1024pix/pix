import sinon from 'sinon';

import { updateAnnouncement } from '../../../../../src/communication/announcements/domain/usecases/update-announcement.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | UseCase | Update Announcement', function () {
  it('should use announcement repository to update the announcement by name', async function () {
    // given
    const name = 'SCO';
    const content = 'Nouveau contenu Markdown';
    const expectedAnnouncement = Symbol('updated-announcement');
    const announcementRepository = {
      update: sinon.stub().resolves(expectedAnnouncement),
    };

    // when
    const result = await updateAnnouncement({ name, content, announcementRepository });

    // then
    expect(result).to.equal(expectedAnnouncement);
    expect(announcementRepository.update).to.have.been.calledOnceWith(name, content);
  });
});
