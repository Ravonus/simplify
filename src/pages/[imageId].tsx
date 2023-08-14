import { type GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from 'next/link';
import { useEffect, useState } from "react";
import Footer from '~/components/Footer';

import { api } from "~/utils/api";

interface ImagePageProps {
  imageUrl: string;
  tokenId: string;
  contract: string;
  matic?: string;
}

const ImagePage: React.FC<ImagePageProps> = ({ imageUrl, tokenId, contract,matic }) => {


  const [newSrc, setNewSrc] = useState<string | undefined>(undefined);

  const NFT = api.nft.getNFT.useQuery({
    address: contract,
    tokenId,
    isMatic: matic === "true",
  });

  //grab query params contract and tokenId

  // useEffect(() => {
  //   const urlParams = new URLSearchParams(window.location.search);
  //   const contract = urlParams.get("contract");
  //   const tokenId = urlParams.get("tokenId");
  //   if (!contract || !tokenId) return;
  //   setContract(contract);
  //   setTokenId(tokenId);
  // }, []);

  function changeImg() {
    const imgSrc = NFT.data?.image;
    const img = document.querySelector("img");

    if (img) {
      setTimeout(() => {
        img.setAttribute("src", `${imgSrc}`);
        setNewSrc(imgSrc);
      }, 400);
    }
  }

  function removeImg() {
    const img = document.querySelector("img");
    if (img) {
      setTimeout(() => {
        img.setAttribute("src", `${imageUrl}`);
        setNewSrc(undefined);
      }, 400);
    }
  }

  return (
    <div>
      <Head>
        <title>Smplify #{NFT.data?.tokenId}</title>
        <meta
          name="description"
          content="Giving the NFT space their cognitive ability back."
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={imageUrl} />
        <meta
          name="twitter:url"
          content="https://main--fabulous-heliotrope-b6df16.netlify.app/"
        />
        <meta name="twitter:title" content={`Smplify # ${NFT.data?.tokenId}`} />
        <meta
          name="twitter:description"
          content={`Giving the NFT space their cognitive ability back. Conberted my ${NFT.data?.collection.name} NFT with smplfy`}
        />
        <meta property="og:image" content={`${imageUrl}.png`} />
        <meta
          property="og:url"
          content="https://main--fabulous-heliotrope-b6df16.netlify.app/"
        />
        <meta
          property="og:title"
          content={`Giving the NFT space their cognitive ability back. Conberted my ${NFT.data?.collection.name} NFT with smplfy`}
        />
        <meta
          property="og:description"
          content={`Giving the NFT space their cognitive ability back. Conberted my ${NFT.data?.collection.name} NFT with smplfy`}
        />

        {/* Other meta tags as needed */}
      </Head>
      <main className="flex h-screen flex-col items-center bg-gradient-to-b from-[#ffffff] to-[#f5f5dc]">
        <div className="container flex flex-col items-center gap-12 px-4 py-16 ">
          <Link
            className="mouse-cursor m-4 text-center text-4xl font-bold transition duration-700 hover:text-blue-500"
            href="/"
          >
            Simplify
          </Link>
          <h2 className="m-3 text-center text-2xl font-bold">
            {NFT.data?.collection.name}
          </h2>
          <div className="flex items-center justify-center">
            <a
              href={`https://opensea.io/assets/ethereum/${contract}/${tokenId}`}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={changeImg}
              onMouseLeave={removeImg}
              onTouchEnd={removeImg}
              onTouchStart={changeImg}
            >
              <Image
                src={newSrc ?? imageUrl}
                alt="NFT"
                width={500}
                height={500}
                className="duration-1000 hover:scale-105"
              />
            </a>
          </div>
          <h2 className="m-2 text-center text-2xl font-bold">
            #{NFT.data?.tokenId}
          </h2>
        </div>
        <div className="h-screen" />
        <div className="container gap-8 px-4 py-8">
          <Footer />
        </div>
      </main>
    </div>
  );
};

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
  const tokenId = context.query.tokenId as string;
  const contract = context.query.contract as string;
  const matic = context.query.matic as string ?? false;
  const imageUrl = getImageUrlById(imageId);
  return Promise.resolve({
    props: {
      imageUrl,
      tokenId,
      contract,
      matic,
    },
  });
};
