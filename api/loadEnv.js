// As early as possible in your application, require and configure dotenv.
// https://www.npmjs.com/package/dotenv#usage
const fs = require('fs');
const path = require('path');

// load default configuration
const dotenv = require('dotenv');
dotenv.config();

// override configuration for cypress env
const cypressEnvPath = path.join(process.cwd(), '.env.cypress');
if (process.env.NODE_ENV === 'cypress' && fs.existsSync(cypressEnvPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(cypressEnvPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  } 
}
