import { promises } from 'fs';

const { readFile: readFile } = promises;

function readXml(filename) {
  return readFile(filename, 'utf-8').replace(/^\s+|\s+$|\n/gm, '');
}

console.log(
  `SAML_SP_CONFIG=${JSON.stringify({
    metadata: readXml('metadata_sp.xml'),
    encPrivateKey: readFile('./privatekey.pem', 'utf-8'),
  })}`
);

console.log(
  `SAML_IDP_CONFIG=${JSON.stringify({
    metadata: readXml('metadata_idp.xml'),
  })}`
);
