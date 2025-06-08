import express from "express";
import { searchDocuments, getTagSuggestions } from "../controllers/documentController";

const router = express.Router();

router.get("/search", searchDocuments);
router.get("/tags", getTagSuggestions); // optional

export default router;
