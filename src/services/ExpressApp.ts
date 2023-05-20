import express, { Application } from "express";
import mongoose from "mongoose";
import {
  AdminRoutes,
  VandorRoutes,
  ShoppingRoute,
  CustomerRoute,
} from "../routes";
import path from "path";

export default async (app: Application) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const imagePath = path.join(__dirname, "images");
  app.use("/images", express.static(imagePath));

  app.use("/admin", AdminRoutes);
  app.use("/vandor", VandorRoutes);
  app.use("/customer", CustomerRoute);
  app.use("/shopping", ShoppingRoute);

  return app;
};
