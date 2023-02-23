const uniqBy = require('lodash/uniqBy');
const remove = require('lodash/remove');
const EuropeanNumericLevel = require('./EuropeanNumericLevel.js');

class EuropeanNumericLevelFactory {
  static buildFromCompetenceMarks(competenceMarks) {
    const europeanNumericLevels = [];
    competenceMarks.forEach(({ competenceCode, level }) => {
      if (['2.2', '3.4', '4.1', '4.2', '5.1', '5.2'].includes(competenceCode)) {
        europeanNumericLevels.push(EuropeanNumericLevel.from({ competenceCode, level }));
      }

      if (competenceCode === '1.1') {
        europeanNumericLevels.push(EuropeanNumericLevel.from({ competenceCode: '1.1', level }));
        europeanNumericLevels.push(EuropeanNumericLevel.from({ competenceCode: '1.2', level }));
      }

      if (competenceCode === '2.1') {
        europeanNumericLevels.push(EuropeanNumericLevel.from({ competenceCode: '2.1', level }));
        europeanNumericLevels.push(EuropeanNumericLevel.from({ competenceCode: '2.5', level }));
      }

      if (competenceCode === '2.3') {
        europeanNumericLevels.push(EuropeanNumericLevel.from({ competenceCode: '2.4', level }));
      }

      if (competenceCode === '2.4') {
        europeanNumericLevels.push(EuropeanNumericLevel.from({ competenceCode: '2.3', level }));
        europeanNumericLevels.push(EuropeanNumericLevel.from({ competenceCode: '2.6', level }));
        europeanNumericLevels.push(EuropeanNumericLevel.from({ competenceCode: '5.4', level }));
      }

      if (competenceCode === '3.3') {
        europeanNumericLevels.push(EuropeanNumericLevel.from({ competenceCode: '3.2', level }));
        europeanNumericLevels.push(EuropeanNumericLevel.from({ competenceCode: '3.3', level }));
      }

      if (competenceCode === '4.3') {
        europeanNumericLevels.push(EuropeanNumericLevel.from({ competenceCode: '4.3', level }));
        europeanNumericLevels.push(EuropeanNumericLevel.from({ competenceCode: '4.4', level }));
      }
    });

    const europeanNumericLevel1_3 = _buildEuropeanNumericLevelFromMergedCompetenceMarks({
      competenceMarks,
      competenceCodesToMerge: ['1.2', '1.3'],
      mergedCompetenceCode: '1.3',
    });
    if (europeanNumericLevel1_3) europeanNumericLevels.push(europeanNumericLevel1_3);

    const europeanNumericLevel3_1 = _buildEuropeanNumericLevelFromMergedCompetenceMarks({
      competenceMarks,
      competenceCodesToMerge: ['3.1', '3.2'],
      mergedCompetenceCode: '3.1',
    });
    if (europeanNumericLevel3_1) europeanNumericLevels.push(europeanNumericLevel3_1);

    if (_areAtLeastOneCompetenceByDomain(competenceMarks)) {
      const averageGlobalScore = Math.round(
        europeanNumericLevels.reduce((total, { level }) => total + level, 0) / europeanNumericLevels.length
      );
      europeanNumericLevels.push(
        new EuropeanNumericLevel({ domainCompetenceId: '5', competenceId: '3', level: averageGlobalScore })
      );
    }

    remove(europeanNumericLevels, ({ level }) => level === 0);

    return europeanNumericLevels;
  }
}

function _buildEuropeanNumericLevelFromMergedCompetenceMarks({
  competenceMarks,
  competenceCodesToMerge,
  mergedCompetenceCode,
}) {
  const foundCompetenceMarks = [];
  competenceCodesToMerge.forEach((competenceCodeToFind) => {
    const foundCompetenceMark = competenceMarks.find(({ competenceCode }) => competenceCode === competenceCodeToFind);
    if (foundCompetenceMark) foundCompetenceMarks.push(foundCompetenceMark);
  });

  const areAllCompetenceCodesToMergeFound = foundCompetenceMarks.length === competenceCodesToMerge.length;
  if (!areAllCompetenceCodesToMergeFound) return null;

  const level = Math.round(
    foundCompetenceMarks.reduce((total, { level }) => total + level, 0) / foundCompetenceMarks.length
  );
  return EuropeanNumericLevel.from({ competenceCode: mergedCompetenceCode, level });
}

function _areAtLeastOneCompetenceByDomain(competenceMarks) {
  return uniqBy(competenceMarks, 'areaCode').length === 5;
}

module.exports = EuropeanNumericLevelFactory;
