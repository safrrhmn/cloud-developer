import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({ signatureVersion: 'v4' })

/**
 * A utility function that generates pre-signed URL for s3 bucket
 * @param todoId
 * @param bucket
 * @param expiration
 */
export const createPresignedURL = async (todoId: string, bucket:string, expiration:string) => {
  return s3.getSignedUrl('putObject', {
    Bucket: bucket,
    Key: todoId,
    Expires: Number(expiration)
  })
}