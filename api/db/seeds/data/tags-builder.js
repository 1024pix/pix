export default function tagsBuilder({ databaseBuilder }) {
  databaseBuilder.factory.buildTag({ id: 1, name: 'AGRICULTURE' });
  databaseBuilder.factory.buildTag({ id: 2, name: 'PUBLIC' });
  databaseBuilder.factory.buildTag({ id: 3, name: 'PRIVE' });
  databaseBuilder.factory.buildTag({ id: 4, name: 'POLE EMPLOI' });
  databaseBuilder.factory.buildTag({ id: 5, name: 'CFA' });
  databaseBuilder.factory.buildTag({ id: 6, name: 'AEFE' });
  databaseBuilder.factory.buildTag({ id: 7, name: 'MEDNUM' });
  databaseBuilder.factory.buildTag({ id: 8, name: 'COLLEGE' });
  databaseBuilder.factory.buildTag({ id: 9, name: 'LYCEE' });
};
