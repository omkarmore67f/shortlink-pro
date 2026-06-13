import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { urlApi } from '../../api/urlApi';
import { getErrorMessage } from '../../api/axiosClient';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  urlId: string | null;
  shortCode?: string;
}

/**
 * QrCodeModal
 *
 * Fetches and displays a QR code (base64 PNG) for a given short URL,
 * with a download button. Fetches fresh on open rather than caching,
 * since QR generation is cheap and the underlying URL could change.
 */
const QrCodeModal = ({ isOpen, onClose, urlId, shortCode }: QrCodeModalProps) => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [shortUrl, setShortUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !urlId) {
      setQrCode(null);
      return;
    }

    const fetchQr = async () => {
      setLoading(true);
      try {
        const { data } = await urlApi.getQrCode(urlId);
        setQrCode(data.data.qrCode);
        setShortUrl(data.data.shortUrl);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchQr();
  }, [isOpen, urlId]);

  const handleDownload = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `qrcode-${shortCode || 'shortlink'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="QR Code">
      <div className="flex flex-col items-center gap-4">
        {loading ? (
          <Spinner />
        ) : qrCode ? (
          <>
            <img src={qrCode} alt="QR Code" className="rounded-lg border border-gray-200 w-56 h-56" />
            <p className="text-sm text-gray-500 break-all text-center">{shortUrl}</p>
            <Button onClick={handleDownload} className="w-full">
              <Download size={16} />
              Download QR Code
            </Button>
          </>
        ) : (
          <p className="text-sm text-gray-500">Unable to load QR code.</p>
        )}
      </div>
    </Modal>
  );
};

export default QrCodeModal;
