/**
 * @author Chad Koslovsky <chad@technomnancy.it>
 * @file Description
 * @desc Created on 2023-06-29 12:55:50 am
 * @copyright TechnomancyIT
 */
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import axios from "axios";
import * as z from "zod"; // Importing zod for input validation

interface NFTData {
  image_url: string;
  token_id: string;
}

interface CollectionData {
  name: string;
}

interface MyData {
  tokens: {
    token: {
      tokenId: string;
      image: string;
      contract: string;
    };
  }[];
  continuation?: string;
}

interface MyResponse {
  data: MyData;
}

interface NFTDataResponse {
  tokenId: string;
  image: string;
  contract: string;
  name: string;
  collection: CollectionData;
}
const getNFTInput = z.object({
  tokenId: z.string(),
  address: z.string(),
  isMatic: z.boolean().optional(),
});

const getRandomNFTFromReservoir = async (
  address: string,
  tokenId: string,
  isMatic:boolean
): Promise<NFTDataResponse> => {
  if (address === "" || tokenId === "") {
    return {
      tokenId: "",
      image: "",
      contract: "",
      name: "",
      collection: {
        name: "",
      },
    };
  }

  try {

    const url = `https://api${isMatic ? '-polygon':''}.reservoir.tools/tokens/v6?tokens=${address}:${tokenId}`;

    const res: MyResponse = await axios.get(url, {
      headers: {
        "x-api-key": `${process.env.RESERVOIR_API_KEY ?? ""}`,
        contentType: "application/json",
      },
    });

    return res?.data?.tokens[0]?.token as NFTDataResponse;
  } catch (error) {
    console.error("Error fetching data from Reservoir API: ");
    //reroll until valid NFT
    return {
      tokenId: "",
      image: "",
      contract: "",
      name: "",
      collection: {
        name: "",
      },
    };
  }
};

export const nftRouter = createTRPCRouter({
  getNFT: publicProcedure.input(getNFTInput).query(async ({ input }) => {
    const { tokenId, address, isMatic } = input;
    const NFT = await getRandomNFTFromReservoir(address, tokenId, isMatic ?? false);
    return NFT;
  }),
});
