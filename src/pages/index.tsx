import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import { api } from "~/utils/api";

import ColorThief from "color-thief-ts";

import crypto from "crypto";
import TwitterShare from "~/components/TwitterShare";
import Button from "~/components/Button";
import Footer from "~/components/Footer";
import Modal from "~/components/Modal";
import NumberSlider from "~/components/NumberSlider";

//import gifFrames from "gif-frames";

type RGBColor = [number, number, number];
type Cluster = RGBColor;

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

  const [loader, setLoader] = useState<boolean>(false);

  const NFT = api.nft.getNFT.useQuery({ address, tokenId, isMatic });

  useEffect(() => {
    const body = document.querySelector("body");
    if (body) {
      body.classList.add("bg-gradient-to-b", "from-[#ffffff]", "to-[#f5f5dc]");
      body.style.backgroundImage = "none";
      body.style.backgroundColor = "#f5f5dc";
    }
  }, []);

  useEffect(() => {
    //handleUploadToCloudinary().catch(console.error);
  }, [simplifiedImageSrc]);

  useEffect(() => {
    if (!NFT.data || NFT?.data?.name === "") return;
    setTitle(NFT.data.collection.name);
    fetch(NFT.data.image)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.src = url;
        img.onload = () => {
          if (blob.type === "image/gif") {
            console.log("gif");
            // const frames = await gifFrames({ url, frames: "all", outputType: "canvas" });
            // console.log(frames)
          }
          setLoader(true);
          setTimeout(() => grabColors(img, simplify), 500);
        };
      })
      .catch((e) => console.error(e));

    setImageSrc(NFT.data.image);

    // const img = new Image();

    // img.src = NFT.data.image;

    // img.crossOrigin = "anonymous";

    // img.onload = () => {
    //   //check if gif (if so we want to do grab frames and loop instead)
    //   // const isGif = NFT.data.image.includes(".gif");

    //   // const fileHeader = img.src.slice(0, 4);

    //   // console.log("fileHeader", fileHeader);


    //   setLoader(true);
    //   // setTimeout(() => grabColors(img, simplify), 500);
    // };

    //set change event
  }, [NFT.data, simplify]);

  useEffect(() => {
    if (!address || !tokenId) return;
  }, [address, tokenId]);

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImageSrc(reader.result);

        fetch(reader.result)
          .then((response) => response.blob())
          .then((blob) => {
            const url = URL.createObjectURL(blob);
            const img = new Image();
            img.src = url;
            img.onload = () => {
              console.log(blob.type);
              if (blob.type === "image/gif") {
                console.log("gif");
              }
              setLoader(true);
              setTimeout(() => grabColors(img, simplify), 500);
            };
          })
          .catch((e) => console.error(e));

        // Loading the image to extract the color
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          setLoader(true);
          setTimeout(() => grabColors(img, simplify), 500);
        };
      }
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };


  function colorDistance(color1: RGBColor, color2: RGBColor): number {
    const [r1, g1, b1] = color1;
    const [r2, g2, b2] = color2;

    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
  }


