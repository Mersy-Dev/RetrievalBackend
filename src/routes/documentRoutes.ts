import express from "express";
import { searchDocuments, getTagSuggestions, uploadDocument, getAllDocuments, updateDocument, getSingleDocument, deleteDocument,  } from "../controllers/documentController";

const router = express.Router();


router.get("/", getAllDocuments);
router.get("/search", searchDocuments);
router.get("/tags", getTagSuggestions); // optional

router.post("/upload", uploadDocument);
router.get("/:id", getSingleDocument);
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);

export default router;
