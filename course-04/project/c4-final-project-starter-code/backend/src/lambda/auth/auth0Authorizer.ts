import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const jwksUrl = 'https://dev-9806scxc.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {

  logger.info('Authorizing a user ' + JSON.stringify(event), event.authorizationToken)
  try {
    logger.info('Header token is ' + event.authorizationToken)
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)
    console.log(event)
    logger.info(event)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = retrieveToken(authHeader)
  logger.info('Token from header is {}' + token, token)
  logger.info('Retrieved token to verify {}' + token, verifyToken)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  logger.info('Decoded token successfully. {}' + jwt, jwt)
  let response = await Axios.get(jwksUrl)
  let keys = response.data.keys
  logger.info('Successfully got the keys from jwksURL')
  let pem = keys.filter(key =>
    key.use === 'sig' &&
    key.kty === 'RSA' &&
    key.kid).map(key => {
    return { kid: key.kid, nbf: key.use, publicKey: getPem(key.x5c[0]) }
  })

  logger.info('Retrieved pem is {}' + pem, pem)
  let kid = jwt.header.kid
  let publicKey = pem.find((x: { kid: string }) => x.kid === kid).publicKey
  logger.info('Public key is {}' + publicKey, publicKey)
  let verifiedPayload = verify(token, publicKey, { algorithms: ['RS256'] }) as JwtPayload
  logger.info('Token verified successfully. Payload is {}' + verifiedPayload, verifiedPayload)
  return verifiedPayload
}

const getPem = (x5cElement: any) => {
  x5cElement = x5cElement.match(/.{1,64}/g).join('\n')
  x5cElement = `-----BEGIN CERTIFICATE-----\n${x5cElement}\n-----END CERTIFICATE-----\n`
  return x5cElement
}

const retrieveToken = (authHeader: string): string => {
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    throw new Error('Header cannot be null or invalid')
  }

  logger.info('Auth header is {}', authHeader)
  const split = authHeader.split(' ')
  const token = split[1]
  logger.info('Token is {}', token)

  return token
}
