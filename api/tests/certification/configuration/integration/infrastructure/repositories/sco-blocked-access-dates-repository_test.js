import { ScoOrganizationTagName } from '../../../../../../src/certification/configuration/domain/models/ScoOrganizationTagName.js';
import * as ScoBlockedAccessDatesRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/sco-blocked-access-dates-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';

import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Configuration | Integration | Repository | sco-blocked-access-dates-repository', function () {
  describe('#getScoBlockedAccessDates', function () {
    it('should get blocked access dates ', async function () {
      // given
      databaseBuilder.factory.buildDefaultScoBlockedAccessDates();
      await databaseBuilder.commit();

      const scoBlockedAccessDates = [
        domainBuilder.certification.configuration.buildScoBlockedAccessDateCollege(),
        domainBuilder.certification.configuration.buildScoBlockedAccessDateLycee(),
      ];

      //when
      const results = await ScoBlockedAccessDatesRepository.getScoBlockedAccessDates();

      //then
      expect(results).to.deepEqualInstance(scoBlockedAccessDates);
    });
  });
  describe('#getScoBlockedAccessDateByKey', function () {
    context('when ScoBlockedAccessDate is found', function () {
      it('should find the blocked access date with given key ', async function () {
        // given
        databaseBuilder.factory.buildScoBlockedAccessDate({ scoOrganizationTagName: ScoOrganizationTagName.COLLEGE });
        await databaseBuilder.commit();
        const expectedScoBlockedAccessDate =
          domainBuilder.certification.configuration.buildScoBlockedAccessDateCollege();

        //when
        const results = await ScoBlockedAccessDatesRepository.getScoBlockedAccessDateByKey(
          ScoOrganizationTagName.COLLEGE,
        );

        //then
        expect(results).to.deepEqualInstance(expectedScoBlockedAccessDate);
      });
    });
    context('when ScoBlockedAccessDate is not found', function () {
      it('should throw a 404 error', async function () {
        // given
        databaseBuilder.factory.buildScoBlockedAccessDate({ scoOrganizationTagName: ScoOrganizationTagName.COLLEGE });
        await databaseBuilder.commit();

        //when
        const error = await catchErr(ScoBlockedAccessDatesRepository.getScoBlockedAccessDateByKey)(
          ScoOrganizationTagName.LYCEE,
        );

        //then
        expect(error).to.be.an.instanceof(NotFoundError);
        expect(error.message).to.equal('ScoBlockedAccessDate LYCEE does not exist.');
      });
    });
  });
  describe('#updateScoBlockedAccessDate', function () {
    it('should update blocked access dates ', async function () {
      // given
      databaseBuilder.factory.buildDefaultScoBlockedAccessDates();
      await databaseBuilder.commit();

      //when
      await ScoBlockedAccessDatesRepository.updateScoBlockedAccessDate({
        scoOrganizationTagName: ScoOrganizationTagName.LYCEE,
        reopeningDate: new Date('2025-12-15'),
      });

      //then
      const [updatedValue] = await knex('certification_sco_blocked_access_dates')
        .where({ scoOrganizationTagName: ScoOrganizationTagName.LYCEE })
        .pluck('reopeningDate');
      expect(updatedValue.toDateString()).to.equal(new Date('2025-12-15').toDateString());
    });
  });
});
