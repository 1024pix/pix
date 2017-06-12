export default function(server) {

  //console.log('je suis passé dans le scenario');

  const courses = server.createList('course', 2, {name: 'course name'});
  server.createList('courseGroup', 3, {courses});

}
