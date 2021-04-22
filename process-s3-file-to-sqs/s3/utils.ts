export const chunk = (array, chunkLength = 1) => {
  const chunks = [];

  while (array.length > 0) {
    chunks.push(array.splice(0, chunkLength));
  }

  return chunks;
};
