const areaDatasource = require('../datasources/airtable/area-datasource');
const competenceDatasource = require('../datasources/airtable/competence-datasource');
const CompetenceTree = require('../../domain/models/CompetenceTree');
const Competence = require('../../domain/models/Competence');
const Area = require('../../domain/models/Area');

function _buildAreaFromDataObjectAndCompetences(areaDataObject) {
  const partialConstructorForPromise = (competences) => {
    return new Area({
      id: areaDataObject.id,
      code: areaDataObject.code,
      name: areaDataObject.name,
      title: areaDataObject.title,
      competences,
    });
  };
  return partialConstructorForPromise;
}

function _getCompetencesFromIds(competenceIds) {
  return Promise.all(
    competenceIds.map((competenceId) => {
      return competenceDatasource.get(competenceId)
        .then(_buildCompetenceFromDataObject);

    }));
}

function _buildCompetenceFromDataObject(competenceDataObject) {
  return new Competence({
    id: competenceDataObject.id,
    name: competenceDataObject.title,
    index: competenceDataObject.competenceCode,
  });
}

module.exports = {

  get() {
    return areaDatasource.list()
      .then((areaDataObjects) => {

        const getAreasPromises = areaDataObjects.map((areaDataObject) => {
          return _getCompetencesFromIds(areaDataObject.competenceIds)
            .then(_buildAreaFromDataObjectAndCompetences(areaDataObject));
        });

        return Promise.all(getAreasPromises);
      })
      .then((areas) => {
        return new CompetenceTree({
          areas,
        });
      });
  },
};
