/* eslint-env node */
'use strict';

module.exports = function(/* environment, appConfig */) {
  // See https://github.com/san650/ember-web-app#documentation for a list of
  // supported properties

  return {
    name: "power-admin",
    short_name: "power-admin",
    description: "Administrate the Pix platform",
    start_url: "https://pix-admin.herokuapp.com",
    display: "standalone",
    background_color: "#456AF6",
    theme_color: "#456AF6",
    icons: [
      {
        "src": "/logo-pix_192x192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "/logo-pix_512x512.png",
        "sizes": "512x512",
        "type": "image/png"
      },
    ],
    ms: {
      tileColor: '#fff'
    },

  };
}
