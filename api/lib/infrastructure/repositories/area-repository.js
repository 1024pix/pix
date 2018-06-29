const Area = require('../../domain/models/Area');
const areaDatasource = require('../datasources/airtable/area-datasource');

module.exports = {

  list() {
    return areaDatasource.list()
      .then((areaDataObjects) => {

        return areaDataObjects.map((areaDataObject) => {
          return new Area({
            id: areaDataObject.id,
            code: areaDataObject.code,
            name: areaDataObject.name,
            title: areaDataObject.title,
          });
        });
      });
  },
};
