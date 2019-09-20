const moment = require('moment');

module.exports = function assessmentResultsBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildAssessmentResult({
    id: 1,
    createdAt: moment().subtract(7, 'day').add(1, 'hour').toDate(),
    emitter: 'PIX-ALGO',
    commentForJury: 'Computed',
    status: 'validated',
    assessmentId: 1,
    level: 5,
    pixScore: 44
  });
  databaseBuilder.factory.buildAssessmentResult({
    id: 2,
    createdAt: new Date('2018-02-15T15:00:34Z'),
    emitter: 'PIX-ALGO',
    commentForJury: 'Computed',
    status: 'validated',
    assessmentId: 2,
    level: 2,
    pixScore: 23
  });
  databaseBuilder.factory.buildAssessmentResult({
    id: 3,
    createdAt: new Date('2018-02-15T15:03:18Z'),
    emitter: 'PIX-ALGO',
    commentForJury: 'Computed',
    status: 'validated',
    assessmentId: 3,
    level: 8,
    pixScore: 47
  });
  databaseBuilder.factory.buildAssessmentResult({
    id: 4,
    createdAt: new Date('2018-02-15T15:04:26Z'),
    emitter: 'PIX-ALGO',
    commentForJury: 'Computed',
    status: 'validated',
    assessmentId: 4,
    level: 4,
    pixScore: 34
  });
  databaseBuilder.factory.buildAssessmentResult({
    id: 5,
    createdAt: moment().subtract(1, 'day').toDate(),
    emitter: 'PIX-ALGO',
    commentForJury: 'Computed',
    status: 'validated',
    assessmentId: 5,
    level: 5,
    pixScore: 48
  });
  databaseBuilder.factory.buildAssessmentResult({
    id: 6,
    createdAt: new Date('2018-02-15T15:14:46Z'),
    emitter: 'PIX-ALGO',
    commentForJury: 'Computed',
    status: 'validated',
    assessmentId: 11,
    level: 0,
    pixScore: 157
  });
  databaseBuilder.factory.buildAssessmentResult({
    id: 7,
    createdAt: new Date('2018-04-27T10:11:02Z'),
    emitter: 'PIX-ALGO',
    commentForJury: 'Computed',
    status: 'validated',
    assessmentId: 7,
    level: -1,
    pixScore: 0
  });
  databaseBuilder.factory.buildAssessmentResult({
    id: 9,
    createdAt: new Date('2018-04-28T09:17:41Z'),
    emitter: 'Benoit',
    commentForJury: 'Ceci est un commentaire jury à destination du Jury. Le Lorem Ipsum est simplement du faux texte ' +
      'employé dans la composition et la mise en page avant impression. Le Lorem Ipsum est le faux texte standard de ' +
      'l\'imprimerie depuis les années 1500, quand un peintre anonyme assembla ensemble des morceaux de texte pour ' +
      'réaliser un livre spécimen de polices de texte.',
    commentForOrganization: 'Ceci est un commentaire jury à destination de l\'organisation. Le Lorem Ipsum est ' +
      'simplement du faux texte employé dans la composition et la mise en page avant impression. Le Lorem Ipsum est le' +
      ' faux texte standard de l\'imprimerie depuis les années 1500, quand un peintre anonyme assembla ensemble des' +
      ' morceaux de texte pour réaliser un livre spécimen de polices de texte.',
    commentForCandidate: 'Ceci est un commentaire jury à destination du candidat. Le Lorem Ipsum est simplement du faux ' +
      'texte employé dans la composition et la mise en page avant impression. Le Lorem Ipsum est le faux texte standard de ' +
      'l\'imprimerie depuis les années 1500, quand un peintre anonyme assembla ensemble des morceaux de texte pour ' +
      'réaliser un livre spécimen de polices de texte.',
    status: 'rejected',
    assessmentId: 7,
    level: -1,
    pixScore: 0
  });
};