function grabColors(img: HTMLImageElement, count: number) {
  // const colorThief = new ColorThief();

  // const opts = {
  //   quality: 0,
  //   colorType: "array",
  // } as const;

  // // const mostDominantColor = colorThief.getColor(img, opts);
  // const pallet = colorThief.getPalette(img, 2, opts);
const colorFrequencyMap = {} as Record<string, number>;



  // Create a canvas and draw the original image
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  // Get image data and iterate through pixels
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);



  for (let i = 0; i < imageData.data.length; i += 4) {
    const colorString = `${imageData.data[i]},${imageData.data[i + 1]},${
      imageData.data[i + 2]
    }`;
    if (colorFrequencyMap[colorString]) {
      colorFrequencyMap[colorString] += 1;
    } else {
      colorFrequencyMap[colorString] = 1;
    }
  }

  const mostDominantColorString = Object.keys(colorFrequencyMap).reduce(
    (a, b) => (colorFrequencyMap[a]! > colorFrequencyMap[b]! ? a : b)
  )

  const mostDominantColor = mostDominantColorString
    .split(",")
    .map((value) => parseInt(value));
  console.log("Most Dominant Color:", mostDominantColor);

  const tolerance = 56; // You can adjust this value
  const cornerRadius = 20;
  for (let i = 0; i < imageData.data.length; i += 4) {
    const x = (i / 4) % canvas.width;
    const y = Math.floor(i / 4 / canvas.width);

    const originalColor: RGBColor = [
      imageData.data[i]!,
      imageData.data[i + 1]!,
      imageData.data[i + 2]!,
    ];

    // Check if the pixel is within the corner radius
    const inTopLeftCorner = x < cornerRadius && y < cornerRadius;
    const inTopRightCorner =
      x > canvas.width - cornerRadius && y < cornerRadius;
    const inBottomLeftCorner =
      x < cornerRadius && y > canvas.height - cornerRadius;
    const inBottomRightCorner =
      x > canvas.width - cornerRadius && y > canvas.height - cornerRadius;
    
    if (colorDistance(mostDominantColor as [number, number, number], originalColor) <= tolerance) {
      imageData.data[i + 3] = 0; // Set alpha to 0 (transparent)
    } else if (
      inTopLeftCorner ||
      inTopRightCorner ||
      inBottomLeftCorner ||
      inBottomRightCorner
    ) {
      imageData.data[i + 3] = 0; // Set alpha to 0 (transparent)
    }
  }

  // After your existing loop that sets pixels to transparent based on color distance...
  for (let i = 0; i < imageData.data.length; i += 4) {
    const x = (i / 4) % canvas.width;
    const y = Math.floor(i / 4 / canvas.width);

    // If this pixel is transparent
    if (imageData.data[i + 3] === 0) {
      let nonTransparentNeighbors = 0;

      // Check the surrounding pixels (-1 or +1 in x and y directions)
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;

          const neighborIndex = ((y + dy) * canvas.width + (x + dx)) * 4;
          if (imageData.data[neighborIndex + 3] !== 0) {
            nonTransparentNeighbors += 1;
          }
        }
      }

      // If there are 5 or more non-transparent neighbors, make this pixel non-transparent to smooth the edge
      if (nonTransparentNeighbors >= 5) {
        imageData.data[i + 3] = 255; // Set alpha to 255 (non-transparent)
      }
    }
  }

for (let i = 0; i < imageData.data.length; i += 4) {
  const x = (i / 4) % canvas.width;
  const y = Math.floor(i / 4 / canvas.width);

  // If this pixel is transparent
  if (imageData.data[i + 3] === 0) {
    continue;
  }

  const surroundingAlphas = [];

  // Check the surrounding pixels (-1 or +1 in x and y directions)
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;

      const neighborIndex = ((y + dy) * canvas.width + (x + dx)) * 4;
      surroundingAlphas.push(imageData.data[neighborIndex + 3]);
    }
  }

  // Find minimum non-zero alpha in the surrounding pixels
  const minAlpha = Math.min(...surroundingAlphas.filter((alpha) => alpha! > 0) as number[]);

  // If we find a less opaque neighboring pixel, set this pixel's alpha to be an average of its current alpha and the minimum neighboring alpha
  if (minAlpha < imageData.data[i + 3]!) {
    imageData.data[i + 3] = (imageData.data[i + 3]! + minAlpha) / 2;
  }
}

  

  // Apply the updated image data to the canvas
  ctx.putImageData(imageData, 0, 0);

  // Update the image source with the new canvas data
  setSimplifiedImageSrc(canvas.toDataURL());

  setTimeout(() => {
    setLoader(false);
  }, 500);
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


    const split = str.split("/");
    const address = split[split.length - 2];
    const token = split[split.length - 1];
    const chain = split[split.length - 3];

    if (!address || !token) return;

    if (chain === "matic") {
      setIsMatic(true);
    }

    setAddress(address);
    setTokenId(token);

    //grabColors(new Image(), simplify);
  }

  function download() {
    if (!simplifiedImageSrc) return;
    const link = document.createElement("a");
    link.download = `${NFT.data?.name}-simplified-.png`;
    link.href = simplifiedImageSrc;
    link.click();
  }

type RGBColor = [number, number, number];

