# backend

https://backend-2rgv.onrender.com/api/posts

app.post "/api/posts"

get stored in mediaFiles there are \\
mediaFiles": "[{\"fileLink\":\"https://younghappy.s3.us-east-1.amazonaws.com/images/1789729846419_edit.png\",\"mediaType\":\"image\"}]",

added in
app.get "/api/posts"
parseJsonField method to clean \
const posts = postsData.map((postInstance) => {
const post = postInstance.toJSON();

      // Helper to safely parse double-stringified / escaped JSON arrays
      const parseJsonField = (fieldValue) => {
        if (!fieldValue) return [];
        if (Array.isArray(fieldValue)) return fieldValue;
        if (typeof fieldValue === "string") {
          try {
            const cleaned = fieldValue
              .replace(/\\"/g, '"')
              .replace(/^"|"$/g, "");
            const parsed = JSON.parse(cleaned);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return [];
      };

and in return
mediaFiles: parseJsonField(post.mediaFiles || []),
