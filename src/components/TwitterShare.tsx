import React from "react";

type TwitterShareProps = {
  publicId: string;
};

const imgUrl = process.env.NEXT_PUBLIC_IMG_URL;

const TwitterShare: React.FC<TwitterShareProps> = ({ publicId }) => {
  const url = `${imgUrl}${publicId}`;
  const tweetText = `Check out my image: ${url}`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText
  )}`;

  return (
    <div>
      <a href={tweetUrl} target="_blank" rel="noopener noreferrer">
        Tweet this!
      </a>
    </div>
  );
};

export default TwitterShare;
