import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import express, { Request, Response, NextFunction } from "express";
import {
  CreateCustomerInput,
  EditCustomerProfileInputs,
  UserLoginInputs,
} from "../dto/Customer.dto";
import {
  GenerateOtp,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
  onRequestOTP,
} from "../utility";
import { Customer } from "../models";

export const CustomerSignUp = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const customerInputs = plainToClass(CreateCustomerInput, req.body);
  const inputErrors = await validate(customerInputs, {
    validationError: { target: true },
  });

  if (inputErrors.length > 0) {
    return resp.status(400).json(inputErrors);
  }

  const { email, password, phone } = customerInputs;

  const salt = await GenerateSalt();

  const userPassword = await GeneratePassword(password, salt);

  const { otp, expiry } = GenerateOtp();

  const existCustomer = await Customer.findOne({ email });

  if (existCustomer !== null) {
    return resp
      .status(400)
      .json({ message: "An user alredy exist with same email" });
  }

  const result = await Customer.create({
    email: email,
    password: userPassword,
    salt: salt,
    phone: phone,
    otp: otp,
    otp_expiry: expiry,
    firstname: "",
    lastname: "",
    address: "",
    verified: false,
    lat: 0,
    lng: 0,
  });

  if (result) {
    // send the otp to customer
    await onRequestOTP(otp, phone);
    // generate the signature
    const signature = GenerateSignature({
      _id: result._id,
      email: result.email,
      verified: result.verified,
    });
    //send the result to client
    return resp.status(201).json({
      signature: signature,
      verified: result.verified,
      email: result.email,
    });
  }
  return resp.status(201).json({
    message: "Error with sign up",
  });
};

export const CustomerLogin = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const loginInputs = plainToClass(UserLoginInputs, req.body);
  const loginErrors = await validate(loginInputs, {
    validationError: { target: false },
  });

  if (loginErrors.length > 0) {
    return resp.status(400).json(loginErrors);
  }

  const { email, password } = req.body;

  const customer = await Customer.findOne({ email: email });
  if (customer) {
    const validation = await ValidatePassword(
      password,
      customer.password,
      customer.salt
    );

    if (validation) {
      //generate signature
      const signature = GenerateSignature({
        _id: customer._id,
        verified: customer.verified,
        email: customer.email,
      });

      //send result to the client
      return resp.status(200).json({
        signature,
        verified: customer.verified,
        email: customer.email,
      });
    }
  }

  return resp.status(400).json({ message: "Login Error" });
};

export const CustomerVerify = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const { otp } = req.body;
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
        profile.verified = true;
        const updatedCustomer = await profile.save();

        //generate the signature
        const signature = GenerateSignature({
          _id: updatedCustomer._id,
          email: updatedCustomer.email,
          verified: updatedCustomer.verified,
        });

        return resp.status(201).json({
          signature,
          verified: updatedCustomer.verified,
          email: updatedCustomer.verified,
        });
      }
    }
  }

  return resp.status(201).json({
    message: "Error with OTP verification",
  });
};

export const RequestOtp = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id);
    if (profile) {
      const { otp, expiry } = GenerateOtp();

      profile.otp = otp;
      profile.otp_expiry = expiry;

      await profile.save();
      await onRequestOTP(otp, profile.phone);

      resp.status(200).json({
        message: "OTP sent to your registered mobile number",
      });
    }
  }

  return resp.status(400).json({ message: "Error with registered otp" });
};

export const GetCustomerProfile = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id);
    if (profile) {
      return resp.status(201).json(profile);
    }
  }

  return resp.status(400).json({ message: "No user exist!" });
};

export const EditCustomerProfile = async (
  req: Request,
  resp: Response,
  next: NextFunction
) => {
  const customer = req.user;

  const profileInputs = plainToClass(EditCustomerProfileInputs, req.body);
  const profileErrors = await validate(profileInputs, {
    validationError: { target: false },
  });

  if (profileErrors.length > 0) {
    return resp.status(400).json(profileErrors);
  }

  const { firstname, lastname, address } = req.body;
  if (customer) {
    const profile = await Customer.findById(customer._id);
    if (profile) {
      profile.firstname = firstname;
      profile.lastname = lastname;
      profile.address = address;
      const result = await profile.save();

      return resp.status(201).json(result);
    }
  }

  return resp.status(400).json({ message: "Error in Profile edit!" });
};
