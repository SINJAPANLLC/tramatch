import { crawlLeadsWithAI } from "../server/lead-crawler";

async function main() {
  console.log("[Crawl] Starting large batch crawl targeting 300 leads...");
  let totalFound = 0;
  
  for (let batch = 1; batch <= 10; batch++) {
    console.log(`[Crawl] === Batch ${batch}/10 starting... (total so far: ${totalFound}) ===`);
    try {
      const result = await crawlLeadsWithAI(100);
      totalFound += result.found;
      console.log(`[Crawl] Batch ${batch} done: searched=${result.searched}, found=${result.found}, cumulative=${totalFound}`);
      if (totalFound >= 200) {
        console.log("[Crawl] Target reached!");
        break;
      }
    } catch (err: any) {
      console.error(`[Crawl] Batch ${batch} error:`, err?.message);
    }
    await new Promise(r => setTimeout(r, 5000));
  }
  
  console.log(`[Crawl] All batches complete. Total new leads found: ${totalFound}`);
  process.exit(0);
}

main();
