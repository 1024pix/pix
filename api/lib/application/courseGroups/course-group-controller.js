const courseGroup = require('../../domain/models/referential/course-group');

module.exports = {

  list() {

    const courseGroups = [
      new courseGroup({ id: 'serie1' }),
      new courseGroup({ id: 'serie2' }),
      new courseGroup({ id: 'serie3' })
    ];
    return courseGroups;
  }
};
