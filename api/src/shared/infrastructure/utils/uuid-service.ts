import { randomUUID } from 'node:crypto';

export interface uuidInterface {
    getRandomUUID(): string;
}

export class uuidService implements uuidInterface {
    getRandomUUID(): string {
        return randomUUID()
    }
}

