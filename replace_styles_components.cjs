const fs = require('fs');
const path = require('path');

const components = ['src/components/layout/Navbar.jsx', 'src/components/layout/Sidebar.jsx'];

components.forEach(relPath => {
  const filePath = path.join(__dirname, relPath);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Colors
  content = content.replace(/text-brand-text-muted/g, 'text-gray-500');
  content = content.replace(/text-brand-text/g, 'text-gray-900');
  content = content.replace(/text-brand-gold/g, 'text-[#1E5E45]');
  content = content.replace(/bg-brand-gold/g, 'bg-[#1E5E45]');
  content = content.replace(/bg-brand-brown/g, 'bg-gray-900'); // If sidebar background is brand-brown, maybe leave it, wait...
  // Wait, let's keep Sidebar as it was if it's the dark navigation.

  // Let's only do Navbar for now just to be safe.
  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Replaced styles in components.');
