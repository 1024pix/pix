export default function (server) {

  /*
   Seed your development database using your factories.
   This data will not be loaded in your tests.

   Make sure to define a factory for each model you want to create.
   */

  // assessments will create associated courses and challenges
  server.createList('assessment', 10);
}
