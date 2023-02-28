import { readFileSync } from 'fs';
import crypto, { createHash, createHmac } from 'crypto';
import {  resolve } from 'path';
import * as base64 from 'base64-js'

export type AsymmetricPayload = {
  timestamp?: string,
  clientId?: string,
}

export type SymmetricPayload = {
  method: string;
  body?: Record<string, any>;
  relativeUrl: string;
  timestamp: string;
  accessToken: string;
  clientSecret: string;
};


export const encodeRFC3986URIComponent = (str: string) =>
  str.replace(
    /[!,'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );

export const readKeyFile = (path: string) => {
  return readFileSync(resolve(__dirname, '../', path), {
    encoding: 'utf8',
    flag: 'r',
  })
}

export const createAsymmetricSignature = (payload: AsymmetricPayload, privateKeyPath: string) => {
  const key = readKeyFile(privateKeyPath);
  const stringToSign = `${payload.clientId}|${payload.timestamp}`;
  const signature = crypto.sign("sha256", Buffer.from(stringToSign), key);
  
  return signature.toString("base64")
};

export const createSymmetricSignature = (payload: SymmetricPayload) => {
  const bodyString =
    typeof payload.body === 'object' ? JSON.stringify(payload.body) || '' : '';

  const hash = createHash('SHA256').update(bodyString).digest('hex');

  const relativeUrl = encodeRFC3986URIComponent(payload.relativeUrl);

  const stringToSign = `${payload.method}:${relativeUrl}:${payload.accessToken}:${hash}:${payload.timestamp}`;

  return createHmac('SHA512', payload.clientSecret)
    .update(stringToSign)
    .digest('base64');
};

export const addLefSpace = (text: string, lengthNeed: number = 0) => {
  let letSpace = ''
  for (let i = 1; i <= lengthNeed - text.length; i++) {
    letSpace += ' '
  }
  return letSpace + text
}

export const formatPhone = (phone: string) =>
  phone
    ?.trim()
    .replace(/^0(\d+)/g, '62$1')
    .replace(/^\+?(\d+)/g, '$1');

export const prettyJSON = (obj: any) => {
  return JSON.stringify(obj, null, 2);
}

export const zeroLeadPhoneNumber = (phone: string) =>
  phone?.trim().replace(/^\+?62/, '0');

export const isVerified = (payload: AsymmetricPayload, signature: string, publicKeyPath: string) => {
  const publicKey = readKeyFile(publicKeyPath);
  const stringToSign = `${payload.clientId}|${payload.timestamp}`;
  const signatureBuffer = base64.toByteArray(signature)

  return crypto.verify(
    "sha256",
    Buffer.from(stringToSign),
    publicKey,
    signatureBuffer
  );
}