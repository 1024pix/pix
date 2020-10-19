/*

# Configuration des variables d'environnement pour l'intégration SAML

Pix (API) utilise les variables d'environnement suivantes pour configurer
l'intégration avec un fournisseur d'identité SAML :

## `SAML_SP_CONFIG`

Contient un JSON décrivant (au format attendu par `samlify`) la configuration
de Pix en tant que "Service provider".

Exemple de JSON (à mettre sur une seule ligne dans la variable d'environnement):

```
{
  "metadata": "<EntityDescriptor …></EntityDescriptor>",
  "encPrivateKey": "-----BEGIN RSA PRIVATE KEY-----\n…\n-----END RSA PRIVATE KEY-----\n",
  "relayState": "https://…"
}
```

Détails des clés du JSON (référence : https://samlify.js.org/#/configuration) :

  * `metadata`: métadonnées du _Service Provider_ qui seront .
    * Le fournisseur d'identité utilisera ces métadonnées (servies telles quelles
      sur `/api/saml/metadata.xml`pour accepter les demandes d'authentification
      de Pix et générer des assertions SAML.
    * L'implémentation SAML dans Pix (basée sur `samlify`) utilise également ces
      métadonnées pour se configurer.

  * `encPrivateKey`: clé privée associée au certificat contenu dans les métadonnées
    ci-dessus (élément X509Certificate).

  * `relayState`: paramètre qui sera ajouté aux demandes d'authentification envoyées
    par Pix au fournisseur d'identité. Dans le cadre du GAR, ce paramètre doit absolument
    contenir l'"URL de la ressource" (telle qu'indiquée dans la notice ScoLomFR)
    sous peine de faire échouer l'authentification.

## `SAML_IDP_CONFIG`

Un JSON également, utilisé cette fois pour configurer le modèle du fournisseur
d'identité utilisé par `samlify` pour générer des demandes d'authentification et
interpréter les assertions.

Exemple de JSON :

```
{
  "metadata":"<EntityDescriptor …><IDPSSODescriptor>…</IDPSSODescriptor></EntityDescriptor>",
}
```

On retrouve une clé `metadata` dans laquelle il faut inclure les métadonnées fournies par le
fournisseur d'identité. Par exemple pour le GAR en pré-production elles sont disponibles
à l'adresse https://idp-auth.partenaire.test-gar.education.fr/idp/metadata.

Ces métadonnées sont utilisées pour configurer `samlify` ; les éléments importants sont les
certificats et l'adresse du _binding_ `HTTP-Redirect` du `SingleSignOnService`.

Si le XML des métadonnées est trop gros pour tenir dans la variable d'environnement, il est donc
permis de ne garder que ces éléments.

Les autres clés du JSON permettent de configurer `samlify` (cf. https://samlify.js.org/#/configuration)
pour les paramètres qui ne pourraient pas être déduits des métadonnées.

Par exemple, nous avons constaté que pour l'intégration avec https://samlidp.io il fallait ajouter
les options suivantes :

```
  "isAssertionEncrypted": true,
  "messageSigningOrder": "encrypt-then-sign"
```

Pour le GAR en revanche, l'intégration semble fonctionner avec uniquement `metadata`.

## `SAML_ATTRIBUTE_MAPPING`

Cette variable contient encore un JSON, qui permet de configurer un mapping entre les attributs
utilisateur fournis par le fournisseur d'identité, et les champs du modèle `User` de Pix.

Exemple :

```
{
  samlId: 'IDO',
  firstName: 'PRE',
  lastName: 'NOM',
}
```

# Génération du certificat de _service provider_

```
openssl genrsa -out private.key 1024
openssl req -new -x509 -key privatekey.pem -out publickey.cer -days 365
```

Le contenu de `publickey.cer` (sans les lignes `BEGIN CERTIFICATE` ni `END CERTIFICATE`)
peut être utilisé dans l'élément `X509Certificate` des métadonnées de _service provider_.

Le contenu de privatekey.pem (en gardant les lignes `BEGIN…` et `END…`) est à copier dans
la propriété `encPrivateKey` de `SAML_SP_CONFIG`.

# Exemple de métadonnées de _service provider_

```
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" entityID="https://pix-app-integration-pr243.scalingo.io/api/saml/metadata.xml" ID="http___pix_app_integration_pr243_api_saml_metadata_xml">
  <SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <KeyDescriptor>
      <ds:KeyInfo>
        <ds:X509Data>
          <ds:X509Certificate>MIICCzCCAXQCCQD2MlHh/QmGmjANBgkqhkiG9w0BAQsFADBKMQswCQYDVQQGEwJGUjEPMA0GA1UECAwGRlJBTkNFMQ4wDAYDVQQHDAVQQVJJUzEMMAoGA1UECgwDUElYMQwwCgYDVQQLDANERVYwHhcNMTgxMDIyMTQ1MjQ5WhcNMTkxMDIyMTQ1MjQ5WjBKMQswCQYDVQQGEwJGUjEPMA0GA1UECAwGRlJBTkNFMQ4wDAYDVQQHDAVQQVJJUzEMMAoGA1UECgwDUElYMQwwCgYDVQQLDANERVYwgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBAMbY6nVh9GjtlyIm6KxQ8p+2dOE+wWTRq6Kg/481ovarmJWyW10LgZirfUvKrLqK5OdJ9+svOl2/JokF8ckOQmR/VWtuwcb6EvEfIMgLwQGZYKIPrdGN56BcY0+aprp8SIMfsrtR+NrWp0QJIRc6aWd5WWQybKNwFeGz2WIWzQXRAgMBAAEwDQYJKoZIhvcNAQELBQADgYEACRHKc85tMIANiX+4agaZFPluqoo2cjk6ph6FAigNuIZZr6mEAVCUh8Pmh5fQzUP9vl6Baqw+x5RBIw919OwzwcMCN3hNTi2k4oO4Kua/DJ/1fWJRqfnAZU3M6Y7Tfjfg7yhSkHuPYVew4SHMtWSYEkP0opnxjXIiBWfhpDY8EuE=</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
      <EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#aes256-cbc"/>
      <EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#aes128-cbc"/>
      <EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#tripledes-cbc"/>
    </KeyDescriptor>
    <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
    <SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://pix-app-integration-pr243.scalingo.io/api/saml/logout"/>
    <AssertionConsumerService index="1" isDefault="true" Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://pix-app-integration-pr243.scalingo.io/api/saml/assert"/>
  </SPSSODescriptor>
</EntityDescriptor>
```

Éléments notables / à personnaliser :
  * L'attribut `entityID` de `EntityDescriptor` sera utilisé pour identifier ce _service provider_
    au sein du fournisseur d'identité. Le GAR exige que cet attribut ait pour valeur l'URL
    où sont servies les métadonnées, soit https://…/api/saml/metadata.xml pour une instance
    Pix.
  * Le certificat X.509 dans `X509Certificate` doit correspondre à la clé privée contenue dans
    `encPrivateKey` (voir plus haut comment le générer). Il faut bien entendu utiliser un
    couple certificat/clé privée différent entre l'intégration et la production.
  * L'attribut `Location` de `AssertionConsumerService` indique au fournisseur d'identité
    où poster les assertions. Il doit correspondre à l'URL de l'application cible et se
    terminer par `/api/saml/assert`.
  * De même l'attribut `Location` de `SingleLogoutService` désigne le service de consommation
    de requêtes de déconnexion, mais il n'est pas actuellement implémenté.

# Utilisation du script `make-saml-env.js`

La syntaxe d'une valeur de variable d'environnement contenant du XML à
l'intérieur d'un object JSON étant délicate à maintenir, ce script permet de
générer les valeurs de `SAML_SP_CONFIG` et `SAML_IDP_CONFIG` à partir de
fichiers XML.

Le mode d'utilisation est le suivant :
  * Créer dans le répertoire courant :
    * un fichier `metadata_sp.xml` contenant les métadonnées du _service provider_ (voir plus haut) ;
    * un fichier `metadata_idp.xml` contenant les métadonnées de l'_identity provider_ ;
    * un ficher `privatekey.pem` contenant la clé privée du certificat du _service provider_.
  * Lancer le script `make-saml-env.js` : deux lignes (un peu longues…) sont générées sur
    la console ;
  * Si besoin, ajouter les options nécessaires dans le JSON généré (ex. pour le GAR, `relayState`) ;
  * Copier ces deux lignes dans la configuration de variables d'environnement de l'application
    cible.

*/

const { readFile } = require('fs').promises;

function readXml(filename) {
  return readFile(filename, 'utf-8').replace(/^\s+|\s+$|\n/gm, '');
}

console.log(`SAML_SP_CONFIG=${JSON.stringify({
  metadata: readXml('metadata_sp.xml'),
  encPrivateKey: readFile('./privatekey.pem', 'utf-8'),
})}`);

console.log(`SAML_IDP_CONFIG=${JSON.stringify({
  metadata: readXml('metadata_idp.xml'),
})}`);
