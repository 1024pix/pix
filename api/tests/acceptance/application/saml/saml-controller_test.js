import _ from 'lodash';
import { databaseBuilder, expect, sinon } from '../../../test-helper';
import samlify from 'samlify';
import createServer from '../../../../server';
import settings from '../../../../lib/config';

const testCertificate = `MIICCzCCAXQCCQD2MlHh/QmGmjANBgkqhkiG9w0BAQsFADBKMQswCQYDVQQGEwJG
UjEPMA0GA1UECAwGRlJBTkNFMQ4wDAYDVQQHDAVQQVJJUzEMMAoGA1UECgwDUElY
MQwwCgYDVQQLDANERVYwHhcNMTgxMDIyMTQ1MjQ5WhcNMTkxMDIyMTQ1MjQ5WjBK
MQswCQYDVQQGEwJGUjEPMA0GA1UECAwGRlJBTkNFMQ4wDAYDVQQHDAVQQVJJUzEM
MAoGA1UECgwDUElYMQwwCgYDVQQLDANERVYwgZ8wDQYJKoZIhvcNAQEBBQADgY0A
MIGJAoGBAMbY6nVh9GjtlyIm6KxQ8p+2dOE+wWTRq6Kg/481ovarmJWyW10LgZir
fUvKrLqK5OdJ9+svOl2/JokF8ckOQmR/VWtuwcb6EvEfIMgLwQGZYKIPrdGN56Bc
Y0+aprp8SIMfsrtR+NrWp0QJIRc6aWd5WWQybKNwFeGz2WIWzQXRAgMBAAEwDQYJ
KoZIhvcNAQELBQADgYEACRHKc85tMIANiX+4agaZFPluqoo2cjk6ph6FAigNuIZZ
r6mEAVCUh8Pmh5fQzUP9vl6Baqw+x5RBIw919OwzwcMCN3hNTi2k4oO4Kua/DJ/1
fWJRqfnAZU3M6Y7Tfjfg7yhSkHuPYVew4SHMtWSYEkP0opnxjXIiBWfhpDY8EuE=`;

const testCertificatePrivateKey = `-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQDG2Op1YfRo7ZciJuisUPKftnThPsFk0auioP+PNaL2q5iVsltd
C4GYq31Lyqy6iuTnSffrLzpdvyaJBfHJDkJkf1VrbsHG+hLxHyDIC8EBmWCiD63R
jeegXGNPmqa6fEiDH7K7Ufja1qdECSEXOmlneVlkMmyjcBXhs9liFs0F0QIDAQAB
AoGALb+eQZ9lwfZXvS3CflKpX4F05pWvnOh4WpQ799DZS3MzSc2dI40QJfXef9+D
We+2tlfYSC23efYOgZvygtVbBKfpj4ea3wyWJItRJRefipvad8suR8lPHurOJ9kN
zLEbUoEqQOaI3yy0H16J4MnbC2ffZgx1Yg5UxfaMzEJ/ebkCQQD2EWA/7rmdKcJU
5Ot3okytar0ov+UWTlz5hPXf1ul5Z5iLU6GT/kfRJV9kwN75hV7fqi1k8CO5hSoH
MDlSkuBTAkEAzt+b67gUVVF6joJZUptKRhjxijnnCoOhAZkiswH5kv2mfO2vEg9C
R5CycVoEX0A9HakjHDUuUtqrmOtCYcHMywJBALeyHxV7RQwD6bRwtSw5eF6Z6Z7r
Kr1tQNFxphA1o1RjtyiEBYKy+LA04zMXHR5Pp5T3uS26bCEKPWbiZFi1l0sCQQC5
SEr1BuynMY+r3ZE0zELsn2COJagJobTtooMSgr1N6oJXt+WqLiJ1yGIZ5b6utPFI
BHmexP7VVGaGUock2RebAkBAwdjk8QTnAUQNO/3jgV+D/+w8C1j3KWq5OvUBihdk
JYsCGAGZJwfckqDk8zQZ7v4gxEvG9LS+1DUsX8Rb24Of
-----END RSA PRIVATE KEY-----`;

const spMetadata = `<?xml version="1.0"?>
  <EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" entityID="http://localhost:3000/api/saml/metadata.xml" ID="http___localhost_8080_gar_metadata_xml">
    <SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
      <KeyDescriptor>
        <ds:KeyInfo>
          <ds:X509Data>
            <ds:X509Certificate>${testCertificate}</ds:X509Certificate>
          </ds:X509Data>
        </ds:KeyInfo>
        <EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#aes256-cbc"/>
        <EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#aes128-cbc"/>
        <EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#tripledes-cbc"/>
      </KeyDescriptor>
      <SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="http://localhost:3000/api/saml/notifylogout"/>
      <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
      <AssertionConsumerService index="1" isDefault="true" Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="http://localhost:3000/api/saml/assert"/>
      <AttributeConsumingService index="1">
        <ServiceName>Default Service</ServiceName>
        <RequestedAttribute FriendlyName="eduPersonPrincipalName" Name="urn:oid:1.3.6.1.4.1.5923.1.1.1.6" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri"/>
        <RequestedAttribute FriendlyName="mail" Name="urn:oid:0.9.2342.19200300.100.1.3" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri"/>
        <RequestedAttribute FriendlyName="displayName" Name="urn:oid:2.16.840.1.113730.3.1.241" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri"/>
      </AttributeConsumingService>
    </SPSSODescriptor>
  </EntityDescriptor>`;

