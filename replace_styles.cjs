const fs = require('fs');
const path = require('path');

const inventoryDir = path.join(__dirname, 'src', 'pages', 'Inventory');

const files = fs.readdirSync(inventoryDir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(inventoryDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace table wrapper classes
  content = content.replace(/className="[^"]*overflow-hidden rounded-2xl border border-brand-border bg-white shadow-md[^"]*"/g, 'className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"');
  content = content.replace(/className="[^"]*bg-white border border-brand-border rounded-2xl shadow-sm overflow-hidden[^"]*"/g, 'className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"');
  content = content.replace(/className="[^"]*overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm overflow-x-auto[^"]*"/g, 'className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto overflow-hidden"');

  // Replace thead classes
  content = content.replace(/className="[^"]*bg-brand-brown text-white text-\[10px\] font-bold tracking-[^"]*uppercase[^"]*"/g, 'className="bg-white text-gray-400 text-[10px] font-bold tracking-wider uppercase border-b border-gray-200"');
  content = content.replace(/className="[^"]*text-brand-text-muted text-sm font-medium border-b border-brand-border\/60[^"]*"/g, 'className="bg-white text-gray-400 text-[10px] font-bold tracking-wider uppercase border-b border-gray-200"');
  content = content.replace(/className="[^"]*bg-brand-cream\/40 text-brand-text-muted text-xs font-bold tracking-widest uppercase border-b border-brand-border\/60[^"]*"/g, 'className="bg-white text-gray-400 text-[10px] font-bold tracking-wider uppercase border-b border-gray-200"');
  content = content.replace(/className="[^"]*bg-brand-cream\/30 text-brand-text-muted text-\[10px\] font-bold tracking-widest uppercase border-b border-brand-border\/60[^"]*"/g, 'className="bg-white text-gray-400 text-[10px] font-bold tracking-wider uppercase border-b border-gray-200"');
  content = content.replace(/className="[^"]*bg-brand-cream\/40 text-brand-text-muted text-\[10px\] font-bold tracking-widest uppercase border-b border-brand-border\/60[^"]*"/g, 'className="bg-white text-gray-400 text-[10px] font-bold tracking-wider uppercase border-b border-gray-200"');

  // Replace tbody divide
  content = content.replace(/<tbody className="divide-y divide-brand-border\/60">/g, '<tbody className="divide-y divide-gray-100">');

  // Replace row hover
  content = content.replace(/hover:bg-brand-cream\/25/g, 'hover:bg-gray-50');
  content = content.replace(/hover:bg-brand-cream\/20/g, 'hover:bg-gray-50');

  // Replace general text colors
  content = content.replace(/text-brand-text-muted/g, 'text-gray-500');
  content = content.replace(/text-brand-text/g, 'text-gray-900');
  content = content.replace(/text-brand-brown/g, 'text-gray-900');
  
  // Replace generic borders and bg
  content = content.replace(/border-brand-border\/60/g, 'border-gray-100');
  content = content.replace(/border-brand-border/g, 'border-gray-200');
  content = content.replace(/bg-brand-cream\/30/g, 'bg-gray-50');
  content = content.replace(/bg-brand-cream\/10/g, 'bg-gray-50');
  content = content.replace(/bg-brand-cream\/40/g, 'bg-gray-50');
  content = content.replace(/bg-brand-cream\/50/g, 'bg-gray-50');
  content = content.replace(/bg-brand-cream/g, 'bg-gray-100');

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Replaced table styles in Inventory pages.');
