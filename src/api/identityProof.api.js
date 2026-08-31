import { identityProofsMock } from '../mocks/identityProofs.mock';
import { currentUser } from '../mocks/employees.mock';

let identityProofs = [...identityProofsMock];

export const __forceIdentityError = false;

const delay = () => new Promise(resolve => setTimeout(resolve, 500));

export const getIdentityProof = async (employeeId) => {
  await delay();
  if (__forceIdentityError) throw new Error('Failed to fetch identity proof metadata.');
  
  const proof = identityProofs.find(p => p.employee === employeeId);
  return proof || null;
};

export const uploadIdentityProof = async (employeeId, formData, onProgress) => {
  // formData expects { document_type, document_number, file }
  const docType = formData.get('document_type');
  const docNumber = formData.get('document_number');
  const file = formData.get('file');

  if (!docType || !docNumber || !file) {
    throw new Error('Missing required fields for identity proof upload.');
  }
  
  // Simulate progress
  if (onProgress) {
    onProgress(10);
    await new Promise(r => setTimeout(r, 400));
    onProgress(45);
    await new Promise(r => setTimeout(r, 400));
    onProgress(85);
    await new Promise(r => setTimeout(r, 400));
    onProgress(100);
  }

  if (__forceIdentityError) throw new Error('Upload failed due to network error.');

  // Create masked number for storage/client response
  const maskedLength = Math.max(0, docNumber.length - 4);
  const maskedNumber = '*'.repeat(maskedLength) + docNumber.slice(-4);

  const newProof = {
    id: Math.max(...identityProofs.map(p => p.id), 0) + 1,
    employee: employeeId,
    document_type: docType,
    masked_document_number: maskedNumber,
    original_filename: file.name,
    mime_type: file.type,
    file_size: file.size,
    uploaded_by: currentUser.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Replace if exists
  const existingIndex = identityProofs.findIndex(p => p.employee === employeeId);
  if (existingIndex > -1) {
    newProof.id = identityProofs[existingIndex].id; // keep same ID for replace
    identityProofs[existingIndex] = newProof;
  } else {
    identityProofs.push(newProof);
  }

  return newProof;
};

export const getIdentityProofFile = async (employeeId) => {
  await delay();
  if (__forceIdentityError) throw new Error('Failed to fetch document URL.');

  const proof = identityProofs.find(p => p.employee === employeeId);
  if (!proof) throw new Error('Document not found.');

  // Return a placeholder URL based on type
  if (proof.mime_type.startsWith('image/')) {
    return { url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80' }; // Placeholder generic document image
  } else {
    // Placeholder PDF
    return { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' };
  }
};
