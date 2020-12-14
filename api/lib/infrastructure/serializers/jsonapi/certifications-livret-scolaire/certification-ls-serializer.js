const { Serializer } = require('jsonapi-serializer');

const attributes = [
  'firstName',
  'middleName',
  'thirdName',
  'lastName',
  'birthdate',
  'nationalStudentId',
  'status',
  'pixScore',
  'verificationCode',
  'date',
  'deliveredAt',
  'competenceResults',
  'certificationCenter',
];

module.exports = {
  serialize(certificate) {
    return new Serializer('certificationsResults', {
      attributes: ['certifications', 'competences' ],
      certificate: {
        attributes: [...attributes],
        competenceResults: {
          attributes: ['competence-id', 'level'],
        },

      },
      competences: {
        ref: 'id',
        attributes: ['name', 'area'],
        area: {
          ref: 'id',
          attributes: [ 'name'],
        },
      },
    }).serialize(certificate);
  },

};

