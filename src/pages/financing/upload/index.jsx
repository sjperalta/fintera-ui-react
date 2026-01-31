import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { API_URL } from '../../../../config';
import { getToken } from '../../../../auth';

function Upload() {
  const { paymentId } = useParams(); // Extract paymentId from the URL
  const navigate = useNavigate();

  const [receiptFile, setReceiptFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle file input change
  const handleFileChange = (e) => {
    setReceiptFile(e.target.files[0]);
    setError(''); // Clear previous errors
  };

  // Handle file upload submission
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!receiptFile) {
      setError('Por favor selecciona un archivo.');
      return;
    }

    setIsUploading(true);

    try {
      // Prepare the form data for the upload
      const formData = new FormData();
      formData.append('receipt', receiptFile);

      // Send the file to the backend
      const response = await fetch(`${API_URL}/api/v1/payments/${paymentId}/upload_receipt`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`, // Pass the Bearer token for authentication
        },
        body: formData, // Include the file
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'El comprobante se ha subido exitosamente.');
        setTimeout(() => navigate(-1), 2000); // Redirect back after 2 seconds
      } else {
        setError(data.error || 'Ocurrió un error al subir el comprobante.');
      }
    } catch {
      setError('Error de red. Por favor intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Subir Comprobante de Pago</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-500 mb-4">{success}</div>}

      <form onSubmit={handleUpload}>
        <div className="mb-4">
          <label htmlFor="receipt" className="block text-sm font-medium text-gray-700">
            Selecciona el archivo del comprobante
          </label>
          <input
            type="file"
            id="receipt"
            accept=".pdf,.jpg,.png"
            onChange={handleFileChange}
            className="mt-2 block w-full text-sm text-gray-500 border-gray-300 rounded-md"
          />
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className={`px-4 py-2 rounded bg-blue-500 text-white font-bold ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
        >
          {isUploading ? 'Subiendo...' : 'Subir Comprobante'}
        </button>
      </form>
    </div>
  );
}

export default Upload;