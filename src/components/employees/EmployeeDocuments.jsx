import React, { useState, useEffect, useRef } from 'react';
import { getIdentityProof, uploadIdentityProof, getIdentityProofFile } from '../../api/identityProof.api';
import { IoDocumentTextOutline, IoCloudUploadOutline, IoAlertCircleOutline, IoCheckmarkCircleOutline, IoCloseOutline, IoImageOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';

const EmployeeDocuments = ({ employeeId }) => {
  const [proof, setProof] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formError, setFormError] = useState(null);

  // Form State
  const [docType, setDocType] = useState('AADHAAR');
  const [docNumber, setDocNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Image Viewer State
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProof();
  }, [employeeId]);

  const fetchProof = async () => {
    setIsLoading(true);
    try {
      const data = await getIdentityProof(employeeId);
      setProof(data);
      if (data) {
        try {
          const fileData = await getIdentityProofFile(employeeId);
          setFileUrl(fileData.url);
        } catch (err) {
          console.error("Failed to load file url", err);
        }
      }
    } catch (err) {
      toast.error('Failed to load identity proof metadata.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFormError(null);
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setFormError('Only JPEG, PNG, or PDF files are allowed.');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setFormError(`File is ${(file.size / (1024 * 1024)).toFixed(1)}MB — max size is 5MB.`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!docType || !docNumber.trim() || !selectedFile) {
      setFormError('Document Type, Document Number, and File are required.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('document_type', docType);
      formData.append('document_number', docNumber.trim());
      formData.append('file', selectedFile);

      await uploadIdentityProof(employeeId, formData, (percent) => {
        setUploadProgress(percent);
      });

      toast.success('Identity proof uploaded successfully.');
      
      // Reset form
      setDocType('AADHAAR');
      setDocNumber(''); // CRITICAL: Discard unmasked number
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowUploadForm(false);
      
      // Refresh metadata
      await fetchProof();
    } catch (err) {
      setFormError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatDocType = (type) => {
    return type.replace(/_/g, ' ');
  };

  const getFileIcon = (mimeType) => {
    return mimeType === 'application/pdf' ? <IoDocumentTextOutline size={16} /> : <IoImageOutline size={16} />;
  };

  if (isLoading) {
    return (
      <div className="mt-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded-2xl w-full"></div>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t border-[#E7E8EE] pt-6">
      <h3 className="font-serif text-lg font-semibold text-[#1C1F2A] mb-4">Identity Proof</h3>
      
      {/* Upload Form */}
      {showUploadForm ? (
        <div className="bg-[#F4F5F8] border border-[#E7E8EE] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-[#1C1F2A]">{proof ? 'Replace Document' : 'Upload Document'}</h4>
            <button 
              onClick={() => { setShowUploadForm(false); setFormError(null); }}
              disabled={isUploading}
              className="p-1 hover:bg-[#E7E8EE] rounded-lg transition-colors disabled:opacity-50"
            >
              <IoCloseOutline size={20} />
            </button>
          </div>

          {formError && (
            <div className="mb-4 p-3 bg-[#C1443A]/10 border border-[#C1443A]/20 rounded-lg flex items-start gap-2">
              <IoAlertCircleOutline className="text-[#C1443A] shrink-0 mt-0.5" size={18} />
              <div className="text-[#C1443A] text-sm">{formError}</div>
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1C1F2A] mb-1">Document Type *</label>
                <select 
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  disabled={isUploading}
                  className="w-full px-3 py-2 border border-[#E7E8EE] rounded-xl focus:outline-none focus:border-[#C9A227] text-sm"
                >
                  <option value="AADHAAR">Aadhaar</option>
                  <option value="PAN">PAN</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#1C1F2A] mb-1">Document Number *</label>
                <input 
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  disabled={isUploading}
                  placeholder="Enter full number"
                  className="w-full px-3 py-2 border border-[#E7E8EE] rounded-xl focus:outline-none focus:border-[#C9A227] text-sm"
                />
                <p className="text-[10px] text-[#6B7280] mt-1 leading-tight">
                  This is only used to verify the document and is never shown in full afterward.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1C1F2A] mb-1">File *</label>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={isUploading}
                accept=".jpg,.jpeg,.png,.pdf"
                className="w-full text-sm text-[#6B7280] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#C9A227]/10 file:text-[#C9A227] hover:file:bg-[#C9A227]/20 file:cursor-pointer transition-colors"
              />
            </div>

            {isUploading && (
              <div className="w-full bg-[#E7E8EE] rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className="bg-[#C9A227] h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button 
                type="submit"
                disabled={isUploading}
                className="px-4 py-2 bg-[#C9A227] text-white text-sm font-semibold rounded-lg hover:bg-[#B49122] transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading {uploadProgress}%
                  </>
                ) : (
                  'Submit Document'
                )}
              </button>
            </div>
          </form>
        </div>
      ) : proof ? (
        /* Proof Exists Card with Inline Preview */
        <div className="bg-white border border-[#E7E8EE] rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
          <div className="p-5 md:w-1/2 border-b md:border-b-0 md:border-r border-[#E7E8EE]">
            <div className="grid grid-cols-[100px_1fr] gap-y-3 gap-x-4 text-sm">
              <div className="text-[#6B7280]">Type:</div>
              <div className="font-semibold text-[#1C1F2A]">{formatDocType(proof.document_type)}</div>
              
              <div className="text-[#6B7280]">Number:</div>
              <div className="font-mono text-[#1C1F2A]">{proof.masked_document_number}</div>
              
              <div className="text-[#6B7280]">File:</div>
              <div className="flex items-center gap-1.5 text-[#1C1F2A]">
                {getFileIcon(proof.mime_type)}
                <span className="truncate max-w-[200px]" title={proof.original_filename}>{proof.original_filename}</span>
              </div>
              
              <div className="text-[#6B7280]">Uploaded:</div>
              <div className="text-[#1C1F2A]">{new Date(proof.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
            
            <div className="mt-5 flex items-center gap-3">
              <button 
                onClick={() => setShowUploadForm(true)}
                className="px-4 py-1.5 text-[#C9A227] text-sm font-semibold hover:bg-[#C9A227]/10 rounded-lg transition-colors"
              >
                Replace Identity Proof
              </button>
            </div>
          </div>
          
          <div className="p-5 md:w-1/2 bg-[#F4F5F8]/50 flex items-center justify-center min-h-[220px]">
            {fileUrl ? (
              proof.mime_type.startsWith('image/') ? (
                <img 
                  src={fileUrl} 
                  alt="Identity Proof" 
                  onClick={() => setIsViewerOpen(true)}
                  className="max-w-full max-h-[180px] object-contain rounded-lg shadow-sm border border-[#E7E8EE] bg-white cursor-pointer hover:opacity-90 transition-opacity" 
                  title="Click to enlarge"
                />
              ) : (
                <a 
                  href={fileUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex flex-col items-center gap-3 text-[#C9A227] hover:text-[#B49122] transition-colors bg-white p-6 rounded-xl shadow-sm border border-[#E7E8EE]"
                >
                  <IoDocumentTextOutline size={48} />
                  <span className="font-semibold text-sm">View PDF Document</span>
                </a>
              )
            ) : (
              <div className="animate-pulse flex flex-col items-center gap-2 text-[#6B7280]">
                <IoImageOutline size={40} className="opacity-50" />
                <span className="text-sm font-medium">Loading preview...</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* No Proof Empty State */
        <div className="border border-dashed border-[#E7E8EE] rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-gray-50/50">
          <div className="h-12 w-12 bg-white border border-[#E7E8EE] rounded-full flex items-center justify-center text-[#6B7280] mb-3">
            <IoDocumentTextOutline size={24} />
          </div>
          <p className="text-[#1C1F2A] font-semibold mb-1">No identity proof uploaded yet</p>
          <p className="text-[#6B7280] text-sm mb-4">Required for payroll and compliance.</p>
          <button 
            onClick={() => setShowUploadForm(true)}
            className="px-4 py-2 bg-[#C9A227] text-white text-sm font-semibold rounded-lg hover:bg-[#B49122] transition-colors flex items-center gap-2 shadow-sm"
          >
            <IoCloudUploadOutline size={18} /> Add Identity Proof
          </button>
        </div>
      )}

      {/* Image Viewer Modal */}
      {isViewerOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#12141C]/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsViewerOpen(false)}></div>
          <div className="relative z-10 w-full max-w-4xl bg-[#12141C] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-screen">
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#12141C]">
              <h3 className="font-semibold text-white truncate pr-4">{proof?.original_filename}</h3>
              <button 
                onClick={() => setIsViewerOpen(false)}
                className="p-1 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              >
                <IoCloseOutline size={24} />
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAACVJREFUKFNjZCASMDKgAhjR1cDQAAz///+HuB7B1U1B1U08BQAAPxQK+wYn7c8AAAAASUVORK5CYII=')] bg-repeat min-h-[50vh]">
              <img 
                src={fileUrl} 
                alt="Document View" 
                className="max-w-full max-h-[75vh] object-contain bg-white shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDocuments;
