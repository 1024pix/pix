const { expect, sinon } = require('../../test-helper');
const fs = require('fs').promises;

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

    sinon.stub(fs, 'readFile').returns(initialCommitMessage);
    sinon.stub(fs, 'writeFile');

    const commit = new NextGitCommitMessage(path);

    // when
    commit.updateSubject(updatedCommitMessage);

    // then
    expect(fs.writeFile).to.have.been.calledWithExactly(path, updatedCommitMessage, { encoding: 'utf-8' });
  });
});
