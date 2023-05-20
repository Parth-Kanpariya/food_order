import express, { Request, Response, NextFunction } from "express";
import { CreateVandorInput } from "../dto";
import { Vandor } from "../models";
import { GeneratePassword, GenerateSalt } from "../utility";

export const FindVandor = async (id: string | undefined, email?: string) => {
  if (email) {
    return await Vandor.findOne({ email: email });
  } else {
    return await Vandor.findById(id);
  }
};

export const CreateVandor = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const {
    name,
    ownerName,
    foodType,
    pincode,
    address,
    phone,
    email,
    password,
  } = <CreateVandorInput>req.body;

  const existingVandor = await FindVandor("", email);
  if (existingVandor != null) {
    return resp.json({ message: "Vandor already exist!!" });
  }

  //generate a salt
  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);
  //encrypt the password using the salt

  const createVandor = await Vandor.create({
    name: name,
    ownerName: ownerName,
    foodType: foodType,
    pincode: pincode,
    address: address,
    phone: phone,
    email: email,
    password: userPassword,
    salt: salt,
    rating: 0,
    serviceAvailable: false,
    coverImages: [],
    foods: [],
  });

  resp.json(createVandor);
};

export const GetVandors = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const vandorsData = await Vandor.find();
  if (vandorsData !== null) {
    return resp.json(vandorsData);
  }

  return resp.json({ message: "vandors data not found!" });
};

export const GetVandorById = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const vandorId = req.params.id;
  const vandor = await FindVandor(vandorId);
  if (vandor !== null) {
    return resp.json(vandor);
  }

  return resp.json({ message: "Vandor not Found!" });
};
