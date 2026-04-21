import { createServer } from '../../server.js';
import { createMaddoServer } from '../../server.maddo.js';

export const server = await createServer();
export const serverMaddo = await createMaddoServer();
