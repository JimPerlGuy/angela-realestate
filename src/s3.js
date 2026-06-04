const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const BUCKET = process.env.S3_BUCKET || 'angela-realestate-photos';
const REGION = process.env.AWS_REGION || 'us-east-1';
const CDN_BASE = process.env.CDN_BASE || `https://${BUCKET}.s3.${REGION}.amazonaws.com`;

const s3 = new AWS.S3({ region: REGION });

// Takes a file buffer, generates a unique s3Key, uploads to S3, returns CDN URL.
async function uploadPhoto(listingId, buffer, contentType = 'image/jpeg') {
  const ext = contentType.split('/')[1] || 'jpg';
  const s3Key = `listings/${listingId}/${uuidv4()}.${ext}`;
  await s3.putObject({
    Bucket: BUCKET,
    Key: s3Key,
    Body: buffer,
    ContentType: contentType,
  }).promise();
  return { s3Key, url: `${CDN_BASE}/${s3Key}` };
}

// Removes an object from S3 by s3Key.
async function deletePhoto(s3Key) {
  await s3.deleteObject({ Bucket: BUCKET, Key: s3Key }).promise();
}

module.exports = { s3, uploadPhoto, deletePhoto, BUCKET, CDN_BASE };
