Ember-Cli-Mirage has no server

To debug a request, you can't Curl or POSTMAN an endpoint.

You have to launch the browser, and launch a plain old jquery request to the endpoint.

$.ajax({
   url: 'http://localhost:3000/api/courses',
   type: 'GET'
}).done(function( msg ) {
    console.log( JSON.stringify(msg, null, 2) );
});
