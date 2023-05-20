import mongoose, { Schema, Document, Model, mongo } from "mongoose";

export interface FoodDoc extends Document {
  vandorId: string;
  name: string;
  description: string;
  category: string;
  foodType: string;
  readyTime: number;
  price: string;
  rating: string;
  images: [string];
}

const FoodSchema = new Schema(
  {
    vandorId: { type: String },
    name: { type: String, require: true },
    description: { type: String, require: true },
    category: { type: String },
    foodType: { type: String, require: true },
    readyTime: { type: Number },
    price: { type: String, require: true },
    rating: { type: String },
    images: { type: [String] },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v, delete ret.createdAt, delete ret.updatedAt;
      },
      timestamps: true,
    },
  }
);

const Food = mongoose.model<FoodDoc>("food", FoodSchema);
export { Food };
