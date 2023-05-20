import express, { Request, Response, NextFunction } from "express";
import { FoodDoc, Vandor } from "../models";

export const GetFoodAvailability = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;

  const result = await Vandor.find({
    pincode: pincode,
    serviceAvailable: false,
  })
    .sort([["rating", "descending"]])
    .populate("foods");

  if (result.length > 0) {
    return resp.status(200).json(result);
  }

  return resp.status(400).json({ message: "Data Not Found!" });
};

export const GetTopRestaurants = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;

  const result = await Vandor.find({
    pincode: pincode,
    serviceAvailable: false,
  })
    .sort([["rating", "descending"]])
    .limit(10);

  if (result.length > 0) {
    return resp.status(200).json(result);
  }

  return resp.status(400).json({ message: "Data Not Found!" });
};

export const GetFoodsIn30Min = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;

  const result = await Vandor.find({
    pincode: pincode,
    serviceAvailable: false,
  }).populate("foods");

  if (result.length > 0) {
    let foodResults: any = [];
    result.map((vandor) => {
      const foods = vandor.foods as [FoodDoc];
      foodResults.push(...foods.filter((food) => food.readyTime <= 30));
    });
    return resp.status(200).json(foodResults);
  }

  return resp.status(400).json({ message: "Data Not Found!" });
};

export const SearchFoods = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;

  const result = await Vandor.find({
    pincode: pincode,
    serviceAvailable: false,
  }).populate("foods");

  if (result.length > 0) {
    let foodResults: any = [];
    result.map((vandor) => {
      foodResults.push(...vandor.foods);
    });

    return resp.status(200).json(foodResults);
  }

  return resp.status(400).json({ message: "Data Not Found!" });
};

export const RestaurantById = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  const result = await Vandor.findById(id).populate("foods");
  if (result) {
    return resp.status(200).json(result);
  }

  return resp.status(400).json({ message: "Data Not Found!" });
};
