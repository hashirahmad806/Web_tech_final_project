export async function compressImageForVision(file) {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not read the selected image."));
      img.src = imageUrl;
    });

    const shouldCompress =
      file.size > 1.5 * 1024 * 1024 ||
      file.type !== "image/jpeg" ||
      image.width > 1400 ||
      image.height > 1400;

    if (!shouldCompress) {
      return file;
    }

    const maxDimension = 1280;
    const scale = Math.min(maxDimension / image.width, maxDimension / image.height, 1);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not prepare the image for upload.");
    }

    context.drawImage(image, 0, 0, width, height);

    const compressedBlob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
            return;
          }

          reject(new Error("Could not compress the image."));
        },
        "image/jpeg",
        0.72,
      );
    });

    return new File([compressedBlob], `${file.name.replace(/\.[^.]+$/, "") || "upload"}.jpg`, {
      type: "image/jpeg",
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
