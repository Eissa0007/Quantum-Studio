import { getEnvVar } from "./envManager";

export async function searchPixabayPhotos(query: string, page = 1, perPage = 20) {
  const apiKey = getEnvVar("VITE_PIXABAY_API_KEY");
  
  if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey.trim() === "" || apiKey.includes("@")) {
    console.warn("VITE_PIXABAY_API_KEY is missing or invalid. Using mock photos.");
    return generateMockPixabayAssets(query, perPage, "photo");
  }

  try {
    const response = await fetch(
      `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&page=${page}&per_page=${perPage}`
    );

    if (!response.ok) {
      console.warn(`Pixabay API error status ${response.status}. Falling back to mock photos.`);
      return generateMockPixabayAssets(query, perPage, "photo");
    }

    const data = await response.json();
    return data.hits; // Array of photo objects
  } catch (error) {
    console.warn("Pixabay API photos fetch failed. Falling back to mock photos.", error);
    return generateMockPixabayAssets(query, perPage, "photo");
  }
}

export async function searchPixabayVideos(query: string, page = 1, perPage = 15) {
  const apiKey = getEnvVar("VITE_PIXABAY_API_KEY");
  
  if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey.trim() === "" || apiKey.includes("@")) {
    console.warn("VITE_PIXABAY_API_KEY is missing or invalid. Using mock videos.");
    return generateMockPixabayVideos(query, perPage);
  }

  try {
    const response = await fetch(
      `https://pixabay.com/api/videos/?key=${apiKey}&q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`
    );

    if (!response.ok) {
      console.warn(`Pixabay videos error status ${response.status}. Falling back to mock videos.`);
      return generateMockPixabayVideos(query, perPage);
    }

    const data = await response.json();
    return data.hits; // Array of video objects
  } catch (error) {
    console.warn("Pixabay API videos fetch failed. Falling back to mock videos.", error);
    return generateMockPixabayVideos(query, perPage);
  }
}

export async function searchPixabayIllustrations(query: string, page = 1, perPage = 20) {
  const apiKey = getEnvVar("VITE_PIXABAY_API_KEY");
  if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey.trim() === "" || apiKey.includes("@")) {
    console.warn("VITE_PIXABAY_API_KEY is missing. Using mock illustrations.");
    return generateMockPixabayAssets(query, perPage, "illustration");
  }

  try {
    const response = await fetch(
      `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=illustration&page=${page}&per_page=${perPage}`
    );

    if (!response.ok) {
      console.warn(`Pixabay illustration error status ${response.status}. Falling back to mock illustrations.`);
      return generateMockPixabayAssets(query, perPage, "illustration");
    }

    const data = await response.json();
    return data.hits;
  } catch (error) {
    console.warn("Pixabay API illustrations fetch failed. Falling back to mock illustrations.", error);
    return generateMockPixabayAssets(query, perPage, "illustration");
  }
}

// Retain compatibility
export const fetchPixabayAssets = async (
  query = "icon",
  page = 1,
  perPage = 30,
  type: "vector" | "photo" = "vector"
) => {
  try {
    const hits = type === "vector" 
      ? await searchPixabayIllustrations(query, page, perPage)
      : await searchPixabayPhotos(query, page, perPage);
    
    return hits.map((hit: any) => ({
      id: hit.id,
      url: hit.webformatURL || hit.url,
      thumbnail: hit.previewURL || hit.thumbnail,
      full: hit.largeImageURL || hit.full,
      author: hit.user || hit.author,
      source: "pixabay",
      tags: hit.tags || ""
    }));
  } catch (error) {
    console.error("fetchPixabayAssets failed:", error);
    return [];
  }
};

const generateMockPixabayAssets = (query: string, count: number, type: string) => {
  return Array.from({ length: count }).map((_, i) => {
    const id = (((i + 1) * 23) % 400) + 200;
    return {
      id: `mock-pixabay-${type}-${i}`,
      webformatURL: `https://picsum.photos/id/${id}/800/600`,
      previewURL: `https://picsum.photos/id/${id}/400/300`,
      largeImageURL: `https://picsum.photos/id/${id}/1920/1080`,
      user: "Pixabay Mock Creator",
      tags: "mock, illustration, logo"
    };
  });
};

const generateMockPixabayVideos = (query: string, count: number) => {
  return Array.from({ length: count }).map((_, i) => {
    return {
      id: `mock-pixabay-vid-${i}`,
      videos: {
        medium: {
          url: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4"
        }
      },
      user: "Pixabay Mock Video Creator",
      tags: "stars, space"
    };
  });
};
