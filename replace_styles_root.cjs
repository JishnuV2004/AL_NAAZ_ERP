const fs = require('fs');
const path = require('path');

const rootPages = ['Advance.jsx', 'Attendance.jsx', 'Salary.jsx'];

rootPages.forEach(file => {
  const filePath = path.join(__dirname, 'src', 'pages', file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Tables wrappers
  content = content.replace(/className="[^"]*overflow-hidden rounded-2xl border border-brand-border bg-white shadow-md[^"]*"/g, 'className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"');
  content = content.replace(/className="[^"]*overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm overflow-x-auto[^"]*"/g, 'className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto overflow-hidden"');
  
  // Table head
  content = content.replace(/className="[^"]*bg-brand-brown text-white text-\[10px\] font-bold tracking-[^"]*uppercase[^"]*"/g, 'className="bg-white text-gray-400 text-[10px] font-bold tracking-wider uppercase border-b border-gray-200"');
  content = content.replace(/className="[^"]*bg-brand-cream\/40 text-brand-text-muted text-xs font-bold tracking-widest uppercase border-b border-brand-border\/60[^"]*"/g, 'className="bg-white text-gray-400 text-[10px] font-bold tracking-wider uppercase border-b border-gray-200"');
  
  // tbody
  content = content.replace(/<tbody className="divide-y divide-brand-border\/60">/g, '<tbody className="divide-y divide-gray-100">');

  // row hover
  content = content.replace(/hover:bg-brand-cream\/25/g, 'hover:bg-gray-50');
  content = content.replace(/hover:bg-brand-cream\/20/g, 'hover:bg-gray-50');

  // primary CTA button styles
  content = content.replace(/bg-brand-gold/g, 'bg-[#1E5E45]');
  content = content.replace(/text-brand-brown/g, 'text-gray-900'); // wait, for button text we want text-white
  // manually fixing the button text
  content = content.replace(/text-gray-900 hover:bg-brand-gold-hover/g, 'text-white hover:bg-[#164a35]');
  content = content.replace(/hover:bg-brand-gold-hover/g, 'hover:bg-[#164a35]');
  content = content.replace(/hover:shadow-brand-gold\/15/g, 'hover:shadow-sm');
  content = content.replace(/focus:border-brand-gold/g, 'focus:border-[#1E5E45]');
  content = content.replace(/focus:ring-brand-gold/g, 'focus:ring-[#1E5E45]');
  content = content.replace(/text-brand-gold/g, 'text-[#1E5E45]');
  content = content.replace(/border-brand-gold/g, 'border-[#1E5E45]');

  // Colors
  content = content.replace(/text-brand-text-muted/g, 'text-gray-500');
  content = content.replace(/text-brand-text/g, 'text-gray-900');
  
  // Borders and bgs
  content = content.replace(/border-brand-border\/60/g, 'border-gray-100');
  content = content.replace(/border-brand-border/g, 'border-gray-200');
  content = content.replace(/bg-brand-cream\/30/g, 'bg-gray-50');
  content = content.replace(/bg-brand-cream\/10/g, 'bg-gray-50');
  content = content.replace(/bg-brand-cream\/40/g, 'bg-gray-50');
  content = content.replace(/bg-brand-cream\/50/g, 'bg-gray-50');
  content = content.replace(/bg-brand-cream/g, 'bg-gray-100');

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Replaced table styles in remaining pages.');
