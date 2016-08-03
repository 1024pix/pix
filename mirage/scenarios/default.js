export default function (server) {

  /*
   Seed your development database using your factories.
   This data will not be loaded in your tests.

   Make sure to define a factory for each model you want to create.
   */

  server.createList('assessment', 2);
  server.createList('course', 3);
  server.createList('challenges', 10);

}
