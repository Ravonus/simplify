import React, { useEffect, useState } from "react";
import Button from "./Button";
import crypto from "crypto";

type TwitterShareProps = {
  title: string;
  contract?: string;
  tokenId?: string;
  isMatic?: boolean;
  simplifiedImageSrc: string;
};

const imgUrl = process.env.NEXT_PUBLIC_IMG_URL;

const TwitterShare: React.FC<TwitterShareProps> = ({
  simplifiedImageSrc,
  title,
  contract,
  tokenId,
  isMatic,
}) => {
  const [publicId, setPublicId] = useState<string | undefined>(undefined);
  const [tweetUrl, setTweetUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!publicId) return;
    const url = `${imgUrl}${publicId}?contract=${contract}&tokenId=${tokenId}${
      isMatic ? "&matic=true" : ""
    }`;
    const createdBy = "Created By: @R4vonus";

    const description = `I've done my part for the NFT space and simplified my ${title} NFT!`;

    const tweetText = `${description}\n\n${createdBy}\n\n${url}`;

    const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}`;

    setTweetUrl(tweet);

    // handleUploadToCloudinary()
    //   .then(() => {
    //     const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    //       tweetText
    //     )}`;
    //     setTweetUrl(tweet);
    //   })
    //   .catch((e) => console.error(e));
  }, [publicId]);

  //on tweetURL we need to click the button again
  useEffect(() => {
    const el = document.querySelector("#tweetButton");
    if (el && "click" in el) {
      // Check that 'click' is a property of el
      (el as HTMLElement).click(); // Type assertion
    }
  }, [tweetUrl]);

  const handleUploadToCloudinary = async () => {
    console.log("simplifiedImageSrc", simplifiedImageSrc);
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

  function generateHash(data: string) {
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  return (
    <>
      <div>
        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          id="tweetButton"
        >
          <Button
            label="Share on X"
            onClick={() => {
              handleUploadToCloudinary().catch((e) => console.log(e));
            }}
          />
        </a>
      </div>
    </>
  );
};

export default TwitterShare;
