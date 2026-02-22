import { Router } from 'express';
import multer from 'multer';
import { authenticate, optionalAuth } from '../middleware/auth';
import {
    getListings,
    getListingById,
    createListing,
    updateListing,
    deleteListing,
    uploadListingImages,
    deleteListingImage,
    getUserListings,
} from '../controllers/listingsController';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    },
});

router.get('/', optionalAuth, getListings);
router.get('/my', authenticate, getUserListings);
router.get('/:id', optionalAuth, getListingById);
router.post('/', authenticate, createListing);
router.put('/:id', authenticate, updateListing);
router.delete('/:id', authenticate, deleteListing);
router.post('/:id/images', authenticate, upload.array('images', 5), uploadListingImages);
router.delete('/:id/images/:imageId', authenticate, deleteListingImage);

export default router;
