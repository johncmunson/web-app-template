---
applyTo: "_____NOTHING_____"
---

# Server Uploads with Vercel Blob

Vercel Blob is available on [all plans](/docs/plans)

Those with the [owner, member, developer](/docs/rbac/access-roles#owner, member, developer-role) role can access this feature

In this guide, you'll learn how to do the following:

- Use the Vercel dashboard to create a Blob store connected to a project
- Upload a file using the Blob SDK from the server

Vercel has a [4.5 MB request body size limit](/docs/functions/runtimes#request-body-size) on Vercel Functions. If you need to upload larger files, use [client uploads](/docs/storage/vercel-blob/client-upload).

## [Prerequisites](#prerequisites)

Vercel Blob works with any frontend framework. First, install the package:

pnpmyarnnpmbun

```
pnpm i @vercel/blob
```

1.  ### [Create a Blob store](#create-a-blob-store)

    Navigate to the [Project](/docs/projects/overview) you'd like to add the blob store to. Select the Storage tab, then select the Connect Database button.

    Under the Create New tab, select Blob and then the Continue button.

    Use the name "Images" and select Create a new Blob store. Select the environments where you would like the read-write token to be included. You can also update the prefix of the Environment Variable in Advanced Options

    Once created, you are taken to the Vercel Blob store page.

2.  ### [Prepare your local project](#prepare-your-local-project)

    Since you created the Blob store in a project, we automatically created and added the following Environment Variable to the project for you.
    - `BLOB_READ_WRITE_TOKEN`

    To use this Environment Variable locally, we recommend pulling it with the Vercel CLI:

    ```
    vercel env pull
    ```

Server uploads are perfectly fine as long as you do not need to upload files larger than [4.5 MB on Vercel](/docs/functions/runtimes#request-body-size). If you need to upload larger files, consider using [client uploads](/docs/storage/vercel-blob/client-upload).

## [Upload a file using Server Actions](#upload-a-file-using-server-actions)

The following example shows how to use a [Server Action](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) with Next.js App Router to upload a file to Vercel Blob.

```
import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';

export async function Form() {
  async function uploadImage(formData: FormData) {
    'use server';
    const imageFile = formData.get('image') as File;
    const blob = await put(imageFile.name, imageFile, {
      access: 'public',
      addRandomSuffix: true,
    });
    revalidatePath('/');
    return blob;
  }

  return (
    <form action={uploadImage}>
      <label htmlFor="image">Image</label>
      <input
        type="file"
        id="image"
        name="image"
        accept="image/jpeg, image/png, image/webp"
        required
      />
      <button>Upload</button>
    </form>
  );
}
```

Then, add the hostname to your `next.config.js` file including the store id from the dashboard:

```
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      new URL('https://my-store-id.public.blob.vercel-storage.com/**'),
    ],
  },
};

module.exports = nextConfig;
```

This will allow you to use [`next/image`](https://nextjs.org/docs/app/api-reference/components/image) to display images from your Vercel Blob store.

```
import { list } from '@vercel/blob';
import Image from 'next/image';

export async function Images() {
  const { blobs } = await list();

  return (
    <section>
      {blobs.map((image, i) => (
        <Image
          priority={i < 2}
          key={image.pathname}
          src={image.url}
          alt="My Image"
          width={200}
          height={200}
        />
      ))}
    </section>
  );
}
```

Read more about [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) and [App Router](https://nextjs.org/docs) on the Next.js documentation.

## [Upload a file using a server upload page and route](#upload-a-file-using-a-server-upload-page-and-route)

You can upload files to Vercel Blob using Route Handlers/API Routes. The following example shows how to upload a file to Vercel Blob using a server upload page and route.

1.  ### [Create a server upload page](#create-a-server-upload-page)

    This page will upload files to your server. The files will then be sent to Vercel Blob.

    ```
    'use client';

    import type { PutBlobResult } from '@vercel/blob';
    import { useState, useRef } from 'react';

    export default function AvatarUploadPage() {
      const inputFileRef = useRef<HTMLInputElement>(null);
      const [blob, setBlob] = useState<PutBlobResult | null>(null);
      return (
        <>
          <h1>Upload Your Avatar</h1>

          <form
            onSubmit={async (event) => {
              event.preventDefault();

              if (!inputFileRef.current?.files) {
                throw new Error('No file selected');
              }

              const file = inputFileRef.current.files[0];

              const response = await fetch(
                `/api/avatar/upload?filename=${file.name}`,
                {
                  method: 'POST',
                  body: file,
                },
              );

              const newBlob = (await response.json()) as PutBlobResult;

              setBlob(newBlob);
            }}
          >
            <input
              name="file"
              ref={inputFileRef}
              type="file"
              accept="image/jpeg, image/png, image/webp"
              required
            />
            <button type="submit">Upload</button>
          </form>
          {blob && (
            <div>
              Blob url: <a href={blob.url}>{blob.url}</a>
            </div>
          )}
        </>
      );
    }
    ```

2.  ### [Create a server upload route](#create-a-server-upload-route)

    This route forwards the file to Vercel Blob and returns the URL of the uploaded file to the browser.

    ```
    import { put } from '@vercel/blob';
    import { NextResponse } from 'next/server';

    export async function POST(request: Request): Promise<NextResponse> {
      const { searchParams } = new URL(request.url);
      const filename = searchParams.get('filename');

      const blob = await put(filename, request.body, {
        access: 'public',
        addRandomSuffix: true,
      });

      return NextResponse.json(blob);
    }
    ```

### [Testing your page](#testing-your-page)

1.  ### [Run your application locally](#run-your-application-locally)

    Run your application locally and visit `/avatar/upload` to upload the file to your store. The browser will display the unique URL created for the file.

2.  ### [Review the Blob object metadata](#review-the-blob-object-metadata)
    - Go to the Vercel Project where you created the store
    - Select the Storage tab and select your new store
    - Paste the blob object URL returned in the previous step in the Blob URL input box in the Browser section and select Lookup
    - The following blob object metadata will be displayed: file name, path, size, uploaded date, content type and HTTP headers
    - You also have the option to download and delete the file from this page

You have successfully uploaded an object to your Vercel Blob store and are able to review it's metadata, download, and delete it from your Vercel Storage Dashboard.

## [Next steps](#next-steps)

- Learn how to [use the methods](/docs/storage/vercel-blob/using-blob-sdk) available with the `@vercel/blob` package
