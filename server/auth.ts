import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage as mainStorage } from "./storage";
import {
  User as SelectUser,
  registerSchema,
  loginSchema,
} from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url); // Get current file URL
const __dirname = path.dirname(__filename); // Get current directory path

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const uploadDir = path.join(__dirname, "uploads", "profile_images");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Configure multer mainStorage and file validation
  const storage = multer.diskStorage({
    destination: (req: any, file: Express.Multer.File, cb: Function) => {
      cb(null, uploadDir); // Save the files in the profile_images directory
    },
    filename: (req: any, file: Express.Multer.File, cb: Function) => {
      const fileExt = path.extname(file.originalname); // Get file extension
      const fileName = Date.now() + fileExt; // Use timestamp for a unique file name
      cb(null, fileName); // Save file with the unique name and extension
    },
  });

  // Restrict file types to .png and .jpg
  const fileFilter: any = (
    req: Request,
    file: Express.Multer.File,
    cb: Function
  ) => {
    const allowedMimeTypes = ["image/jpeg", "image/png"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error("Only .jpg and .png files are allowed"), false); // Reject the file
    }
  };

  // Configure multer with file size limit (optional) and file filter
  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB file size limit
    },
  }).single("profile_img");

  const sessionSettings: session.SessionOptions = {
    secret:
      process.env.SESSION_SECRET || "project-management-timetracker-secret",
    resave: false,
    saveUninitialized: false,
    store: mainStorage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await mainStorage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await mainStorage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Validate the registration data
      const registerData = registerSchema.parse(req.body);

      const existingUser = await mainStorage.getUserByUsername(
        registerData.username
      );
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create the user with a hashed password
      const user = await mainStorage.createUser({
        username: registerData.username,
        password: await hashPassword(registerData.password),
        name: registerData.name,
        email: registerData.email,
        role: registerData.role || "employee",
        department: registerData.department,
        profile_img: registerData.profile_img,
      });

      // Remove the password from the response
      const { password, ...userWithoutPassword } = user;

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res
          .status(400)
          .json({ message: "Invalid registration data", errors: error.errors });
      }
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    try {
      // Validate the login data
      loginSchema.parse(req.body);

      passport.authenticate(
        "local",
        (err: any, user: Express.User, info: { message: any }) => {
          if (err) return next(err);
          if (!user) {
            return res
              .status(401)
              .json({ message: info?.message || "Invalid credentials" });
          }

          req.login(user, (err) => {
            if (err) return next(err);

            // Remove the password from the response
            const { password, ...userWithoutPassword } = user;

            res.status(200).json(userWithoutPassword);
          });
        }
      )(req, res, next);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res
          .status(400)
          .json({ message: "Invalid login data", errors: error.errors });
      }
      next(error);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    // Remove the password from the response
    const { password, ...userWithoutPassword } = req.user!;

    res.json(userWithoutPassword);
  });

  app.post("/api/upload-avatar", upload, (req: any, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Log the file path for debugging
      console.log(
        `File uploaded to: ${path.join(
          __dirname,
          "uploads",
          "profile_images",
          req.file.filename
        )}`
      );

      // Generate the file URL for the uploaded image
      const fileUrl = `/uploads/profile_images/${req.file.filename}`;

      // Respond with the image URL
      res.status(200).json({ imageUrl: fileUrl });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error uploading image" });
    }
  });

  app.put("/api/user", async (req, res) => {
    try {
      const { name, email, username, department, profile_img, newPassword } =
        req.body;

      // Check if the username already exists
      // const existingUser = await mainStorage.getUserByUsername(username);
      // if (existingUser && existingUser.username !== username) {
      //   return res.status(400).json({ message: "Username already exists" });
      // }

      // Prepare the update data
      const updateData = {
        name,
        email,
        username,
        department,
        profile_img,
        password: newPassword,
      };
      if (newPassword) {
        updateData.password = await hashPassword(newPassword); // Hash the new password
      }

      // Update user profile in the database
      const updatedUser = await mainStorage.updateUserProfile(
        username,
        updateData
      );

      res.status(200).json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error updating profile" });
    }
  });
}
