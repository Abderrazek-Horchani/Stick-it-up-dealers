const fs = require('fs');
const path = require('path');

// List of all API route files
const routeFiles = [
  'app/api/sales/route.ts',
  'app/api/restock/route.ts',
  'app/api/sales/[userId]/route.ts',
  'app/api/dealer/requests/route.ts',
  'app/api/leaderboard/alltime/route.ts',
  'app/api/leaderboard/weekly/route.ts',
  'app/api/stickers/route.ts',
  'app/api/admin/stats/route.ts',
  'app/api/admin/requests/route.ts',
  'app/api/admin/dealers/route.ts',
  'app/api/admin/requests/[id]/route.ts',
  'app/api/admin/dealers/sync/route.ts'
];

routeFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes("export const dynamic = 'force-dynamic'")) {
      // Find the first import statement
      const lines = content.split('\n');
      let lastImportIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          lastImportIndex = i;
        } else if (lastImportIndex !== -1 && !lines[i].startsWith('import ')) {
          break;
        }
      }
      
      // Insert the dynamic export after the imports
      lines.splice(lastImportIndex + 1, 0, '', "export const dynamic = 'force-dynamic';", '');
      content = lines.join('\n');
      
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${file}`);
    }
  }
});