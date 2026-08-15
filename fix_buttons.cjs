const fs = require('fs');
const path = require('path');

const inventoryDir = path.join(__dirname, 'src', 'pages', 'Inventory');
const files = fs.readdirSync(inventoryDir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(inventoryDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix primary buttons using brand-gold
  content = content.replace(/bg-brand-gold([^>]*?)text-gray-900/g, 'bg-brand-gold$1text-brand-brown');
  
  // Fix tabs/buttons in index.jsx
  if (file === 'index.jsx') {
    content = content.replace(/border-gray-200 bg-white text-gray-900 hover:bg-gray-100\/50/g, 'border-brand-border bg-white text-brand-text hover:bg-brand-cream/50');
    content = content.replace(/text-gray-900 text-base/g, 'text-brand-text text-base');
    content = content.replace(/text-gray-500 leading-snug/g, 'text-brand-text-muted leading-snug');
    content = content.replace(/border border-gray-200 bg-white p-5/g, 'border border-brand-border bg-white p-5');
    content = content.replace(/hover:border-\[#1E5E45\]\/50/g, 'hover:border-brand-gold/50');
    content = content.replace(/text-gray-300 transition-colors group-hover:text-\[#1E5E45\]/g, 'text-brand-border transition-colors group-hover:text-brand-gold');
  }

  // Fix inputs and search bars
  content = content.replace(/border border-gray-200 bg-gray-50([^>]*?)text-gray-900/g, 'border border-brand-border bg-brand-cream/30$1text-brand-text');
  
  // Fix other inputs
  content = content.replace(/border-gray-200 px-4 py-2.5 text-sm/g, 'border-brand-border px-4 py-2.5 text-sm');
  
  // Fix select
  content = content.replace(/border border-gray-200 px-3 py-2 text-sm text-gray-900/g, 'border border-brand-border px-3 py-2 text-sm text-brand-text');

  // Fix secondary/cancel buttons
  content = content.replace(/border-gray-200 px-5 py-2\.5 text-sm font-medium text-gray-900 hover:bg-gray-50/g, 'border-brand-border px-5 py-2.5 text-sm font-medium text-brand-text hover:bg-brand-cream/50');

  // Fix table pagination/footer buttons
  content = content.replace(/bg-white border border-gray-200 rounded-lg hover:bg-gray-100/g, 'bg-white border border-brand-border rounded-lg hover:bg-brand-cream');
  
  // Generic modal/footer background
  content = content.replace(/border-gray-100 p-4 flex flex-col sm:flex-row items-center justify-between bg-gray-50/g, 'border-brand-border/60 p-4 flex flex-col sm:flex-row items-center justify-between bg-brand-cream/10');

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Restored button and input colors in Inventory pages.');
