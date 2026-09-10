export function getPostMediaItems(post) {
  if (!post) return [];

  const media = post.media;
  if (Array.isArray(media) && media.length > 0) {
    return media
      .filter((m) => m && m.url)
      .map((m, i) => ({
        url: m.url,
        publicId: m.publicId || "",
        type: m.type === "video" ? "video" : "image",
        order: typeof m.order === "number" ? m.order : i
      }))
      .sort((a, b) => a.order - b.order);
  }

  // Legacy single object (pre-migration docs)
  if (media && typeof media === "object" && media.url) {
    return [
      {
        url: media.url,
        publicId: media.publicId || "",
        type: media.type === "video" ? "video" : "image",
        order: 0
      }
    ];
  }

  const items = [];
  if (post.image) {
    items.push({
      url: post.image,
      publicId: "",
      type: "image",
      order: items.length
    });
  }
  if (post.videoUrl) {
    items.push({
      url: post.videoUrl,
      publicId: "",
      type: "video",
      order: items.length
    });
  }
  return items;
}
