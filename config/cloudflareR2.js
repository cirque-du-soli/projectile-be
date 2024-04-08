const AWS = require("aws-sdk");
const accessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;

AWS.config.update({
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
    endpoint: endpoint,
    s3ForcePathStyle: true,
});

const s3 = new AWS.S3();

module.exports = s3;