function quantizeImage(
  imageData: ImageData,
  numColors: number,
  maxIterations = 10,
  sampleRate = 1,
  resizeScale = 1
): number[][] {
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  tempCtx?.putImageData(imageData, 0, 0);

  // Create a new canvas for resizing
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = imageData.width * resizeScale;
  canvas.height = imageData.height * resizeScale;
  ctx?.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
  const resizedImageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);


  const pixels: RGBColor[] = [];
  if (resizedImageData) {
    for (let i = 0; i < resizedImageData.data.length; i += 4) {
      if (Math.random() < sampleRate) {
        pixels.push([
          resizedImageData.data[i]!,
          resizedImageData.data[i + 1]!,
          resizedImageData.data[i + 2]!,
        ]);
      }
    }
  }

  const clusters: RGBColor[] = [];
  for (let i = 0; i < numColors; i++) {
    if (pixels.length === 0) break;
    
    clusters.push(pixels[Math.floor(Math.random() * pixels.length)]!);
  }

  let assignments: number[] = [];
  let hasChanged = true;
  let iteration = 0;
  while (hasChanged && iteration < maxIterations) {
    hasChanged = false;
    assignments = pixels.map((pixel) => {
      let minDistance = Infinity;
      let clusterIndex = -1;
      clusters.forEach((cluster, index) => {
        const distance =
          (cluster[0] - pixel[0]) * (cluster[0] - pixel[0]) +
          (cluster[1] - pixel[1]) * (cluster[1] - pixel[1]) +
          (cluster[2] - pixel[2]) * (cluster[2] - pixel[2]);
        if (distance < minDistance) {
          minDistance = distance;
          clusterIndex = index;
        }
      });
      return clusterIndex;
    });

    const newClusters: RGBColor[] = Array.from({ length: numColors }, () => [
      0, 0, 0,
    ]);
    const counts: number[] = Array(numColors).fill(0) as number[];
    assignments.forEach((clusterIndex, pixelIndex) => {
      newClusters[clusterIndex]![0] += pixels[pixelIndex]![0];
      newClusters[clusterIndex]![1] += pixels[pixelIndex]![1];
      newClusters[clusterIndex]![2] += pixels[pixelIndex]![2];
      counts[clusterIndex]++;
    });
    newClusters.forEach((cluster, index) => {
      if (counts[index]! > 0) {
        cluster[0] /= counts[index]!;
        cluster[1] /= counts[index]!;
        cluster[2] /= counts[index]!;
      }
    });

    for (let i = 0; i < numColors; i++) {
      if (
        clusters[i]![0] !== newClusters[i]![0] ||
        clusters[i]![1] !== newClusters[i]![1] ||
        clusters[i]![2] !== newClusters[i]![2]
      ) {
        hasChanged = true;
        clusters[i] = newClusters[i]!;
      }
    }
    iteration++;
  }

  for (let i = 0; i < imageData.data.length; i += 4) {
    const x = (i / 4) % imageData.width;
    const y = Math.floor(i / 4 / imageData.width);
    const resizedX = Math.floor(x * resizeScale);
    const resizedY = Math.floor(y * resizeScale);
    const resizedIndex = (resizedY * resizedImageData!.width + resizedX) * 4;
    const clusterIndex = assignments[resizedIndex / 4];
    if (clusterIndex !== undefined) {
      const cluster = clusters[clusterIndex];
      imageData.data[i] = cluster![0];
      imageData.data[i + 1] = cluster![1];
      imageData.data[i + 2] = cluster![2];
    }
  }

  return clusters.map((cluster) => [
    Math.round(cluster[0]),
    Math.round(cluster[1]),
    Math.round(cluster[2]),
  ]);
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
          <h1 className="justify-center text-center text-5xl font-extrabold tracking-tight text-black sm:text-[5rem]">
            NFT Background remover
          </h1>
          {/* <Button label="Manifesto" onClick={() => setOpen(!open)} /> */}
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

          <div className="flex ">
            <div className="flex flex-col sm:flex-row">
              <div>
                {darkestColor && (
                  <div className="-mb-[20px] ml-20 flex-none sm:ml-0">
                    <div
                      className="border border-black"
                      style={{
                        backgroundColor: rgbToHex(darkestColor),
                        width: "20px",
                        height: "20px",
                      }}
                    />
                  </div>
                )}
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:flex-none sm:pr-2">
                    {palette && (
                      <div className="flex flex-col  ">
                        <div className="flex justify-center sm:hidden">
                          {palette.map((color, index) =>
                            index % 2 === 0 &&
                            darkestColor &&
                            color.toString() !== darkestColor.toString() ? (
                              <div
                                key={index}
                                className="border border-black"
                                style={{
                                  backgroundColor: rgbToHex(color),
                                  width: "20px",
                                  height: "20px",
                                }}
                              />
                            ) : null
                          )}
                        </div>
                        <div className="mb-1 flex justify-center sm:hidden">
                          {palette.map((color, index) =>
                            index % 2 !== 0 &&
                            darkestColor &&
                            color.toString() !== darkestColor.toString() ? (
                              <div
                                key={index}
                                className="border border-black"
                                style={{
                                  backgroundColor: rgbToHex(color),
                                  width: "20px",
                                  height: "20px",
                                }}
                              />
                            ) : null
                          )}
                        </div>
                        <div className="mt-8 hidden grid-cols-2 grid-rows-2 gap-0 sm:grid">
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
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    {imageSrc && (
                      <div
                        className="relative flex h-screen w-screen"
                        style={{ maxWidth: "500px", maxHeight: "500px" }}
                      >
                        <div className="absolute h-full w-full rounded bg-white" />
                        <img
                          id="unchangedImg"
                          src={imageSrc}
                          alt="Uploaded preview"
                          className="absolute h-full w-full rounded border border-black object-contain shadow"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* <div className="flex items-center justify-center sm:hidden">
                <div className="text-3xl">↓</div>
              </div> */}

              <div className="flex items-center justify-center sm:hidden">
                {loader ? (
                  <div className="relative mb-20 ml-[62px] w-5/12 items-center justify-center">
                    <div className="absolute  ml-10 mt-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-900 border-b-blue-700 border-t-blue-700"></div>
                  </div>
                ) : (
                  <div className="mb-2 flex w-5/12 items-center justify-center">
                    <div className="text-7xl">↓</div>
                  </div>
                )}
              </div>

              {loader ? (
                <div className="relative ml-[62px] flex hidden w-5/12 items-center justify-center sm:flex">
                  <div className="absolute ml-6 h-12 w-12 animate-spin rounded-full border-4 border-gray-900 border-b-blue-700 border-t-blue-700"></div>
                </div>
              ) : (
                <div className="flex hidden w-5/12 items-center justify-center sm:flex">
                  <div className="text-7xl">→</div>
                </div>
              )}

              <div>
                {/* Simplified image and palette code */}
                {simplifiedDarkestColor && (
                  <div className="-mb-[20px] ml-32 flex-none sm:ml-1">
                    <div
                      className="border border-black"
                      style={{
                        backgroundColor: rgbToHex(simplifiedDarkestColor),
                        width: "20px",
                        height: "20px",
                      }}
                    />
                  </div>
                )}
                <div className="block items-start sm:flex">
                  <div className="flex-none px-1 sm:pr-2">
                    {simplifiedPalette && (
                      <div className="flex flex-col">
                        <div className="flex justify-center sm:hidden">
                          {simplifiedPalette.map((color, index) =>
                            index < 64 &&
                            index % 2 === 0 &&
                            simplifiedDarkestColor &&
                            color.toString() !==
                              simplifiedDarkestColor.toString() ? (
                              <div
                                key={index}
                                className="border border-black"
                                style={{
                                  backgroundColor: rgbToHex(color),
                                  width: "20px",
                                  height: "20px",
                                }}
                              />
                            ) : null
                          )}
                        </div>
                        <div className="mb-1 flex justify-center sm:hidden">
                          {simplifiedPalette.map((color, index) =>
                            index < 64 &&
                            index % 2 !== 0 &&
                            simplifiedDarkestColor &&
                            color.toString() !==
                              simplifiedDarkestColor.toString() ? (
                              <div
                                key={index}
                                className="border border-black"
                                style={{
                                  backgroundColor: rgbToHex(color),
                                  width: "20px",
                                  height: "20px",
                                }}
                              />
                            ) : null
                          )}
                        </div>
                        <div className="mt-8 hidden grid-cols-2 grid-rows-2 gap-0 sm:grid">
                          {simplifiedPalette.map(
                            (color, index) =>
                              index < 64 &&
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
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    {simplifiedImageSrc && (
                      <div>
                        {/* <div className="-mt-0 sm:-mt-[60px]">
                          <NumberSlider
                            imageSrc={imageSrc ?? ""}
                            simplify={simplify}
                            setSimplify={setSimplify}
                            grabColors={grabColors}
                          />
                        </div> */}
                        <div
                          className="relative flex h-screen w-screen"
                          style={{ maxWidth: "500px", maxHeight: "500px" }}
                        >
                          <div className="absolute h-full w-full rounded bg-white " />
                          <img
                            src={simplifiedImageSrc}
                            alt="Simplified preview"
                            className="absolute z-50 h-full w-full cursor-pointer rounded border border border-black object-contain shadow"
                          />
                        </div>
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
        {simplifiedImageSrc && (
          <TwitterShare
            simplifiedImageSrc={simplifiedImageSrc}
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
