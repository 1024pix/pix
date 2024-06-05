import { OrganizationLearner } from '../../../../../src/school/domain/models/OrganizationLearner.js';
import { School } from '../../../../../src/school/domain/models/School.js';
import { OrganizationLearnerDTO } from '../../../../../src/school/domain/read-models/OrganizationLearnerDTO.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Domain | School', function () {
  describe('#get organizationLearners', function () {
    context('when there are learners with different first names', function () {
      it('should return the learners with their first names as display names', async function () {
        // given
        const organizationLearners = [
          new OrganizationLearner({ firstName: 'Ernest', division: 'CM1' }),
          new OrganizationLearner({ firstName: 'Hector', division: 'CM1' }),
        ];

        // when
        const school = new School({ organizationLearners });

        // then

        expect(school.organizationLearners).to.deep.equal([
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
          { lastNames: ['Abricotier', 'AbriCoteur'], expectedLastNameLetters: ['Abricoti.', 'AbriCote.'] },
        ];

        // eslint-disable-next-line mocha/no-setup-in-describe
        tests.forEach(function ({ lastNames, expectedLastNameLetters }) {
          it(`for last names: [${lastNames}] should return display names: first name + [${expectedLastNameLetters}]`, async function () {
            // given
            const organizationLearners = lastNames.map(
              (lastName) => new OrganizationLearner({ firstName: 'Ernest', lastName: lastName, division: 'CM1' }),
            );

            // when
            const school = new School({ organizationLearners });

            // then

            expect(school.organizationLearners).to.deep.equal(
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

        context('when firstnames do not have the same case', function () {
          it('should return display name: firstname + first different lastname letter', function () {
            // given
            const organizationLearners = [
              new OrganizationLearner({ firstName: 'Ernest', lastName: 'Abea', division: 'CM1' }),
              new OrganizationLearner({ firstName: 'ERNEST', lastName: 'Beaba', division: 'CM1' }),
            ];

            // when
            const school = new School({ organizationLearners });

            // then

            expect(school.organizationLearners).to.deep.equal([
              new OrganizationLearnerDTO({ firstName: 'Ernest', displayName: 'Ernest A.', division: 'CM1' }),
              new OrganizationLearnerDTO({ firstName: 'ERNEST', displayName: 'ERNEST B.', division: 'CM1' }),
            ]);
          });
        });
      });
      context('but different divisions', function () {
        it('should return the learners with their first names as display names', async function () {
          // given
          const organizationLearners = [
            new OrganizationLearner({ firstName: 'Ernest', lastName: 'Abea', division: 'CM1' }),
            new OrganizationLearner({ firstName: 'Ernest', lastName: 'Beaba', division: 'CM2' }),
          ];

          // when
          const school = new School({ organizationLearners });

          // then

          expect(school.organizationLearners).to.deep.equal([
            new OrganizationLearnerDTO({ firstName: 'Ernest', displayName: 'Ernest', division: 'CM1' }),
            new OrganizationLearnerDTO({ firstName: 'Ernest', displayName: 'Ernest', division: 'CM2' }),
          ]);
        });
      });
    });
  });
});
