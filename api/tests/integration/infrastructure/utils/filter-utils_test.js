import { expect, databaseBuilder, knex } from '../../../test-helper';
import { filterByFullName } from '../../../../lib/infrastructure/utils/filter-utils';

describe('Integration | Utils | filter-utils', function () {
  describe('#filterByFullName', function () {
    context('when some rows match by full name', function () {
      it('should return the matching rows', async function () {
        // given
        databaseBuilder.factory.buildUser({ firstName: 'Bernard', lastName: 'Dupuy' });
        const { id } = databaseBuilder.factory.buildUser({ firstName: 'Robert', lastName: 'Howard' });
        await databaseBuilder.commit();

        // when
        const ids = await knex('users').modify(filterByFullName, 'Robert H', 'firstName', 'lastName').pluck('id');

        // then
        expect(ids).to.deep.equal([id]);
      });

      it('should handle space before search', async function () {
        // given
        const { id } = databaseBuilder.factory.buildUser({ firstName: 'Bernard', lastName: 'Dupuy' });
        databaseBuilder.factory.buildUser({ firstName: 'Robert', lastName: 'Howard' });
        await databaseBuilder.commit();

        // when
        const ids = await knex('users').modify(filterByFullName, '  dup', 'firstName', 'lastName').pluck('id');

        // then
        expect(ids).to.deep.equal([id]);
      });

      it('should handle space after search', async function () {
        // given
        const { id } = databaseBuilder.factory.buildUser({ firstName: 'Robert', lastName: 'Howard' });
        databaseBuilder.factory.buildUser({ firstName: 'Bernard', lastName: 'Dupuy' });
        await databaseBuilder.commit();

        // when
        const ids = await knex('users').modify(filterByFullName, 'ert ', 'firstName', 'lastName').pluck('id');

        // then
        expect(ids).to.deep.equal([id]);
      });
    });

    context('when some some rows match by first name', function () {
      it('should return the matching rows', async function () {
        // given
        const { id: id1 } = databaseBuilder.factory.buildUser({ firstName: 'Robert' });
        const { id: id2 } = databaseBuilder.factory.buildUser({ firstName: 'Bernard' });
        const { id: id3 } = databaseBuilder.factory.buildUser({ firstName: 'Barnarbe' });
        databaseBuilder.factory.buildUser({ firstName: 'Luc' });

        await databaseBuilder.commit();

        const ids = await knex('users').modify(filterByFullName, 'be ', 'firstName', 'lastName').pluck('id');

        // then
        expect(ids).to.exactlyContain([id1, id2, id3]);
      });
    });

    context('when some some rows match by last name', function () {
      it('should return the matching rows', async function () {
        // given
        databaseBuilder.factory.buildUser({ lastName: 'Batman' });
        const { id: id1 } = databaseBuilder.factory.buildUser({ lastName: 'Alfred' });
        const { id: id2 } = databaseBuilder.factory.buildUser({ lastName: 'Fredal' });
        const { id: id3 } = databaseBuilder.factory.buildUser({ lastName: 'Fraled' });

        await databaseBuilder.commit();

        const ids = await knex('users').modify(filterByFullName, 'al ', 'firstName', 'lastName').pluck('id');

        // then
        expect(ids).to.exactlyContain([id1, id2, id3]);
      });
    });
  });
});
