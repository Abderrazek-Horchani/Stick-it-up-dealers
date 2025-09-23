const fs = require('fs');
const path = require('path');

const apiDir = path.join(process.cwd(), 'app', 'api');

function findTsFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findTsFiles(fullPath));
    } else if (entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

function updatePrismaImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Replace direct PrismaClient import and instantiation
  const updatedContent = content
    .replace(/import\s*{\s*PrismaClient\s*}\s*from\s*["']@prisma\/client["'];?\n?/, '')
    .replace(/const\s+prisma\s*=\s*new\s+PrismaClient\(\);?\n?/, '')
    .replace(/\/\/ Import prisma client\n?/, '');

  // Add new import if it uses prisma and doesn't already have the import
  if (content.includes('prisma.') && !content.includes("import { prisma }")) {
    const importStatement = `import { prisma } from "@/lib/prisma";\n`;
    const insertPosition = content.search(/^import/m);
    if (insertPosition === -1) {
      // No imports found, add at the beginning
      fs.writeFileSync(filePath, importStatement + updatedContent);
    } else {
      // Add after last import
      const lines = updatedContent.split('\n');
      let lastImportIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          lastImportIndex = i;
        }
      }
      if (lastImportIndex !== -1) {
        lines.splice(lastImportIndex + 1, 0, importStatement);
        fs.writeFileSync(filePath, lines.join('\n'));
      }
    }
  } else {
    fs.writeFileSync(filePath, updatedContent);
  }
}

const tsFiles = findTsFiles(apiDir);
tsFiles.forEach(updatePrismaImports);