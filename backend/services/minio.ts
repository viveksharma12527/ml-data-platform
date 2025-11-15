import { Client } from 'minio';

const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'images';

// Initialize bucket on startup
export async function initializeMinio() {
    try {
        const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
        if (!bucketExists) {
            await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
            console.log(`Bucket "${BUCKET_NAME}" created successfully`);

            // Set bucket policy to allow public read
            const policy = {
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Principal: { AWS: ['*'] },
                        Action: ['s3:GetObject'],
                        Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
                    },
                ],
            };
            await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
        } else {
            console.log(`Bucket "${BUCKET_NAME}" already exists`);
        }
    } catch (error) {
        console.error('Error initializing MinIO:', error);
        throw error;
    }
}

// Upload file to MinIO
export async function uploadFile(
    file: Buffer,
    filename: string,
    mimetype: string
): Promise<string> {
    try {
        const objectName = `${Date.now()}-${filename}`;

        await minioClient.putObject(BUCKET_NAME, objectName, file, file.length, {
            'Content-Type': mimetype,
        });

        // Return public URL
        const url = `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}/${BUCKET_NAME}/${objectName}`;
        return url;
    } catch (error) {
        console.error('Error uploading file to MinIO:', error);
        throw new Error('Failed to upload file');
    }
}

// Delete file from MinIO
export async function deleteFile(filename: string): Promise<void> {
    try {
        await minioClient.removeObject(BUCKET_NAME, filename);
    } catch (error) {
        console.error('Error deleting file from MinIO:', error);
        throw new Error('Failed to delete file');
    }
}

// Get file URL (for signed URLs if needed)
export async function getFileUrl(filename: string): Promise<string> {
    try {
        // For public buckets, just return the direct URL
        const url = `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}/${BUCKET_NAME}/${filename}`;
        return url;

        // For private buckets, use presigned URL (expires in 7 days)
        // return await minioClient.presignedGetObject(BUCKET_NAME, filename, 24 * 60 * 60 * 7);
    } catch (error) {
        console.error('Error getting file URL from MinIO:', error);
        throw new Error('Failed to get file URL');
    }
}

export { minioClient, BUCKET_NAME };