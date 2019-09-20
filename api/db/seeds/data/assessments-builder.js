module.exports = function assessmentsBuilder({ databaseBuilder }) {

  // PLACEMENT
  databaseBuilder.factory.buildAssessment({
    id: 1,
    courseId: 'recyochcrrSOALQPS',
    createdAt: new Date('2018-02-15T15:00:34Z'),
    updatedAt: new Date('2018-02-15T15:00:34Z'),
    userId: 1,
    type: 'PLACEMENT',
    state: 'completed',
  });
  databaseBuilder.factory.buildAssessment({
    id: 2,
    courseId: 'rec43mpMIR5dUzdjh',
    createdAt: new Date('2018-02-15T15:00:34Z'),
    updatedAt: new Date('2018-02-15T15:00:34Z'),
    userId: 1,
    type: 'PLACEMENT',
    state: 'completed'
  });
  databaseBuilder.factory.buildAssessment({
    id: 3,
    courseId: 'recNPB7dTNt5krlMA',
    createdAt: new Date('2018-02-15T15:03:18Z'),
    updatedAt: new Date('2018-02-15T15:03:18Z'),
    userId: 1,
    type: 'PLACEMENT',
    state: 'completed'
  });
  databaseBuilder.factory.buildAssessment({
    id: 4,
    courseId: 'recR9yCEqgedB0LYQ',
    createdAt: new Date('2018-02-15T15:04:26Z'),
    updatedAt: new Date('2018-02-15T15:04:26Z'),
    userId: 1,
    type: 'PLACEMENT',
    state: 'completed'
  });
  databaseBuilder.factory.buildAssessment({
    id: 5,
    courseId: 'rec5gEPqhxYjz15eI',
    createdAt: new Date('2018-02-15T15:07:02Z'),
    updatedAt: new Date('2018-02-15T15:07:02Z'),
    userId: 1,
    type: 'PLACEMENT',
    state: 'completed'
  });
  databaseBuilder.factory.buildAssessment({
    id: 8,
    courseId: 'rec43mpMIR5dUzdjh',
    createdAt: new Date('2018-01-15T15:00:34Z'),
    updatedAt: new Date('2018-01-15T15:00:34Z'),
    userId: 1,
    type: 'PLACEMENT',
    state: 'started'
  });

  // CERTIFICATION
  databaseBuilder.factory.buildAssessment({
    id: 6,
    courseId: '1',
    createdAt: new Date('2018-02-15T15:14:46Z'),
    updatedAt: new Date('2019-02-15T15:14:46Z'),
    userId: 1,
    type: 'CERTIFICATION',
    state: 'started'
  });
  databaseBuilder.factory.buildAssessment({
    id: 11,
    courseId: '1',
    createdAt: new Date('2018-02-15T15:14:50Z'),
    updatedAt: new Date('2018-02-15T15:14:50Z'),
    userId: 1,
    type: 'CERTIFICATION',
    state: 'completed'
  });
  databaseBuilder.factory.buildAssessment({
    id: 12,
    courseId: '1',
    createdAt: new Date('2018-02-15T15:14:51Z'),
    updatedAt: new Date('2019-02-15T15:14:51Z'),
    userId: 1,
    type: 'CERTIFICATION',
    state: 'started'
  });
  
  databaseBuilder.factory.buildAssessment({
    id: 7,
    courseId: '2',
    createdAt: new Date('2018-04-27T10:10:52Z'),
    updatedAt: new Date('2018-04-27T10:10:52Z'),
    userId: 1,
    type: 'CERTIFICATION',
    state: 'completed'
  });

  databaseBuilder.factory.buildAssessment({
    id: 9,
    courseId: '3',
    createdAt: new Date('2018-01-15T15:14:46Z'),
    updatedAt: new Date('2018-01-15T15:14:46Z'),
    userId: 1,
    type: 'CERTIFICATION',
    state: 'started'
  });
};
