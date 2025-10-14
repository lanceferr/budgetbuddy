import { createHmac, randomBytes } from 'node:crypto';

const PEPPER = process.env.AUTH_SECRET ?? 'change-me';

export const random = (size = 32) => randomBytes(size).toString('base64url');

export const authentication = (salt: string, password: string) => {

  return createHmac('sha256', [salt, PEPPER].join('/'))

    .update(password)
    .digest('hex');
	
};