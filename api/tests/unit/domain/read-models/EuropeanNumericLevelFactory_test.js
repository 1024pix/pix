import { expect } from '../../../test-helper';
import EuropeanNumericLevelFactory from '../../../../lib/domain/read-models/EuropeanNumericLevelFactory';
import EuropeanNumericLevel from '../../../../lib/domain/read-models/EuropeanNumericLevel';

describe('Unit | Domain | Read-models | EuropeanNumericLevelFactory', function () {
  describe('static #buildFromCompetenceMarks', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    ['2.2', '3.4', '4.1', '4.2', '5.1', '5.2'].forEach((competenceCode) => {
      it(`should build an EuropeanNumericLevel with for competence '${competenceCode}'`, function () {
        // given
        const competenceMark = { competenceCode, level: 4 };

        // when
        const europeanNumericLevels = EuropeanNumericLevelFactory.buildFromCompetenceMarks([competenceMark]);

        // then
        const [domainCompetenceId, competenceId] = competenceCode.split('.');
        expect(europeanNumericLevels).to.deep.contains(
          new EuropeanNumericLevel({
            domainCompetenceId,
            competenceId,
            level: 4,
          })
        );
      });
    });

    context(`when competence code is '1.1'`, function () {
      it(`should return two EuropeanNumericLevel for competence '1.1' and '1.2'`, function () {
        // given
        const competenceMark = { competenceCode: '1.1', level: 4 };

        // when
        const europeanNumericLevels = EuropeanNumericLevelFactory.buildFromCompetenceMarks([competenceMark]);

        // then
        expect(europeanNumericLevels).to.deep.contains(
          new EuropeanNumericLevel({
            domainCompetenceId: '1',
            competenceId: '1',
            level: 4,
          }),
          new EuropeanNumericLevel({
            domainCompetenceId: '1',
            competenceId: '2',
            level: 4,
          })
        );
      });
    });

    context(`when competence code is '2.1'`, function () {
      it(`should return two EuropeanNumericLevel for competence '2.1' and '2.5'`, function () {
        // given
        const competenceMark = { competenceCode: '2.1', level: 4 };

        // when
        const europeanNumericLevels = EuropeanNumericLevelFactory.buildFromCompetenceMarks([competenceMark]);

        // then
        expect(europeanNumericLevels).to.deep.contains(
          new EuropeanNumericLevel({
            domainCompetenceId: '2',
            competenceId: '1',
            level: 4,
          }),
          new EuropeanNumericLevel({
            domainCompetenceId: '2',
            competenceId: '5',
            level: 4,
          })
        );
      });
    });

    context(`when competence code is '2.3'`, function () {
      it(`should return an EuropeanNumericLevel for competence '2.4'`, function () {
        // given
        const competenceMark = { competenceCode: '2.3', level: 4 };

        // when
        const europeanNumericLevels = EuropeanNumericLevelFactory.buildFromCompetenceMarks([competenceMark]);

        // then
        expect(europeanNumericLevels).to.deep.contains(
          new EuropeanNumericLevel({
            domainCompetenceId: '2',
            competenceId: '4',
            level: 4,
          })
        );
      });
    });

    context(`when competence code is '2.4'`, function () {
      it(`should return two EuropeanNumericLevel for competences '2.3', '2.6' and '5.4'`, function () {
        // given
        const competenceMark = { competenceCode: '2.4', level: 4 };

        // when
        const europeanNumericLevels = EuropeanNumericLevelFactory.buildFromCompetenceMarks([competenceMark]);

        // then
        expect(europeanNumericLevels).to.deep.contains(
          new EuropeanNumericLevel({
            domainCompetenceId: '2',
            competenceId: '3',
            level: 4,
          }),
          new EuropeanNumericLevel({
            domainCompetenceId: '2',
            competenceId: '6',
            level: 4,
          }),
          new EuropeanNumericLevel({
            domainCompetenceId: '5',
            competenceId: '4',
            level: 4,
          })
        );
      });
    });

    context(`when competence code is '3.3'`, function () {
      it(`should return two EuropeanNumericLevel for competences '3.2' and '3.3'`, function () {
        // given
        const competenceMark = { competenceCode: '3.3', level: 4 };

        // when
        const europeanNumericLevels = EuropeanNumericLevelFactory.buildFromCompetenceMarks([competenceMark]);

        // then
        expect(europeanNumericLevels).to.deep.contains(
          new EuropeanNumericLevel({
            domainCompetenceId: '3',
            competenceId: '2',
            level: 4,
          }),
          new EuropeanNumericLevel({
            domainCompetenceId: '3',
            competenceId: '3',
            level: 4,
          })
        );
      });
    });

    context(`when competence code is '4.3'`, function () {
      it(`should return two EuropeanNumericLevel for competences '4.3' and '4.4'`, function () {
        // given
        const competenceMark = { competenceCode: '4.3', level: 4 };

        // when
        const europeanNumericLevels = EuropeanNumericLevelFactory.buildFromCompetenceMarks([competenceMark]);

        // then
        expect(europeanNumericLevels).to.deep.contains(
          new EuropeanNumericLevel({
            domainCompetenceId: '4',
            competenceId: '3',
            level: 4,
          }),
          new EuropeanNumericLevel({
            domainCompetenceId: '4',
            competenceId: '4',
            level: 4,
          })
        );
      });
    });

    context(`when there are competence marks for competence '1.2' and '1.3'`, function () {
      it(`should return an EuropeanNumericLevel for competence '1.3' with the level equals to the average of both levels`, function () {
        // given
        const competenceMarks = [
          { competenceCode: '1.2', level: 4 },
          { competenceCode: '1.3', level: 8 },
        ];

        // when
        const europeanNumericLevels = EuropeanNumericLevelFactory.buildFromCompetenceMarks(competenceMarks);

        // then
        expect(europeanNumericLevels).to.deep.contains(
          new EuropeanNumericLevel({
            domainCompetenceId: '1',
            competenceId: '3',
            level: 6,
          })
        );
      });
    });

    context(`when there is a competence mark for competence '1.2' but none for competence '1.3'`, function () {
      it(`should not return an EuropeanNumericLevel for competence '1.3'`, function () {
        // given
        const competenceMarks = [{ competenceCode: '1.2', level: 4 }];

        // when
        const europeanNumericLevels = EuropeanNumericLevelFactory.buildFromCompetenceMarks(competenceMarks);

        // then
        expect(europeanNumericLevels).to.not.deep.contains(
          new EuropeanNumericLevel({
            domainCompetenceId: '1',
            competenceId: '3',
            level: 6,
          })
        );
      });
    });

    context(`when there is a competence mark for competence '1.3' but none for competence '1.2'`, function () {
      it(`should not return an EuropeanNumericLevel for competence '1.3'`, function () {
        // given
        const competenceMarks = [{ competenceCode: '1.3', level: 4 }];

        // when
        const europeanNumericLevels = EuropeanNumericLevelFactory.buildFromCompetenceMarks(competenceMarks);

        // then
        expect(europeanNumericLevels).to.not.deep.contains(
          new EuropeanNumericLevel({
            domainCompetenceId: '1',
            competenceId: '3',
            level: 6,
          })
        );
      });
    });

    context(`when there are competence marks for competence '3.1' and '3.2'`, function () {
      it(`should return an EuropeanNumericLevel for competence '3.1' with the level equals to the average of both levels `, function () {
        // given
        const competenceMarks = [
          { competenceCode: '3.1', level: 4 },
          { competenceCode: '3.2', level: 8 },
        ];

        // when
        const europeanNumericLevels = EuropeanNumericLevelFactory.buildFromCompetenceMarks(competenceMarks);

        // then
        expect(europeanNumericLevels).to.deep.contains(
          new EuropeanNumericLevel({
            domainCompetenceId: '3',
            competenceId: '1',
            level: 6,
          })
        );
      });
    });

    context(`when there is a competence mark for competence '3.1' but none for competence '3.2'`, function () {
      it(`should not return an EuropeanNumericLevel for competence '3.1'`, function () {
        // given
        const competenceMarks = [{ competenceCode: '3.1', level: 4 }];

        // when
        const europeanNumericLevels = EuropeanNumericLevelFactory.buildFromCompetenceMarks(competenceMarks);

        // then
        expect(europeanNumericLevels).to.not.deep.contains(
          new EuropeanNumericLevel({
            domainCompetenceId: '3',
            competenceId: '1',
            level: 6,
          })
        );
      });
    });

    context(`when there is a competence mark for competence '3.2' but none for competence '3.1'`, function () {
      it(`should not return an EuropeanNumericLevel for competence '3.1'`, function () {
        // given
        const competenceMarks = [{ competenceCode: '3.2', level: 4 }];

        // when
        const europeanNumericLevels = EuropeanNumericLevelFactory.buildFromCompetenceMarks(competenceMarks);

        // then
        expect(europeanNumericLevels).to.not.deep.contains(
          new EuropeanNumericLevel({
            domainCompetenceId: '3',
            competenceId: '1',
            level: 6,
          })
        );
      });
    });

    context('when there are at least one competence by domain in competence marks', function () {
      it(`should return an EuropeanNumericLevel for competence '5.3' with level equal to the average of all competence marks levels`, function () {
        // given
        const competenceMarks = [
          { competenceCode: '1.1', areaCode: '1', level: 1 },
          { competenceCode: '2.2', areaCode: '2', level: 3 },
          { competenceCode: '3.4', areaCode: '3', level: 8 },
          { competenceCode: '4.1', areaCode: '4', level: 5 },
          { competenceCode: '4.2', areaCode: '4', level: 3 },
          { competenceCode: '5.2', areaCode: '5', level: 0 },
        ];

        // when
        const europeanNumericLevels = EuropeanNumericLevelFactory.buildFromCompetenceMarks(competenceMarks);

        // then
        expect(europeanNumericLevels).to.deep.contains(
          new EuropeanNumericLevel({ domainCompetenceId: '5', competenceId: '3', level: 3 })
        );
      });
    });

    context('when there is european numeric levels with a level of 0 after computing', function () {
      it('should remove these european numeric levels', function () {
        // given
        const competenceMarks = [
          { competenceCode: '1.1', level: 0 },
          { competenceCode: '2.1', level: 0 },
          { competenceCode: '3.1', level: 0 },
          { competenceCode: '3.2', level: 0 },
        ];

        // when
        const europeanNumericLevels = EuropeanNumericLevelFactory.buildFromCompetenceMarks(competenceMarks);

        // then
        expect(europeanNumericLevels).to.be.empty;
      });
    });
  });
});
