module.exports = function tagsBuilder({ databaseBuilder }) {
  databaseBuilder.factory.buildTag({ id: 1, name: 'AGRICULTURE' });
  databaseBuilder.factory.buildTag({ id: 2, name: 'PUBLIC' });
  databaseBuilder.factory.buildTag({ id: 3, name: 'PRIVE' });
  databaseBuilder.factory.buildTag({ id: 4, name: 'POLE EMPLOI' });
  databaseBuilder.factory.buildTag({ id: 5, name: 'CFA' });
};
