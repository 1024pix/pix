import { mapToOrganizationLearnerDtos } from '../../../../../src/school/domain/mappers/map-to-organization-learner-dtos.js';
import { OrganizationLearner } from '../../../../../src/school/domain/models/OrganizationLearner.js';
import { OrganizationLearnerDTO } from '../../../../../src/school/domain/read-models/OrganizationLearnerDTO.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Service | MapToOrganizationLearnerDtos', function () {
  describe('#mapToOrganizationLearnerDtos', function () {
    context('when there are learners with different first names', function () {
      it('should return the learners with their first names as display names', async function () {
        // given
        const learners = [
          new OrganizationLearner({ firstName: 'Ernest', division: 'CM1' }),
          new OrganizationLearner({ firstName: 'Hector', division: 'CM1' }),
        ];

        // when
        const learnersWithUniqueDisplayNameByDivision = mapToOrganizationLearnerDtos(learners);

        // then

        expect(learnersWithUniqueDisplayNameByDivision).to.deep.equal([
          new OrganizationLearnerDTO({ firstName: 'Ernest', displayName: 'Ernest', division: 'CM1' }),
          new OrganizationLearnerDTO({ firstName: 'Hector', displayName: 'Hector', division: 'CM1' }),
        ]);
      });
    });
    context('when there are students with same first names', function () {
      context('and the same division', function () {
        const tests = [
          { lastNames: ['Abea', 'Beaba'], expectedLastNameLetters: ['A.', 'B.'] },
          { lastNames: ['Abea', 'Abou'], expectedLastNameLetters: ['Abe.', 'Abo.'] },
          { lastNames: ['Abricot', 'Abricotier'], expectedLastNameLetters: ['Abricot', 'Abricoti.'] },
          { lastNames: ['Marie', 'Mambo', 'Maman'], expectedLastNameLetters: ['Mar.', 'Mamb.', 'Mama.'] },
          {
            lastNames: ['Abricot', 'Abricotier', 'Abricotierer'],
            expectedLastNameLetters: ['Abricot', 'Abricotier', 'Abricotiere.'],
          },
        ];

        // eslint-disable-next-line mocha/no-setup-in-describe
        tests.forEach(function ({ lastNames, expectedLastNameLetters }) {
          it(`for last names: [${lastNames}] should return display names: first name + [${expectedLastNameLetters}]`, async function () {
            // given
            const learners = lastNames.map(
              (lastName) => new OrganizationLearner({ firstName: 'Ernest', lastName: lastName, division: 'CM1' }),
            );

            // when
            const learnersWithUniqueDisplayNameByDivision = mapToOrganizationLearnerDtos(learners);

            // then

            expect(learnersWithUniqueDisplayNameByDivision).to.deep.equal(
              expectedLastNameLetters.map(
                (lastNameLetters) =>
                  new OrganizationLearnerDTO({
                    firstName: 'Ernest',
                    displayName: `Ernest ${lastNameLetters}`,
                    division: 'CM1',
                  }),
              ),
            );
          });
        });
      });
      context('but different divisions', function () {
        it('should return the learners with their first names as display names', async function () {
          // given
          const learners = [
            new OrganizationLearner({ firstName: 'Ernest', lastName: 'Abea', division: 'CM1' }),
            new OrganizationLearner({ firstName: 'Ernest', lastName: 'Beaba', division: 'CM2' }),
          ];

          // when
          const learnersWithUniqueDisplayNameByDivision = mapToOrganizationLearnerDtos(learners);

          // then

          expect(learnersWithUniqueDisplayNameByDivision).to.deep.equal([
            new OrganizationLearnerDTO({ firstName: 'Ernest', displayName: 'Ernest', division: 'CM1' }),
            new OrganizationLearnerDTO({ firstName: 'Ernest', displayName: 'Ernest', division: 'CM2' }),
          ]);
        });
      });
    });
  });
});
