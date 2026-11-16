import type { Frameworks } from './models/Frameworks.js';
import type { AutoJuryCommentKeys } from './models/JuryComment.js';

export type Framework = (typeof Frameworks)[keyof typeof Frameworks];
export type AutoJuryCommentKey = (typeof AutoJuryCommentKeys)[keyof typeof AutoJuryCommentKeys];
