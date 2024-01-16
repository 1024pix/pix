import Funzz from 'funzz';
import { createServer } from './server.js';
import * as dotenv from 'dotenv';

dotenv.config();

const server = await createServer();
Funzz(server);
