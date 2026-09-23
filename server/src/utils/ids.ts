import { nanoid } from 'nanoid';
export const newId = (prefix = '') => `${prefix}${nanoid(14)}`;
