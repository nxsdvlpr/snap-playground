import {
  createAsymmetricSignature,
  AsymmetricPayload,
  createSymmetricSignature,
  addLefSpace,
  zeroLeadPhoneNumber,
  formatPhone,
  prettyJSON,
} from './utils/common'
import axios from 'axios'
import { formatISO } from 'date-fns'

const customerPhone = '6281510549695'
// const endpoint = 'http://localhost:8066/openapi/v1.0'
const inquiryRequestId = '20230207173714203812040334785983475973'
const endpoint = 'https://api-dev.rata-pay.com/openapi/v1.0'

// const credentials = {
//   name: 'BCA',
//   clientId: 'e7c0d9b584ce6fc5933466a15fa208b3',
//   clientSecret: '5bde9a84d3c00749fab56038fbdd1644ec107651',
//   partnerId: '14507',
//   channelId: '95231',
// }

const credentials = {
  name: 'BI',
  clientId: '7720d0e22779e41aaca4064420bf7448',
  clientSecret: '7f531f962abec0bdb88eee4602ce9dcc14f04bf2',
  partnerId: '14507',
  channelId: '95233',
}

const getToken = async (clientId: string) => {
  const timestamp = formatISO(new Date())

  const payload: AsymmetricPayload = {
    timestamp: timestamp,
    clientId: clientId,
  }

  const signature = createAsymmetricSignature(
    payload,
    '../keys.bi/private-key.pem'
  )

  console.log('signature: ', signature)
  console.log('payload: ', payload)

  return axios.post(`${endpoint}/access-token/b2b`, {
      grantType: 'client_credentials',
    },
    {
      headers: {
        'X-TIMESTAMP': payload.timestamp,
        'X-CLIENT-KEY': payload.clientId,
        'X-SIGNATURE': signature,
        'Content-Type': 'application/json',
      },
    }
  )
}

const requestPayment = async (accessToken: string) => {
  const partnerServiceId = addLefSpace(credentials.partnerId, 8)
  const customerNo = zeroLeadPhoneNumber(customerPhone)

  const body = {
    partnerServiceId: partnerServiceId,
    customerNo: customerNo,
    virtualAccountNo: partnerServiceId + customerNo,
    virtualAccountName: 'Sarah Melani',
    virtualAccountEmail: 'Sarahmelani11@gmail.com',
    virtualAccountPhone: '6281754863725',
    trxId: '',
    paymentRequestId: inquiryRequestId,
    channelCode: 6014,
    hashedSourceAccountNo: '',
    sourceBankCode: '014',
    paidAmount: { value: '11838.99', currency: 'IDR' },
    cumulativePaymentAmount: null,
    paidBills: '',
    totalAmount: { value: '11838.00', currency: 'IDR' },
    trxDateTime: '2023-02-07T15:03:01+07:00',
    referenceNo: '001136962156',
    journalNum: '',
    paymentType: '',
    flagAdvise: 'N',
    subCompany: '00000',
    billDetails: [null],
    freeTexts: [],
    additionalInfo: { value: '' }
  }

  const timestamp = formatISO(new Date())

  const symmetricSignaturePayload = {
    method: 'POST',
    body: body,
    relativeUrl: '/openapi/v1.0/transfer-va/payment',
    timestamp: timestamp,
    accessToken: accessToken,
    clientSecret: credentials.clientSecret,
  }

  const symmetricSignature = createSymmetricSignature(
    symmetricSignaturePayload
  )

  console.log(
    'Symmetric Signature Payload:',
    prettyJSON(
      symmetricSignaturePayload
    )
  )

  console.log('Symmetric Signature:', symmetricSignature)

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
  }

  console.log('headers:', config.headers)
  console.log('body:', body)

  return axios.post(`${endpoint}/transfer-va/payment/test`,
    body,
    config
  )
}

const requestInquiry = async (accessToken: string) => {
  const partnerServiceId = addLefSpace(credentials.partnerId, 8)
  const customerNo = zeroLeadPhoneNumber(customerPhone)

  const body = {
    partnerServiceId,
    customerNo,
    virtualAccountNo: partnerServiceId + customerNo,
    trxDateInit: '2022-02-12T17:29:57+07:00',
    channelCode: 6011,
    language: '',
    amount: null,
    hashedSourceAccountNo: '',
    sourceBankCode: '014',
    additionalInfo: {
      value: '',
    },
    passApp: '',
    inquiryRequestId: inquiryRequestId,
  }

  const timestamp = formatISO(new Date())

  const symmetricSignaturePayload = {
    method: 'POST',
    body: body,
    relativeUrl: '/openapi/v1.0/transfer-va/inquiry',
    timestamp: timestamp,
    accessToken: accessToken,
    clientSecret: credentials.clientSecret,
  }

  const symmetricSignature = createSymmetricSignature(
    symmetricSignaturePayload
  )

  console.log(
    'Symmetric Signature Payload:',
    prettyJSON(
      symmetricSignaturePayload
    )
  )

  console.log('Symmetric Signature:', symmetricSignature)

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
  }

  console.log('headers:', config.headers)
  console.log('body:', body)

  return axios.post(`${endpoint}/transfer-va/inquiry/test`,
    body,
    config
  )
}

getToken(credentials.clientId)
  .then((res) => {
    console.log('success:', prettyJSON(res?.data))
    requestInquiry(res?.data?.accessToken)
      .then((resp) => {
        console.log('success:', prettyJSON(resp?.data))
      })
      .catch((error) => console.log('error:', prettyJSON(error?.response?.data) || error.message))
  })
  .catch((error) => console.log('error:', prettyJSON(error?.response?.data) || error.message))

  // getToken(credentials.clientId)
  // .then((res) => {
  //   console.log('success:', prettyJSON(res?.data))
  //   requestPayment(res?.data?.accessToken)
  //     .then((resp) => {
  //       console.log('success:', prettyJSON(resp?.data))
  //     })
  //     .catch((error) => console.log('error:', prettyJSON(error?.response?.data) || error.message))
  // })
  // .catch((error) => console.log('error:', prettyJSON(error?.response?.data) || error.message))
