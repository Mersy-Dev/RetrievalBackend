import express from "express";
import { searchDocuments, getTagSuggestions, uploadDocument, getAllDocuments,  } from "../controllers/documentController";

const router = express.Router();


router.get("/", getAllDocuments);
router.get("/search", searchDocuments);
router.get("/tags", getTagSuggestions); // optional

router.post("/upload", uploadDocument);


export default router;
