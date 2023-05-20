import { Request, Response, NextFunction } from "express";
import { FindVandor } from "./AdminController";
import { CreateFoodInputs, EditVandorProfile, VandorLoginInputs } from "../dto";
import { GenerateSignature, ValidatePassword } from "../utility";
import { Food } from "../models";

export const VandorLogin = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const { email, password } = <VandorLoginInputs>req.body;
  const existingVandor = await FindVandor("", email);

  if (existingVandor !== null) {
    const validation = await ValidatePassword(
      password,
      existingVandor.password,
      existingVandor.salt
    );
    if (validation) {
      const signature = GenerateSignature({
        _id: existingVandor._id,
        name: existingVandor.name,
        foodType: existingVandor.foodType,
        email: existingVandor.email,
      });

      return resp.json({ token: signature });
    } else {
      return resp.json({ message: "Password is not valid!!" });
    }
  }

  return resp.json({ message: "Invalid login credentials!!" });
};

export const GetVandorProfile: any = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const existingVandor = await FindVandor(user._id);
    return resp.status(200).json(existingVandor);
  }

  return resp.status(404).json({ message: "User not found!" });
};

export const UpdateVandorProfile = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const { name, phone, foodType, address } = <EditVandorProfile>req.body;
  const user = req.user;
  if (user) {
    const existingVandor = await FindVandor(user._id);
    if (existingVandor !== null) {
      existingVandor.name = name;
      existingVandor.phone = phone;
      existingVandor.foodType = foodType;
      existingVandor.address = address;
      const savedResult = await existingVandor.save();
      return resp.json(savedResult);
    }
    return resp.status(200).json(existingVandor);
  }
  return resp.status(404).json({ message: "Vandor info not found!" });
};

export const UpdateVandorCoverImage = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const vandor = await FindVandor(user._id);
    if (vandor != null) {
      const files = req.files as [Express.Multer.File];

      const images = files.map((file: Express.Multer.File) => file.filename);

      vandor.coverImages.push(...images);

      const result = await vandor.save();
      return resp.json(result);
    }
  }
  return resp.status(404).json({ message: "Something went wrong with food!" });
};

export const UpdateVandorService = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const existingVandor = await FindVandor(user._id);
    if (existingVandor !== null) {
      existingVandor.serviceAvailable = !existingVandor.serviceAvailable;
      const savedResult = await existingVandor.save();
      return resp.status(200).json(savedResult);
    }
    return resp.status(200).json(existingVandor);
  }
  return resp.status(404).json({ message: "Vandor info not found!" });
};

export const AddFood = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const { name, description, category, foodType, readyTime, price } = <
      CreateFoodInputs
    >req.body;

    const vandor = await FindVandor(user._id);
    if (vandor != null) {
      const files = req.files as [Express.Multer.File];

      const images = files.map((file: Express.Multer.File) => file.filename);

      const createFood = await Food.create({
        vandorId: vandor._id,
        name,
        description,
        category,
        foodType,
        images: images,
        readyTime,
        price,
        rating: 0,
      });

      vandor.foods.push(createFood._id);
      const result = await vandor.save();
      return resp.json(result);
    }
  }
  return resp.status(404).json({ message: "Something went wrong with food!" });
};

export const GetFoods = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const foods = await Food.find({ vandorId: user._id });
    if (foods !== null) {
      return resp.status(200).json(foods);
    }
  }
  return resp.status(404).json({ message: "Foods info not found!" });
};
