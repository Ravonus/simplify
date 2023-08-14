import React from "react";

type TwitterShareProps = {
  publicId: string;
  title: string;
};

const imgUrl = process.env.NEXT_PUBLIC_IMG_URL;

const TwitterShare: React.FC<TwitterShareProps> = ({ publicId, title }) => {
  const url = `${imgUrl}${publicId}`;
  const createdBy = "Created By: @R4vonus";
  const intro = 'Studies show that brain power is reduced by 20% when you see a NFT with more than 3 colors.'
  const description = `So I just simplified my ${title} NFT!`;

  const tweetText = `${intro}\n${description}\n\n${createdBy}\n\n${url}`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText
  )}`;

  return (
    <div>
      <a href={tweetUrl} target="_blank" rel="noopener noreferrer">
        Share on X
      </a>
    </div>
  );
};

export default TwitterShare;
