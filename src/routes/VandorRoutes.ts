import express, { Request, Response, NextFunction } from "express";
import {
  AddFood,
  GetFoods,
  GetVandorProfile,
  UpdateVandorCoverImage,
  UpdateVandorProfile,
  UpdateVandorService,
  VandorLogin,
} from "../controllers";
import { Authenticate } from "../middlewares";
import multer from "multer";

const router = express.Router();

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const imagesUpload = multer({ storage: imageStorage }).array("images", 10);

router.post("/login", VandorLogin);
router.use(Authenticate);
router.get("/profile", GetVandorProfile);
router.patch("/profile", UpdateVandorProfile);
router.patch("/coverimage", imagesUpload, UpdateVandorCoverImage);
router.patch("/service", UpdateVandorService);

router.post("/food", imagesUpload, AddFood);
router.get("/foods", GetFoods);

router.get("/", (req: Request, resp: Response, next: NextFunction) => {
  resp.json({
    message: "Hello from vandor",
  });
});

export { router as VandorRoutes };
