import { type GetServerSideProps } from "next";
import Head from "next/head";
import Image from 'next/image';

interface ImagePageProps {
  imageUrl: string;
}

const ImagePage: React.FC<ImagePageProps> = ({ imageUrl }) => (
  <div>
    <Head>
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={imageUrl} />
      <meta
        name="twitter:url"
        content="https://main--fabulous-heliotrope-b6df16.netlify.app/"
      />
      <meta name="twitter:title" content="Simplify" />
      <meta name="twitter:description" content="An NFT Simplifier." />
      <meta property="og:image" content={`${imageUrl}.png`} />
      <meta
        property="og:url"
        content="https://main--fabulous-heliotrope-b6df16.netlify.app/"
      />
      <meta property="og:title" content="Simplify" />
      <meta property="og:description" content="An NFT Simplifier." />

      {/* Other meta tags as needed */}
    </Head>
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#ffffff] to-[#f5f5dc]">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-center m-4">
          Simplify
        </h1>
        <div className="flex items-center justify-center">
          <Image src={imageUrl} alt="NFT" width={500} height={500} />
        </div>
      </div>
    </main>
  </div>
);

export default ImagePage;

// Your logic to get the image URL by ID
const getImageUrlById = (imageId: string): string => {
  // Replace with the actual logic to get the image URL
  return `https://res.cloudinary.com/doaxhxkmq/image/upload/v1692002576/${imageId}`;
};

export const getServerSideProps: GetServerSideProps<ImagePageProps> = (
  context
) => {
  const imageId = context.params?.imageId as string;
  const imageUrl = getImageUrlById(imageId);
  return Promise.resolve({
    props: {
      imageUrl,
    },
  });
};

