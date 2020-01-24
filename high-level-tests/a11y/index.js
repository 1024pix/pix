const pa11y = require('pa11y');

async function runPageTest(name, url, options = {}) {
  console.log('---------------------------------------');

  const result = await pa11y(url, options);
  if (result.issues.length === 0 ){
    console.log(`La page ${name} est accessible ! `);
  } else {
    console.log(`La page ${name} est à améliorer ! `);
    console.log(result);
  }
}

async function runPa11y() {
  try {
    await runPageTest('Inscription', 'http://localhost:4200/inscription');
    await runPageTest('Connexion', 'http://localhost:4200/connexion');
    await runPageTest('Profil', 'http://localhost:4200/', {
      actions: [
        'set field #login to userpix1@example.net',
        'set field #password to pix123',
        'click element .button',
        'wait for path to be /profil'
      ]
    });
    await runPageTest('Epreuve', 'http://localhost:4200/', {
      actions: [
        'set field #login to userpix1@example.net',
        'set field #password to pix123',
        'click element .button',
        'navigate to http://localhost:4200/competences/recs42SHljR9LJg47/evaluer',
        'wait for path to not be /competences/recs42SHljR9LJg47/evaluer'
      ]
    });
  } catch (error) {

  }
}

runPa11y();