const idpMetadata = `<?xml version="1.0"?>
  <md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" xmlns:mdattr="urn:oasis:names:tc:SAML:metadata:attribute" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:shibmd="urn:mace:shibboleth:metadata:1.0" xmlns:mdui="urn:oasis:names:tc:SAML:metadata:ui" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" entityID="https://pixpoc.samlidp.io/saml2/idp/metadata.php">
    <md:IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
      <md:KeyDescriptor use="signing">
        <ds:KeyInfo>
          <ds:X509Data>
            <ds:X509Certificate>${testCertificate}</ds:X509Certificate>
          </ds:X509Data>
        </ds:KeyInfo>
      </md:KeyDescriptor>
      <md:KeyDescriptor use="encryption">
        <ds:KeyInfo>
          <ds:X509Data>
            <ds:X509Certificate>${testCertificate}</ds:X509Certificate>
          </ds:X509Data>
        </ds:KeyInfo>
      </md:KeyDescriptor>
      <md:NameIDFormat>urn:oasis:names:tc:SAML:2.0:nameid-format:transient</md:NameIDFormat>
      <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://pixpoc.samlidp.io/saml2/idp/SSOService.php"/>
      <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://pixpoc.samlidp.io/saml2/idp/SSOService.php"/>
    </md:IDPSSODescriptor>
  </md:EntityDescriptor>`;

const idpConfig = {
  metadata: idpMetadata,
  isAssertionEncrypted: false,
  privateKey: testCertificatePrivateKey,
  wantMessageSigned: false,
};

const spConfig = {
  metadata: spMetadata,
  encPrivateKey: testCertificatePrivateKey,
};

describe('Acceptance | Controller | saml-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();

    sinon.stub(settings.saml, 'spConfig').value(spConfig);
    sinon.stub(settings.saml, 'idpConfig').value(idpConfig);
    sinon.stub(settings.saml, 'attributeMapping').value({
      samlId: 'IDO',
      firstName: 'PRE',
      lastName: 'NOM',
    });
  });

  describe('GET /api/saml/metadata.xml', function () {
    const options = {
      method: 'GET',
      url: '/api/saml/metadata.xml',
    };

    it('should return SAML Service Provider metadata', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.equal(spMetadata);
      expect(response.headers['content-type']).to.equal('application/xml');
    });
  });

  describe('GET /api/saml/login', function () {
    const options = {
      method: 'GET',
      url: '/api/saml/login',
    };

    it('should redirect to IDP when login requested', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(302);
      expect(response.headers['location']).to.have.string(
        'https://pixpoc.samlidp.io/saml2/idp/SSOService.php?SAMLRequest='
      );
    });
  });

  describe('POST /api/saml/assert', function () {
    // Uses samlify to create a valid SAML response
    async function buildLoginResponse(attributes) {
      const identityProvider = samlify.IdentityProvider(idpConfig);
      const serviceProvider = samlify.ServiceProvider(spConfig);

      const tempSandbox = sinon.createSandbox();

      try {
        // The IDP side of the samlify API is not complete. There does not seem
        // to be a sane way to inject attributes into a SAML response, so we have
        // to hack around it.
        tempSandbox.stub(samlify.SamlLib.defaultLoginResponseTemplate, 'context').value(
          samlify.SamlLib.defaultLoginResponseTemplate.context.replace(
            '{AttributeStatement}',
            `
          <saml2:AttributeStatement xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">
            ${_.map(
              attributes,
              (value, key) => `<saml2:Attribute Name="${key}">
                                                 <saml2:AttributeValue>${value}</saml2:AttributeValue>
                                               </saml2:Attribute>`
            ).join('\n')}
          </saml2:AttributeStatement>`
          )
        );

        return identityProvider.createLoginResponse(
          serviceProvider,
          null, // requestInfo
          'post'
        );
      } finally {
        tempSandbox.restore();
      }
    }

    const firstName = 'Saml';
    const lastName = 'Jackson';
    const samlId = 'IDO-for-saml-jackson';

    it('should return externalUser idToken if the user does not a have an account yet', async function () {
      // given
      const validSamlResponse = await buildLoginResponse({
        IDO: samlId,
        NOM: lastName,
        PRE: firstName,
      });

      // when
      const firstVisitResponse = await server.inject({
        method: 'POST',
        url: '/api/saml/assert',
        payload: {
          SAMLResponse: validSamlResponse.context,
        },
      });

      // then
      expect(firstVisitResponse.statusCode).to.equal(302);
      expect(firstVisitResponse.headers.location).to.match(/^\/campagnes\?externalUser=[-_a-zA-Z0-9.]+$/);
    });

    it('should return an accessToken if the user already exists', async function () {
      // given
      const validSamlResponse = await buildLoginResponse({
        IDO: samlId,
        NOM: lastName,
        PRE: firstName,
      });
      const userId = databaseBuilder.factory.buildUser({
        firstName,
        lastName,
        samlId,
        cgu: false,
      }).id;
      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
        externalIdentifier: samlId,
        userId,
      });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/saml/assert',
        payload: {
          SAMLResponse: validSamlResponse.context,
        },
      });

      // then
      expect(response.statusCode).to.equal(302);
      expect(response.headers.location).to.match(/^\/connexion\/gar#[-_a-zA-Z0-9.]+$/);
    });
  });
});
