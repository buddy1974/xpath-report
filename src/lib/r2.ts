/**
 * X-PATH — Cloudflare R2 client (S3-compatible)
 * ------------------------------------------------------------------
 * Audio/scans/PDFs go direct to R2 via presigned URLs, not through a
 * serverless function (Header §16 architecture note — avoids Vercel's
 * request-body size/time limits on longer dictations).
 *
 * Object keys are always tenant- and owner-scoped
 * (tenants/{tenantId}/users/{userId}/...) so a leaked/guessed key alone
 * can't cross a tenant or user boundary; actual access control still
 * lives in lib/access.ts, this is defense in depth on the storage layer.
 */
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const endpoint = process.env.R2_ENDPOINT;
  if (!accountId || !accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error("R2 credentials are not fully set (R2_ACCOUNT_ID/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY/R2_ENDPOINT)");
  }
  return new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function bucket(): string {
  const b = process.env.R2_BUCKET_NAME;
  if (!b) throw new Error("R2_BUCKET_NAME is not set");
  return b;
}

/** A short-lived (5 min) presigned PUT URL for direct browser upload. */
export async function presignUpload(key: string, contentType: string): Promise<string> {
  const cmd = new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: contentType });
  return getSignedUrl(client(), cmd, { expiresIn: 300 });
}

/** Server-side download — used to forward audio bytes to Whisper. */
export async function getObjectBytes(key: string): Promise<Buffer> {
  const cmd = new GetObjectCommand({ Bucket: bucket(), Key: key });
  const res = await client().send(cmd);
  const chunks: Uint8Array[] = [];
  // @ts-expect-error — Body is a Node Readable in the Node runtime.
  for await (const chunk of res.Body) chunks.push(chunk);
  return Buffer.concat(chunks);
}
