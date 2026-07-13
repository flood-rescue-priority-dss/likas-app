import Modal from '../ui/Modal';

interface AttachmentLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  date: string;
  time: string;
  loggedBy: string;
  street: string;
}

export default function AttachmentLightboxModal({
  isOpen,
  onClose,
  imageUrl,
  date,
  time,
  loggedBy,
  street
}: AttachmentLightboxModalProps) {
  const fullImageUrl = imageUrl.startsWith('http') 
    ? imageUrl 
    : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${imageUrl}`;

  return (
    <Modal open={isOpen} onClose={onClose} title="Incident Attachment" size="md">
      {/* Subtitle with location and date */}
      <div className="mb-4">
        <p className="text-sm font-inter text-gray-500">
          {street} • {date} at {time}
        </p>
      </div>

      {/* Image Display */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-4">
        <img
          src={fullImageUrl}
          alt="Incident attachment"
          className="w-full h-auto rounded-lg"
        />
      </div>

      {/* Open in New Tab Button */}
      <div className="flex justify-end">
        <a
          href={fullImageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-[#1B75BC] hover:bg-[#155a91] text-white text-sm font-heading font-semibold rounded-lg transition-colors"
        >
          Open in New Tab
        </a>
      </div>
    </Modal>
  );
}
