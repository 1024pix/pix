const areaDatasource = require('../datasources/airtable/area-datasource');
const competenceDatasource = require('../datasources/airtable/competence-datasource');
const CompetenceTree = require('../../domain/models/CompetenceTree');
const Competence = require('../../domain/models/Competence');
const Area = require('../../domain/models/Area');

module.exports = {

  get() {
    return areaDatasource.list()
      .then((areaDataObjects) => {

        return Promise.all(
          areaDataObjects.map((areaDataObject) => {

            return Promise.all(
              areaDataObject.competenceIds.map((competenceId) => {

                return competenceDatasource.get(competenceId)
                  .then((competenceDataObject) => {
                    return new Competence({
                      id: competenceDataObject.id,
                      name: competenceDataObject.title,
                      index: competenceDataObject.competenceCode,
                    });
                  });
              }))
              .then((competences) => {
                return new Area({
                  id: areaDataObject.id,
                  code: areaDataObject.code,
                  name: areaDataObject.name,
                  title: areaDataObject.title,
                  competences,
                });
              });
          }));
      })
      .then((areas) => {
        return new CompetenceTree({
          areas
        });
      });
  },

};
