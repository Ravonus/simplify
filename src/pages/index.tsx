import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import { api } from "~/utils/api";

import ColorThief from "color-thief-ts";

import crypto from "crypto";
import TwitterShare from "~/components/TwitterShare";
import Button from "~/components/Button";
import Footer from '~/components/Footer';
import Modal from '~/components/Modal';
import NumberSlider from '~/components/NumberSlider';



type RGBColor = [number, number, number];

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [simplifiedImageSrc, setSimplifiedImageSrc] = useState<string | null>(
    null
  );
  const [palette, setPalette] = useState<number[][] | null>(null);
  const [darkestColor, setDarkestColor] = useState<number[] | null>(null);
  const [simplifiedPalette, setSimplifiedPalette] = useState<number[][] | null>(
    null
  );
  const [simplifiedDarkestColor, setSimplifiedDarkestColor] = useState<
    number[] | null
  >(null);

  const [publicId, setPublicId] = useState<string | null>(null);

  const [isAddress, setIsAddress] = useState<boolean>(false);

  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(
    null
  );

  const [address, setAddress] = useState<string>("");
  const [tokenId, setTokenId] = useState<string>("");

  const [isMatic, setIsMatic] = useState<boolean>(false);

  const [title, setTitle] = useState<string>("");

  const [open, setOpen] = useState<boolean>(false);

  const [simplify, setSimplify] = useState<number>(9);

  const NFT = api.nft.getNFT.useQuery({ address, tokenId, isMatic });

  useEffect(() => {
    handleUploadToCloudinary().catch(console.error);
  }, [simplifiedImageSrc]);

  useEffect(() => {
    if (!NFT.data || NFT?.data?.name === "") return;

    console.log("NFT", NFT.data)

    setImageSrc(NFT.data.image);

    const img = new Image();


    img.src = NFT.data.image;

    img.crossOrigin = "anonymous";
    setTitle(NFT.data.collection.name);
    img.onload = () => {
      grabColors(img, simplify);
    };

    //set change event
  }, [NFT.data]);

  useEffect(() => {
    if (!address || !tokenId) return;
  }, [address, tokenId]);

  function generateHash(data: string) {
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  function handleImageToken(str: string) {
    if (timer) {
      clearTimeout(timer);
    }

    setTimer(
      setTimeout(() => {
        setTokenId(str);

      }, 2000) // 2 seconds delay
    );
  }
  
  const handleUploadToCloudinary = async () => {
    if (!simplifiedImageSrc) return; // Ensure the source is available

    const formData = new FormData();
    const hash = generateHash(simplifiedImageSrc);
    formData.append("file", simplifiedImageSrc);
    formData.append("upload_preset", "jvddav02");
    formData.append("public_id", hash);
    //generate filename based on hash of image

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/doaxhxkmq/image/upload",
        { method: "POST", body: formData }
      );

      const data = (await response.json()) as {
        secure_url: string;
        public_id: string;
      };
      const public_id = data.public_id;

      setPublicId(public_id);

      // You can use the secureUrl here, such as saving it to your server or updating the state
    } catch (error) {
      console.error("Failed to upload image", error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImageSrc(reader.result);

        // Loading the image to extract the color
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          grabColors(img, simplify);
        };
      }
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  function grabColors(img: HTMLImageElement, count:number) {
    const colorThief = new ColorThief();

    const opts = {
      quality: 100,
      colorType: "array",
    } as const;

    const tmpPalette = colorThief.getPalette(img, count, opts);

    const mostDominantColor = colorThief.getColor(img, opts);

    const tmpPalette2 = colorThief.getPalette(img, 200, opts);

    setPalette(tmpPalette2);
    const darkestColor = findDarkestColor(tmpPalette2 as RGBColor[]);
    setDarkestColor(darkestColor);
    setSimplifiedPalette(tmpPalette);
    const simplifiedDarkestColor = findDarkestColor(tmpPalette as RGBColor[]);
    setSimplifiedDarkestColor(simplifiedDarkestColor);

    // Create a canvas and draw the original image
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);

    // Iterate through the pixels and replace with the closest palette color
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const originalColor: RGBColor = [
        imageData.data[i]!,
        imageData.data[i + 1]!,
        imageData.data[i + 2]!,
      ];

      if (tmpPalette) {
        // Check to make sure palette is defined

        const containsColor = paletteContainsColor(originalColor, tmpPalette);

        if (
          !containsColor &&
          mostDominantColor.toString() !== originalColor.toString()
        ) {
          const closestColor = findClosestPaletteColor(
            originalColor,
            tmpPalette
          );
          if (!closestColor) continue; // Skip if no closest color found
          imageData.data[i] = closestColor[0]!;
          imageData.data[i + 1] = closestColor[1]!;
          imageData.data[i + 2] = closestColor[2]!;
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // Update the image source with the new canvas data

    setSimplifiedImageSrc(canvas.toDataURL());

  }

  function paletteContainsColor(color: RGBColor, palette: number[][]): boolean {
    return palette.some(
      (paletteColor) =>
        paletteColor.length === 3 &&
        paletteColor[0] === color[0] &&
        paletteColor[1] === color[1] &&
        paletteColor[2] === color[2]
    );
  }

  function findClosestPaletteColor(
    color: RGBColor,
    palette: number[][]
  ): number[] | null {
    // Check for an exact match first
    for (const paletteColor of palette) {
      if (paletteColor.length !== 3) continue; // Skip if not valid

      if (
        color[0] === paletteColor[0] &&
        color[1] === paletteColor[1] &&
        color[2] === paletteColor[2]
      ) {
        return paletteColor; // Exact match found
      }
    }

    // If no exact match found, find the closest color
    let minDistance = Number.MAX_VALUE;
    let closestColor: number[] | null = null;

    for (const paletteColor of palette) {
      if (paletteColor.length !== 3) continue; // Skip if not valid

      const distance = Math.sqrt(
        Math.pow(color[0] - paletteColor[0]!, 2) +
          Math.pow(color[1] - paletteColor[1]!, 2) +
          Math.pow(color[2] - paletteColor[2]!, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestColor = paletteColor;
      }
    }

    return closestColor;
  }

  function rgbToHex(rgb: number[]): string {
    return (
      "#" + rgb.map((value) => value.toString(16).padStart(2, "0")).join("")
    );
  }

  function findDarkestColor(palette: RGBColor[]): RGBColor | null {
    if (palette.length === 0) return null;

    let darkestColor: RGBColor | null = null;
    let minBrightness = Number.MAX_VALUE;

    for (const color of palette) {
      const brightness = 0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2];
      if (brightness < minBrightness) {
        minBrightness = brightness;
        darkestColor = color;
      }
    }

    return darkestColor;
  }

  function handleImageChange(str: string) {
    if (str.length < 42) return;

    if (str.length === 42) {
      //address
      if (str.includes("0x")) {
        setIsAddress(true);
        setAddress(str);
      }
    }

    //grab address and token from opensea url https://opensea.io/assets/ethereum/0x02e9b2389156ee8ed963b1341a69d5f54ada4d82/938

    const split = str.split("/");
    const address = split[split.length - 2];
    const token = split[split.length - 1];
    const chain = split[split.length - 3];

    console.log('chain', chain)

    if (!address || !token) return;

    setAddress(address);
    setTokenId(token);

    if(chain === 'matic') {
      setIsMatic(true);
    }

  
  }

  function download() {
    if (!simplifiedImageSrc) return;
    const link = document.createElement("a");
    link.download = `${NFT.data?.name}-simplified-.png`;
    link.href = simplifiedImageSrc;
    link.click();
  }

  function changeSimplify(num: number) {
    setSimplify(num);
    if (imageSrc) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc
      img.onload = () =>
        grabColors(img, num);
      
    }

  }


  return (
    <>
      <Head>
        <title>Smplfy</title>
        <meta
          name="description"
          content="Giving the NFT space their cognitive ability back."
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://smplfy.world/smplfy.png" />
        <meta name="twitter:url" content="https://smplfy.world/" />
        <meta name="twitter:title" content="Smplfy" />
        <meta
          name="twitter:description"
          content="Giving the NFT space their cognitive ability back."
        />
        <meta property="og:image" content="https://smplfy.world/smplfy.png" />
        <meta property="og:url" content="https://smplfy.world/" />
        <meta property="og:title" content="Simplify" />
        <meta
          property="og:description"
          content="Giving the NFT space their cognitive ability back."
        />

        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Modal setOpen={setOpen} open={open} />
      <main className="flex flex-col items-center bg-gradient-to-b from-[#ffffff] to-[#f5f5dc] sm:h-screen">
        <img src="/smplfylogo.png" alt="logo" className="-mb-12 mt-1 w-32" />
        <div className="container flex flex-col items-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-black sm:text-[5rem]">
            Simplify, Simplify, Simplify
          </h1>
          <Button label="Manifesto" onClick={() => setOpen(!open)} />
          <input
            className="items-center justify-center rounded-md border border-black"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            id="fileUpload"
            hidden
          />

          <input
            type="text"
            className="items-center justify-center rounded-md border border-black"
            placeholder="Opensea URL - Contract"
            onChange={(e) => handleImageChange(e.target.value)}
          />
          {isAddress && (
            <input
              type="text"
              className="items-center justify-center rounded-md border border-black"
              placeholder="Token ID"
              onChange={(e) => handleImageToken(e.target.value)}
            />
          )}
          <div className="flex">
            <div className="flex flex-col sm:flex-row">
              <div>
                {darkestColor && (
                  <div className="flex-none px-1">
                    <div
                      className="-mb-5 border border-black"
                      style={{
                        backgroundColor: rgbToHex(darkestColor),
                        width: "20px",
                        height: "20px",
                      }}
                    />
                  </div>
                )}
                <div className="block items-start sm:flex">
                  <div className="flex-none px-1">
                    {palette && (
                      <div className="mt-12 grid grid-cols-2 grid-rows-2 gap-0">
                        {palette.map(
                          (color, index) =>
                            darkestColor &&
                            color.toString() !== darkestColor.toString() && (
                              <div
                                key={index}
                                className="border border-black"
                                style={{
                                  backgroundColor: rgbToHex(color),
                                  width: "20px",
                                  height: "20px",
                                }}
                              />
                            )
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    {imageSrc && (
                      <img
                        style={{ minWidth: "500px", minHeight: "500px" }}
                        id="unchangedImg"
                        src={imageSrc}
                        alt="Uploaded preview"
                        className="h-full w-full rounded border border border-black object-contain shadow"
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center sm:hidden">
                <div className="text-3xl">↓</div>
              </div>
              <div className="flex hidden w-5/12 items-center justify-center sm:flex">
                <div className="text-3xl">→</div>
              </div>
              <div>
                {/* Simplified image and palette code */}
                {simplifiedDarkestColor && (
                  <div className="flex-none px-1">
                    <div
                      className="-mb-5 border border-black"
                      style={{
                        backgroundColor: rgbToHex(simplifiedDarkestColor),
                        width: "20px",
                        height: "20px",
                      }}
                    />
                  </div>
                )}
                <div className="block items-start sm:flex">
                  <div className="flex-none px-1">
                    {simplifiedPalette && (
                      <div className="mt-12 grid grid-cols-2 grid-rows-2 gap-0">
                        {simplifiedPalette.map(
                          (color, index) =>
                            simplifiedDarkestColor &&
                            color.toString() !==
                              simplifiedDarkestColor.toString() && (
                              <div
                                key={index}
                                className="border border-black"
                                style={{
                                  backgroundColor: rgbToHex(color),
                                  width: "20px",
                                  height: "20px",
                                }}
                              />
                            )
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    {simplifiedImageSrc && (
                      <div>
                        <div className="-mt-0 sm:-mt-[60px]">
                          <NumberSlider
                            simplify={simplify}
                            setSimplify={changeSimplify}
                          />
                        </div>
                        <img
                          style={{ minWidth: "500px", minHeight: "500px" }}
                          src={simplifiedImageSrc}
                          alt="Simplified preview"
                          className="h-full w-full rounded border border border-black object-contain shadow"
                        />
                        <div className="mt-2 flex justify-center">
                          <Button label="Download" onClick={download} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {publicId && (
          <TwitterShare
            publicId={publicId}
            title={title}
            contract={NFT.data?.contract}
            tokenId={NFT.data?.tokenId}
            isMatic={isMatic}
          />
        )}
        <div className="sm:h-screen" />
        <div className="container gap-8 px-4 py-8">
          <Footer />
        </div>
      </main>
    </>
  );
}
