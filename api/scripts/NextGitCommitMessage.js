const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

module.exports = class NextGitCommitMessage {
  constructor(messageFilePath) {
    this.messageFilePath = messageFilePath;
  }
  getSubject() {
    return this._readCommitFile().split('\n')[0];
  }
  getCurrentBranch() {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).split('\n')[0];
  }
  updateSubject(newMessage) {
    const messageLines = this.getSubject().split('\n');
    messageLines[0] = newMessage;
    fs.writeFileSync(this.messageFilePath, messageLines.join('\n'), { encoding: 'utf-8' });
  }
  _readCommitFile() {
    const commitFilePath = path.join(process.cwd(), this.messageFilePath);
    return fs.readFileSync(commitFilePath, { encoding: 'utf-8' });
  }
};
