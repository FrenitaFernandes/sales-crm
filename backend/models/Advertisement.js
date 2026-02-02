const AdvertisementSchema = new mongoose.Schema({
  date: Date,
  productName: String,
  tagline: String,
  description: String,
  keywords: String,
  productLink: String,
  type: String,
  targetArea: String,
  targetAudience: String,
  thumbnail: String, // file path
});
