import { expect } from '../../test-helper';
import { prepareDataForInsert } from '../../../scripts/create-users-accounts-for-contest';

describe('Unit | Scripts | create-users-accounts-for-contest.js', function () {
  describe('#prepareDataForInsert', function () {
    it('should trim firstName, lastName, email and password', function () {
      // given
      const data = [
        {
          firstName: '  Salim    ',
          lastName: ' Bienléongle     ',
          email: '  salim@example.net  ',
          password: '     pix123   ',
        },
        { firstName: '  Samantha      ', lastName: '  Lo ', email: '  lo@example.net  ', password: '     pixou123   ' },
      ];

      // when
      const result = prepareDataForInsert(data);

      // then
      expect(result).to.deep.equal([
        {
          firstName: 'Salim',
          lastName: 'Bienléongle',
          email: 'salim@example.net',
          password: 'pix123',
        },
        { firstName: 'Samantha', lastName: 'Lo', email: 'lo@example.net', password: 'pixou123' },
      ]);
    });
  });
});
