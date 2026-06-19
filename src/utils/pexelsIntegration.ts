import { getEnvVar } from "./envManager";

export async function searchPexelsPhotos(query: string, page = 1, perPage = 20) {
  const apiKey = getEnvVar("VITE_PEXELS_API_KEY");
  
  if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey.trim() === "") {
    console.warn("VITE_PEXELS_API_KEY is missing. Using mock photos.");
    return generateMockPexelsPhotos(query, perPage);
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: apiKey
        }
      }
    );

    if (!response.ok) {
      console.warn(`Pexels API error status ${response.status}. Falling back to mock data.`);
      return generateMockPexelsPhotos(query, perPage);
    }

    const data = await response.json();
    return data.photos; // Array of photo objects
  } catch (error) {
    console.warn("Pexels API fetch failed. Falling back to mock data.", error);
    return generateMockPexelsPhotos(query, perPage);
  }
}

export async function getCuratedPhotos(page = 1, perPage = 20) {
  const apiKey = getEnvVar("VITE_PEXELS_API_KEY");
  if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey.trim() === "") {
    return generateMockPexelsPhotos("curated", perPage);
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/curated?page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: apiKey
        }
      }
    );

    if (!response.ok) {
      console.warn(`Pexels API curated error status ${response.status}. Falling back to mock data.`);
      return generateMockPexelsPhotos("curated", perPage);
    }

    const data = await response.json();
    return data.photos;
  } catch (error) {
    console.warn("Pexels API curated fetch failed. Falling back to mock data.", error);
    return generateMockPexelsPhotos("curated", perPage);
  }
}

export async function searchPexelsVideos(query: string, page = 1, perPage = 15) {
  const apiKey = getEnvVar("VITE_PEXELS_API_KEY");
  if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey.trim() === "") {
    console.warn("VITE_PEXELS_API_KEY is missing. Using mock videos.");
    return generateMockPexelsVideos(query, perPage);
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: apiKey
        }
      }
    );

    if (!response.ok) {
      console.warn(`Pexels videos error status ${response.status}. Falling back to mock videos.`);
      return generateMockPexelsVideos(query, perPage);
    }

    const data = await response.json();
    return data.videos; // Array of video objects
  } catch (error) {
    console.warn("Pexels videos fetch failed. Falling back to mock videos.", error);
    return generateMockPexelsVideos(query, perPage);
  }
}

// Retain a compatibility wrapper just in case any legacy module imports fetchPexelsMedia
export const fetchPexelsMedia = async (
  query = "abstract",
  page = 1,
  perPage = 30,
  type: "photos" | "videos" = "photos"
) => {
  try {
    if (type === "photos") {
      const photos = await searchPexelsPhotos(query, page, perPage);
      return photos.map((img: any) => ({
        id: img.id,
        url: img.src.large,
        thumbnail: img.src.medium,
        full: img.src.original,
        author: img.photographer,
        authorUrl: img.photographer_url,
        source: "pexels"
      }));
    } else {
      const videos = await searchPexelsVideos(query, page, perPage);
      return videos.map((vid: any) => ({
        id: vid.id,
        url: vid.video_files[0]?.link || "",
        thumbnail: vid.image,
        author: vid.user?.name || "Pexels Creator",
        source: "pexels"
      }));
    }
  } catch (error) {
    console.error("fetchPexelsMedia failed:", error);
    return type === "photos" ? generateMockPexelsPhotos(query, perPage) : generateMockPexelsVideos(query, perPage);
  }
};

const generateMockPexelsPhotos = (query: string, count: number) => {
  return Array.from({ length: count }).map((_, i) => {
    const id = (((i + 1) * 31) % 400) + 120;
    return {
      id: `mock-pexels-photo-${i}`,
      src: {
        original: `https://picsum.photos/id/${id}/1920/1080`,
        large: `https://picsum.photos/id/${id}/800/600`,
        medium: `https://picsum.photos/id/${id}/400/300`,
      },
      photographer: "Pexels Mock Photographer",
      photographer_url: "https://pexels.com"
    };
  });
};

const generateMockPexelsVideos = (query: string, count: number) => {
  return Array.from({ length: count }).map((_, i) => {
    return {
      id: `mock-pexels-video-${i}`,
      image: `https://picsum.photos/id/${150 + i}/800/600`,
      video_files: [{ link: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4" }],
      user: { name: "Pexels Mock Video Creator" }
    };
  });
};
