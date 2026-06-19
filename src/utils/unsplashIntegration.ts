import { getEnvVar } from "./envManager";

export async function searchUnsplashPhotos(query: string, page = 1, perPage = 20) {
  const accessKey = getEnvVar("VITE_UNSPLASH_ACCESS_KEY");
  
  if (!accessKey || accessKey === "undefined" || accessKey === "null" || accessKey.trim() === "") {
    console.warn("VITE_UNSPLASH_ACCESS_KEY is missing. Using mock photos.");
    return generateMockPhotos(query, perPage);
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`
        }
      }
    );

    if (!response.ok) {
      console.warn(`Unsplash API error status ${response.status}. Falling back to mock photos.`);
      return generateMockPhotos(query, perPage);
    }

    const data = await response.json();
    return data.results; // Array of photo objects
  } catch (error) {
    console.warn("Unsplash API fetch failed. Falling back to mock photos.", error);
    return generateMockPhotos(query, perPage);
  }
}

export async function getUnsplashRandom(count = 20) {
  const accessKey = getEnvVar("VITE_UNSPLASH_ACCESS_KEY");
  if (!accessKey || accessKey === "undefined" || accessKey === "null" || accessKey.trim() === "") {
    return generateMockPhotos("random", count);
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?count=${count}`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`
        }
      }
    );

    if (!response.ok) {
      console.warn(`Unsplash API random error status ${response.status}. Falling back to mock photos.`);
      return generateMockPhotos("random", count);
    }

    return await response.json();
  } catch (error) {
    console.warn("Unsplash random fetch failed. Falling back to mock photos.", error);
    return generateMockPhotos("random", count);
  }
}

// Retain compatibility wrapper
export const fetchUnsplashPhotos = async (
  query = "nature",
  page = 1,
  perPage = 30,
) => {
  try {
    const rawResults = await searchUnsplashPhotos(query, page, perPage);
    // If it's returning mock results directly (they won't have standard structure of real unsplash object):
    if (rawResults && rawResults[0]?.id?.startsWith("mock-unsplash")) {
      return rawResults;
    }
    return rawResults.map((img: any) => ({
      id: img.id,
      url: img.urls?.regular || img.url,
      thumbnail: img.urls?.thumb || img.thumbnail,
      full: img.urls?.full || img.full,
      author: img.user?.name || img.author,
      authorUrl: img.user?.links?.html || img.authorUrl,
      source: "unsplash"
    }));
  } catch (error) {
    console.error("fetchUnsplashPhotos failed:", error);
    return generateMockPhotos(query, perPage).map(m => ({
      id: m.id,
      url: m.url,
      thumbnail: m.thumbnail,
      full: m.full,
      author: m.author,
      authorUrl: m.authorUrl,
      source: "unsplash"
    }));
  }
};

const generateMockPhotos = (query: string, count: number) => {
  return Array.from({ length: count }).map((_, i) => {
    const id = (((i + 1) * 17) % 400) + 10;
    return {
      id: `mock-unsplash-${i}`,
      url: `https://picsum.photos/id/${id}/800/600`,
      thumbnail: `https://picsum.photos/id/${id}/400/300`,
      full: `https://picsum.photos/id/${id}/1920/1080`,
      author: "Unsplash Mock",
      authorUrl: "https://unsplash.com",
      source: "unsplash"
    };
  });
};
