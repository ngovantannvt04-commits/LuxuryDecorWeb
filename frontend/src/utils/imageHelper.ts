export const getOptimizedAvatar = (url: string | null) => {
  if (!url) return "/logo-niri-main.png";
  if (!url.includes("cloudinary")) return url; 

  // Chèn tham số tối ưu vào URL
  return url.replace("/upload/", "/upload/w_200,h_200,c_fill,q_auto,f_auto/");
};