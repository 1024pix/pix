import { expect } from '../../test-helper';
import getNextCommitSubject from '../../../scripts/get-next-commit-subject';

describe('get-next-commit-subject', function () {
  const commitSubject = 'Add a user repository';
  it('should prepend [app-abbrev-xxx] when branch name starts with pf, po, pc or pa', function () {
    expect(getNextCommitSubject(commitSubject, 'pf-42-branch')).to.deep.equal('[pf-42] Add a user repository');
    expect(getNextCommitSubject(commitSubject, 'po-42-branch')).to.deep.equal('[po-42] Add a user repository');
    expect(getNextCommitSubject(commitSubject, 'pc-42-branch')).to.deep.equal('[pc-42] Add a user repository');
    expect(getNextCommitSubject(commitSubject, 'pa-42-branch')).to.deep.equal('[pa-42] Add a user repository');
  });
  it('should xd', function () {
    expect(getNextCommitSubject(commitSubject, 'pf-42')).to.deep.equal('[pf-42] Add a user repository');
  });
  it('should not add anything when the branch name does not match the minimum required pattern', function () {
    expect(getNextCommitSubject(commitSubject, 'pf')).to.deep.equal(commitSubject);
  });
  it('should not add anything when the branch is a merge', function () {
    expect(getNextCommitSubject('Merge branch pf-42-branch', 'pf-42-branch')).to.deep.equal(
      'Merge branch pf-42-branch'
    );
    expect(getNextCommitSubject('Merge pull request pf-42-branch', 'pf-42-branch')).to.deep.equal(
      'Merge pull request pf-42-branch'
    );
  });
});
