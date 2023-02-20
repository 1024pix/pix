import { Serializer } from 'jsonapi-serializer';

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

export default {
  serialize(certificate) {
    return new Serializer('certificationsResults', {
      attributes: ['certifications', 'competences'],
      certifications: {
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
          attributes: ['name'],
        },
      },
    }).serialize(certificate);
  },
};
