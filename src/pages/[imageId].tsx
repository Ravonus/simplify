import { type GetServerSideProps } from "next";
import Head from "next/head";

interface ImagePageProps {
  imageUrl: string;
}

const ImagePage: React.FC<ImagePageProps> = ({ imageUrl }) => (
  <div>
    <Head>
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={imageUrl} />
      {/* Other meta tags as needed */}
    </Head>
    {/* Rest of your page content */}
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

