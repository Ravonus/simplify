import React from "react";
import Button from './Button';

type TwitterShareProps = {
  publicId: string;
  title: string;
  contract?: string;
  tokenId?: string;
};

const imgUrl = process.env.NEXT_PUBLIC_IMG_URL;

const TwitterShare: React.FC<TwitterShareProps> = ({ publicId, title, contract, tokenId }) => {
  const url = `${imgUrl}${publicId}?contract=${contract}&tokenId=${tokenId}`;
  const createdBy = "Created By: @R4vonus";

  const description = `I've done my part for the NFT space and simplified my ${title} NFT!`;

  const tweetText = `${description}\n\n${createdBy}\n\n${url}`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText
  )}`;

  return (
    <div>
      <a href={tweetUrl} target="_blank" rel="noopener noreferrer">
        <Button label="Share on X" />
      </a>
    </div>
  );
};

export default TwitterShare;
