// Test storage bucket setup
// This file helps verify the knowledge-files bucket exists and is accessible

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function testStorageBucket() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // List all buckets
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
      return;
    }

    console.log("Available buckets:", buckets?.map((b) => b.name) || []);

    const hasKnowledgeBucket = buckets?.some(
      (b) => b.name === "knowledge-files",
    );
    console.log("Has knowledge-files bucket:", hasKnowledgeBucket);

    if (!hasKnowledgeBucket) {
      console.log("\n❌ knowledge-files bucket not found!");
      console.log(
        "Create it in Supabase Dashboard: Storage → New Bucket → Name: knowledge-files → Private",
      );
      return;
    }

    // Try a test upload
    const testFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });
    const testPath = "test/test.txt";

    console.log(
      `\nTesting upload to knowledge-files bucket at path: ${testPath}`,
    );

    const { error: uploadError } = await supabase.storage
      .from("knowledge-files")
      .upload(testPath, testFile, { upsert: true });

    if (uploadError) {
      console.error("❌ Upload test failed:", uploadError);
      return;
    }

    console.log("✅ Upload test successful!");

    // Try to delete test file
    await supabase.storage.from("knowledge-files").remove([testPath]);
  } catch (error) {
    console.error("Error testing storage:", error);
  }
}
