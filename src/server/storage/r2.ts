import "server-only";

import {
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { getEnv } from "@/lib/env";

import { assertSafeKey, type Bucket, type MediaStorage } from "./index";

const DELETE_BATCH = 1000;

/** Cloudflare R2 through its S3-compatible API. */
export function createR2Storage(bucket: Bucket): MediaStorage {
  const env = getEnv();
  const bucketName = bucket === "public" ? env.R2_PUBLIC_BUCKET : env.R2_PRIVATE_BUCKET;
  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !bucketName) {
    throw new Error(`R2 is not configured for the ${bucket} bucket. See .env.example.`);
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
  });

  return {
    async put(key, body, options) {
      assertSafeKey(key);
      await client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: body,
          ContentType: options.contentType,
          CacheControl: options.cacheControl,
          ContentLength: options.contentLength,
        }),
      );
    },
    async signedGetUrl(key, options) {
      assertSafeKey(key);
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
        ResponseContentDisposition: options.downloadAs
          ? `attachment; filename="${options.downloadAs.replace(/["\\\r\n]/g, "_")}"`
          : undefined,
      });
      return getSignedUrl(client, command, { expiresIn: options.expiresIn });
    },
    async delete(keys) {
      for (let start = 0; start < keys.length; start += DELETE_BATCH) {
        const batch = keys.slice(start, start + DELETE_BATCH);
        batch.forEach(assertSafeKey);
        await client.send(
          new DeleteObjectsCommand({
            Bucket: bucketName,
            Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
          }),
        );
      }
    },
    async exists(key) {
      assertSafeKey(key);
      try {
        await client.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }));
        return true;
      } catch {
        return false;
      }
    },
  };
}
