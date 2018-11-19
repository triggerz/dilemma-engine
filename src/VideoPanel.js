import React from 'react';

function getYoutubeId(url) {
  url = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  if (url[2] !== undefined) {
    const id = url[2].split(/[^0-9a-z_]/i);
    return id[0];
  }
}

function normalizeIfYoutubeLink(url) {
  const youtubeId = getYoutubeId(url);
  if (youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}`;
  } else {
    return url;
  }
}

const VideoPanel = ({ video }) => (<div className="card video">
  <div className="container">
    <iframe title="embedded video" src={normalizeIfYoutubeLink(video)} frameBorder="0" gesture="media" allow="encrypted-media" allowFullScreen />
  </div>
</div>);

export default VideoPanel;
