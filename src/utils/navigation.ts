export const navigateTo = (path: string) => {
  if (typeof window !== "undefined") {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  }
};
