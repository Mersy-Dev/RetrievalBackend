import { Router } from "express";
import { createTranslation, deleteTranslation, documentTranslation, getTranslations, updateTranslation } from "../controllers/translationController";

const router = Router();


router.get("/document/:id", documentTranslation);

router.get("/:lang", getTranslations);
router.get("/:locale", getTranslations);
router.post("/", createTranslation);      // POST /api/translations
router.put("/:id", updateTranslation);    // PUT /api/translations/:id
router.delete("/:id", deleteTranslation); // DELETE /api/translations/:id

export default router;



// Got it 👍 Let’s rewrite your **Postman usage examples** so they match your **current design**, where each translation row has `key`, `locale`, and `value` (instead of `en_text` / `yo_text` in the same row).

// ---

// ### ✅ Example Postman Usage

// #### 1. Get translations

// Fetch all Yoruba translations:

// ```
// GET http://localhost:5000/api/translations/yo
// ```

// Fetch all English translations:

// ```
// GET http://localhost:5000/api/translations/en
// ```

// ---

// #### 2. Create translation

// ```
// POST http://localhost:5000/api/translations
// Content-Type: application/json
// ```

// **Body (English row)**

// ```json
// {
//   "key": "welcome_message",
//   "locale": "en",
//   "value": "Welcome to the app"
// }
// ```

// **Body (Yoruba row)**

// ```json
// {
//   "key": "welcome_message",
//   "locale": "yo",
//   "value": "Kaabo si app yi"
// }
// ```

// ---

// #### 3. Update translation

// Update the value for `welcome_message` in English:

// ```
// PUT http://localhost:5000/api/translations
// Content-Type: application/json
// ```

// **Body**

// ```json
// {
//   "key": "welcome_message",
//   "locale": "en",
//   "value": "Welcome back!"
// }
// ```

// Update the value for `welcome_message` in Yoruba:

// ```json
// {
//   "key": "welcome_message",
//   "locale": "yo",
//   "value": "Kaabo pada!"
// }
// ```

// ---

// #### 4. Delete translation

// Delete a specific translation row (by `key` + `locale`):

// ```
// DELETE http://localhost:5000/api/translations
// Content-Type: application/json
// ```

// **Body**

// ```json
// {
//   "key": "welcome_message",
//   "locale": "yo"
// }
// ```

// ---

// ✅ This way:

// * You can store **English and Yoruba separately**.
// * Update/Delete operations don’t need `id`, they use `key + locale`.

