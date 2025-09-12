import express from "express";
import { searchDocuments, getTagSuggestions, uploadDocument, getAllDocuments, updateDocument, getSingleDocument,  } from "../controllers/documentController";

const router = express.Router();


router.get("/", getAllDocuments);
router.get("/search", searchDocuments);
router.get("/tags", getTagSuggestions); // optional

router.post("/upload", uploadDocument);
router.get("/:id", getSingleDocument);
router.put("/:id", updateDocument);


export default router;
