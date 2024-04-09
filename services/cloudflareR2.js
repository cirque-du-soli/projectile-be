const s3API = require("../config/cloudflareR2")
const bucket = process.env.CLOUDFLARE_R2_BUCKET;
const mimeTypes = require('mime-types');

function uploadFileToR2(fileStream, fileName, originalName) {
    const contentType = mimeTypes.lookup(originalName) || 'image/jpeg';

    const params = {
        Bucket: bucket,
        Key: fileName, // File name you want to save as in S3
        Body: fileStream,
        ContentType: contentType,
    };

    s3API.upload(params, function (err, data) {
        if (err) {
            console.log(err);
            throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
    });
}

function deleteFileFromR2(fileKey) {
    const params = {
        Bucket: bucket,
        Key: fileKey
    };

    s3API.deleteObject(params, function (err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("File deleted successfully");
        }
    });
}

function getFileFromR2(fileKey) {
    const params = {
        Bucket: bucket,
        Key: fileKey,
    };

    return new Promise((resolve, reject) => {
        s3API.getObject(params, (err, data) => {
            if (err) {
                console.error("Error getting object from R2", err);
                reject(err);
            } else {
                console.log("Success getting object from R2");
                resolve(data);
            }
        });
    });
}

module.exports = {
    uploadFileToR2,
    deleteFileFromR2,
    getFileFromR2
};

