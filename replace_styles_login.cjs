const fs = require('fs');
const path = require('path');

const rootPages = ['Login.jsx'];

rootPages.forEach(file => {
  const filePath = path.join(__dirname, 'src', 'pages', file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // primary CTA button styles
  content = content.replace(/bg-brand-gold/g, 'bg-[#1E5E45]');
  content = content.replace(/text-brand-brown/g, 'text-gray-900'); // wait, for button text we want text-white
  // manually fixing the button text
  content = content.replace(/text-gray-900 hover:bg-brand-gold-hover/g, 'text-white hover:bg-[#164a35]');
  content = content.replace(/hover:bg-brand-gold-hover/g, 'hover:bg-[#164a35]');
  content = content.replace(/hover:shadow-brand-gold\/20/g, 'hover:shadow-sm');
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
  content = content.replace(/bg-brand-cream/g, 'bg-[#FAFAF9]');

  // Fix button text to white
  content = content.replace(/text-gray-900 bg-\[#1E5E45\]/g, 'text-white bg-[#1E5E45]');

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Replaced styles in Login page.');
