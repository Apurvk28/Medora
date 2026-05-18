const cloud_name = import.meta.env.VITE_CLOUD_NAME;
const upload_preset = import.meta.env.VITE_UPLOAD_PRESET;

const uploadImageToCloudinary = async (file) => {
  if (!cloud_name || !upload_preset) {
    console.warn(
      "Cloudinary keys (VITE_CLOUD_NAME, VITE_UPLOAD_PRESET) are missing from .env. Using local object URL fallback."
    );
    return { url: URL.createObjectURL(file) };
  }

  const uploadData = new FormData();

  uploadData.append("file", file);
  uploadData.append("upload_preset", upload_preset);
  uploadData.append("cloud_name", cloud_name);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
    {
      method: "post",
      body: uploadData,
    }
  );

  const data = await res.json();
  return data;
};

export default uploadImageToCloudinary;
