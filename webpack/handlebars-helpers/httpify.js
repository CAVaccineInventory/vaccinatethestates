const httpify = (website) => {
  if (website) {
    website = website.trim();
    if (!website.startsWith("http")) {
      website = `//${website}`;
    }
  }
  return website;
};

export default httpify;
