const mongoose = require("mongoose");

//mongoose.connect(`mongodb://localhost/${process.env.DB_NAME}`);

const { Schema } = mongoose;

const reviewsSchema = new Schema({
  review_id: Int,
  product_id: Int,
  rating: Int,
  summary: String,
  recommend: Bool,
  response: String,
  body: String,
  reviewer_name: String,
  helpfulness: Int,
  photos: Array,
  report: Bool,
});

const reviewsMetaSchema = new Schema({
  product_id: Int,
  rating: Obj
  recommend: Obj,
  characteristics: Obj,
});

const reviewsModel = mongoose.model('reviewsModel', reviewsSchema);
const reviewsMetaModel = mongoose.model('reviewsMetaModel', reviewsMetaSchema);

module.exports = {
  // readAll: () => {
  //   return reviewsModel.find({}).sort('review_id');
  // }
};