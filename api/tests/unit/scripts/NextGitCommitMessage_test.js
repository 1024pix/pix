const { expect, sinon } = require('../../test-helper');
const fs = require('fs');

const NextGitCommitMessage = require('../../../scripts/NextGitCommitMessage');

describe('NextGitCommitMessage', () => {

  it('should update the commit message', () => {

    // given
    const initialSubject = 'Add save method to user repository';
    const updatedSubject = 'Add getById method to user repository';
    const descriptionBody = 'This commit will help improve the user repository file.';
    const path = '/some/path';
    const initialCommitMessage = `${initialSubject}\n\n${descriptionBody}`;
    const updatedCommitMessage = `${updatedSubject}\n\n${descriptionBody}`;

    sinon.stub(fs, 'readFileSync').returns(initialCommitMessage);
    sinon.stub(fs, 'writeFileSync');

    const commit = new NextGitCommitMessage(path);

    // when
    commit.updateSubject(updatedCommitMessage);

    // then
    expect(fs.writeFileSync).to.have.been.calledWithExactly(path, updatedCommitMessage, { encoding: 'utf-8' });
  });
});
