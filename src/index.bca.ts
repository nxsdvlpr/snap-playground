import {
  createAsymmetricSignature,
  AsymmetricPayload,
  createSymmetricSignature,
} from './utils/common';
import axios from 'axios';
import { formatISO } from 'date-fns';

const credentials = {
  name: 'BCA',
  clientId: 'bd183170f071491caa07292f9e1d97df',
  clientSecret: 'kb+MZCvvDrV+qfhkQiE5Bv5jaidr3cMvogTm7e88kro=',
  publicKey: '5cd56b2af8d64c14a8e690ea17063dd0',
  privateKey: 'ItwY9QFPiBtmTgEDp488Gw9eYRe7nLRAUNr+CL7rG4k=',
  partnerId: '55555',
  channelId: '95231',
};

const timestamp = formatISO(new Date());

const getSignature = async () => {
  return axios.post(
    'https://apidevportal.bi.go.id/snap/v1/api/v1.0/utilities/signature-auth',
    null,
    {
      headers: {
        'X-TIMESTAMP': timestamp,
        'X-CLIENT-KEY': credentials.clientId,
        Private_Key: credentials.privateKey,
        'Content-Type': 'application/json',
      },
    },
  );
};

const getToken = async (signature: string) => {
  return axios.post(
    'https://apidevportal.bi.go.id/snap/v1/api/v1.0/access-token/b2b',
    {
      grantType: 'client_credentials',
    },
    {
      headers: {
        'X-TIMESTAMP': timestamp,
        'X-CLIENT-KEY': credentials.clientId,
        'X-SIGNATURE': signature,
        'Content-Type': 'application/json',
      },
    },
  );
};

const requestInquiry = async (accessToken: string) => {
  const body = {
    partnerServiceId: '  88899',
    customerNo: '12345678901234567890',
    virtualAccountNo: '  08889912345678901234567890',
    txnDateInit: '20201231T235959Z',
    channelCode: 6011,
    language: 'ID',
    amount: {
      value: '12345678.00',
      currency: 'IDR',
    },
    hashedSourceAccountNo: 'abcdefghijklmnopqrstuvwxyz123456',
    sourceBankCode: '008',
    passApp: 'abcdefghijklmnopqrstuvwxyz',
    inquiryRequestId: 'abcdef-123456-abcdef',
    additionalInfo: {
      deviceId: '12345679237',
      channel: 'mobilephone',
    },
  };

  const timestamp = formatISO(new Date());

  const symmetricSignaturePayload = {
    method: 'POST',
    body: body,
    relativeUrl: '/snap/v1/api/v1.0/transfer-va/inquiry',
    timestamp: timestamp,
    accessToken: accessToken,
    clientSecret: credentials.clientSecret,
  };

  const symmetricSignaturePayloadString = JSON.stringify(
    symmetricSignaturePayload,
  );

  const symmetricSignature = createSymmetricSignature(
    symmetricSignaturePayload,
  );

  console.log('Symmetric Signature Payload:', symmetricSignaturePayload);
  console.log(
    'Symmetric Signature Payload String:',
    symmetricSignaturePayloadString,
  );
  console.log('Symmetric Signature:', symmetricSignature);

  const config = {
    headers: {
      'CHANNEL-ID': credentials.channelId,
      'X-PARTNER-ID': credentials.partnerId,

      // General
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-TIMESTAMP': timestamp,
      'X-SIGNATURE': symmetricSignature,
      'X-EXTERNAL-ID': `00000000000${new Date().getTime()}`,
    },
  };

  return axios.post(
    'https://apidevportal.bi.go.id/snap/v1/api/v1.0/transfer-va/inquiry',
    body,
    config,
  );
};

getSignature().then((res) => {
  console.log(res.data.signature);
  if (res.data.signature) {
    getToken(res.data.signature).then((res) => {
      console.log(res.data.accessToken);

      if (res.data.accessToken) {
        requestInquiry(res.data.accessToken).then((res) => {
          console.log(res.data);
        });
      }
    });
  }
});
