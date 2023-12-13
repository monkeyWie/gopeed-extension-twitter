import { TwitterDL } from 'twitter-downloader';

// pic: https://twitter.com/JayPlayDota/status/1722130386980085783
// gif: https://twitter.com/JayPlayDota/status/1716726244371579150
// video: https://twitter.com/bbcchinese/status/1734145541599383880
gopeed.events.onResolve(async (ctx) => {
  const resp = await TwitterDL(ctx.req.url);
  if (resp.status != 'success') {
    throw new MessageError(resp.message);
  }
  const result = resp.result;
  gopeed.logger.debug('media', JSON.stringify(result));
  if (result.media.length == 0) {
    throw new MessageError('no media found');
  }
  const name = `twitter-status-${result.id}`;
  ctx.res = {
    name,
    files: result.media.map((media, index) => {
      if (media.type == 'photo') {
        return {
          name: `${name}-${index + 1}.${resolveSuffixByUrl(media.image)}`,
          req: {
            url: media.image,
          },
        };
      } else {
        const bestQualityVideo = media.videos.sort((a, b) => b.bitrate - a.bitrate)[0];
        return {
          name: `${name}-${index + 1}.${resolveSuffixByContentType(bestQualityVideo.content_type)}`,
          req: {
            url: bestQualityVideo.url,
          },
        };
      }
    }),
  };
});

function resolveSuffixByUrl(url) {
  const u = new URL(url);
  const path = u.pathname.split('/');
  const filename = path[path.length - 1];
  const filenameParts = filename.split('.');
  return filenameParts[filenameParts.length - 1];
}

function resolveSuffixByContentType(contentType) {
  const parts = contentType.split('/');
  return parts[parts.length - 1];
}
