import { type GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from 'next/link';
import { useEffect, useState } from "react";
import Footer from '~/components/Footer';
import axios from "axios";

import { api } from "~/utils/api";

interface ImagePageProps {
  imageUrl: string;
  tokenId: string;
  contract: string;
  matic?: string;
  NFT?: {
    tokenId: string;
    image: string;
    contract: string;
    collection: {
      name: string;
    };
  };

}

interface MyData {
  tokens: {
    token: {
      tokenId: string;
      image: string;
      contract: string;
      collection: {
        name: string;
      }
    };
  }[];
  continuation?: string;
}

interface MyResponse {
  data: MyData;
}

const ImagePage: React.FC<ImagePageProps> = ({ imageUrl, tokenId, contract, NFT, matic }) => {

  const [newSrc, setNewSrc] = useState<string | undefined>(undefined);

  // const NFT = api.nft.getNFT.useQuery({
  //   address: contract,
  //   tokenId,
  //   isMatic: matic === "true",
  // });

  //use effect to set body gradient color
  useEffect(() => {
    const body = document.querySelector("body");
    if (body) {
      body.classList.add("bg-gradient-to-b", "from-[#ffffff]", "to-[#f5f5dc]");
      body.style.backgroundImage = "none";
      body.style.backgroundColor = "#f5f5dc";

    }
  }, []);

  function changeImg() {
    const imgSrc = NFT?.image;
    const img = document.querySelector("#preview");

    if (img) {
      setTimeout(() => {
        img.setAttribute("src", `${imgSrc}`);
        setNewSrc(imgSrc);
      }, 400);
    }
  }

  function removeImg() {
    const img = document.querySelector("#preview");
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
        <title>Smplify #{NFT?.tokenId}</title>
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
        <meta
          name="twitter:title"
          content={`Smplify ${NFT?.collection.name} #${NFT?.tokenId}`}
        />
        <meta
          name="twitter:description"
          content={`Giving the NFT space their cognitive ability back. Converted my ${NFT?.collection.name} NFT with smplfy`}
        />
        <meta property="og:image" content={`${imageUrl}.png`} />
        <meta
          property="og:url"
          content="https://main--fabulous-heliotrope-b6df16.netlify.app/"
        />
        <meta
          property="og:title"
          content={`Giving the NFT space their cognitive ability back. Converted my ${NFT?.collection.name} NFT with smplfy`}
        />
        <meta
          property="og:description"
          content={`Giving the NFT space their cognitive ability back. Converted my ${NFT?.collection.name} NFT with smplfy`}
        />

        {/* Other meta tags as needed */}
      </Head>
      <main className="sm:h-100 h-min-screen flex  flex-col items-center bg-gradient-to-b from-[#ffffff] to-[#f5f5dc]">
        <img src={NFT?.image} alt="cache" hidden />
        <div className="container flex flex-col items-center gap-12 px-4 py-16 ">
          <Link
            className="mouse-cursor m-4 transform text-center text-4xl font-bold transition duration-700 hover:rotate-6 hover:scale-105 hover:text-blue-500"
            href="/"
          >
            <img
              src="/smplfylogo.png"
              alt="logo"
              className="mouse-cursor m-4 -mb-12 mt-1 w-32 text-center text-4xl font-bold transition duration-700 hover:text-blue-500"
            />
          </Link>
          <h2 className="m-3 text-center text-2xl font-bold">
            {NFT?.collection.name}
          </h2>
          <div className="flex items-center justify-center">
            <div
              className="group relative flex"
              style={{ minWidth: "500px", minHeight: "500px" }}
            >
              <div className="absolute h-full w-full rounded bg-white duration-1000 group-hover:scale-105" />
              <a
                href={`https://opensea.io/assets/${
                  matic ? "matic" : "ethereum"
                }/${contract}/${tokenId}`}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={changeImg}
                onMouseLeave={removeImg}
                onTouchEnd={removeImg}
                onTouchStart={changeImg}
              >
                <Image
                  id="preview"
                  src={newSrc ?? imageUrl}
                  alt="NFT"
                  width={500}
                  height={500}
                  className="absolute rounded border border border-black shadow duration-1000 group-hover:scale-105"
                  placeholder="blur"
                  blurDataURL={imageUrl}
                />
              </a>
            </div>
          </div>
          <h2 className="m-2 text-center text-2xl font-bold">
            #{NFT?.tokenId}
          </h2>
        </div>
        <div className="absolute -bottom-12" />
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

export const getServerSideProps: GetServerSideProps<ImagePageProps> = async (
  context
) => {
  const imageId = context.params?.imageId as string;
  const tokenId = context.query.tokenId as string;
  const contract = context.query.contract as string;
  const matic = context.query.matic as string ?? false;
  const imageUrl = getImageUrlById(imageId);

    const url = `https://api${
      matic ? "-polygon" : ""
    }.reservoir.tools/tokens/v6?tokens=${contract}:${tokenId}`;

    const res: MyResponse = await axios.get(url, {
      headers: {
        "x-api-key": `${process.env.RESERVOIR_API_KEY ?? ""}`,
        contentType: "application/json",
      },
    });

  return Promise.resolve({
    props: {
      imageUrl,
      tokenId,
      contract,
      NFT: res?.data?.tokens[0]?.token,
      matic,
    },
  });
};
