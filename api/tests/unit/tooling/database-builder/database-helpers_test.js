import * as databaseHelpers from '../../../../db/database-builder/database-helpers.js';
import { expect } from '../../../test-helper.js';

describe('Unit | Tooling | DatabaseBuilder | database-helpers', function () {
  describe('#getTableNameFromInsertSqlQuery', function () {
    [
      {
        expectedTableName: 'users',
        insertSqlQuery:
          '/* path:  */ insert into "users" ("cgu", "createdAt", "email", "emailConfirmedAt", "firstName", "hasBeenAnonymised", "hasBeenAnonymisedBy", "hasSeenAssessmentInstructions", "hasSeenFocusedChallengeTooltip", "hasSeenNewDashboardInfo", "hasSeenOtherChallengesTooltip", "id", "isAnonymous", "lang", "lastDataProtectionPolicySeenAt", "lastName", "lastPixCertifTermsOfServiceValidatedAt", "lastPixOrgaTermsOfServiceValidatedAt", "lastTermsOfServiceValidatedAt", "locale", "mustValidateTermsOfService", "pixCertifTermsOfServiceAccepted", "pixOrgaTermsOfServiceAccepted", "updatedAt", "username") values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, DEFAULT, $21, $22, $23, $24, $25)',
      },
      {
        expectedTableName: 'user-logins',
        insertSqlQuery:
          '/* path: /api/oidc/user/reconcile */ insert into "user-logins" ("lastLoggedAt", "userId") values ($1, $2) on conflict ("userId") do update set "lastLoggedAt" = excluded."lastLoggedAt", "userId" = excluded."userId"',
      },
    ].forEach(({ expectedTableName, insertSqlQuery }) => {
      context(`when receiving "${insertSqlQuery}" as insert SQL query`, function () {
        it(`returns "${expectedTableName}" as value`, function () {
          // when
          const result = databaseHelpers.getTableNameFromInsertSqlQuery(insertSqlQuery);

          // then
          expect(result).to.equal(expectedTableName);
        });
      });
    });
  });
});
