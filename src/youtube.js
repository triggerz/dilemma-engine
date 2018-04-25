function getYoutubeId(url) {
  url = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  if (url[2] !== undefined) {
    const id = url[2].split(/[^0-9a-z_]/i);
    return id[0];
  }
}

export default function normalizeIfYoutubeLink(url) {
  const youtubeId = getYoutubeId(url);
  if (youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}`;
  } else {
    return url;
  }
}
