import { Router } from 'express';
import aws from 'aws-sdk';
import dotenv from 'dotenv';
import path from 'path';
import multer from 'multer';
import multerS3 from 'multer-s3';

import authenticate from '../helperfunctions/authenticate.js';
import getDetails from '../helperfunctions/userdetails.js';
import pool from '../helperfunctions/pool.js';

import ProfileController from '../controllers/profile.controller.js';

// configure env variables
const envFilePath = '.env';
dotenv.config({ path: path.normalize(envFilePath) });

// Initialise the S3 SDK with our secret keys from environment variables.
const s3 = new aws.S3({
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY,
});

// Initialise the Multer SDK with multerS3.
const multerUpload = multer({
  storage: multerS3({
    s3,
    bucket: 'collab',
    acl: 'public-read',
    metadata: (request, file, callback) => {
      callback(null, { fieldName: file.fieldname });
    },
    key: (request, file, callback) => {
      callback(null, Date.now().toString());
    },
  }),
});

const router = Router();
const prefix = '/profile';

const profileController = new ProfileController(pool);

router.get(`${prefix}`, authenticate, getDetails, profileController.getProfile);
router.post(`${prefix}/:id/photo`, authenticate, getDetails, multerUpload.single('photo'), profileController.uploadUserPhoto);
router.put(`${prefix}/:id`, authenticate, getDetails, multerUpload.single('photo'), profileController.editProfile);

export default router;
