
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, Input, Button, TextArea } from '../components/UI';
import { MessageSquare, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxbcjU71sjaELrdnjX_yIHlYDPJNbnOPo9telCTUDuiC8J4B8GWRzJDErYnKGMC1J3_bw/exec";

// SVGs for Logos
const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
       const str = reader.result as string;
       // Remove prefix like "data:image/jpeg;base64,"
       if(str.includes(',')) {
         resolve(str.split(',')[1]);
       } else {
         resolve(str);
       }
    };
    reader.onerror = error => reject(error);
  });
};

const Support: React.FC = () => {
  const { userProfile } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Community Links
  const WHATSAPP_LINK = "https://chat.whatsapp.com/H6QE7np6vVdBDuNAE0VW4B";
  const TELEGRAM_LINK = "https://t.me/+T8gGZkVbZyM2ZDQ1";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let uploadedImageUrl = 'No Attachment';

      // 1. Upload Image if present
      if (image) {
         const base64Str = await fileToBase64(image);
         const imgPayload = {
             type: 'image',
             image: base64Str,
             uid: userProfile?.uid || 'guest'
         };
         
         const imgRes = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            redirect: "follow",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(imgPayload)
         });
         
         if(imgRes.ok) {
             const imgData = await imgRes.json();
             // Assuming backend returns the url in 'url' or 'response' field
             uploadedImageUrl = imgData.url || imgData.response || imgData.text || 'Upload Failed';
         }
      }

      // 2. Submit Ticket
      const ticketPayload = {
        uid: userProfile?.uid || 'unknown',
        role: userProfile?.role || 'user',
        name: userProfile?.name || 'User',
        message: `[SUPPORT TICKET]\nSubject: ${subject}\nDetails: ${message}\nAttachment: ${uploadedImageUrl}`,
        type: 'support_ticket', // Logs to Google Sheet
      };

      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(ticketPayload)
      });

      setSubmitted(true);
      setSubject('');
      setMessage('');
      removeImage();
    } catch (error) {
      console.error("Support API Error:", error);
      alert("Failed to submit ticket. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Support</h2>
        
        {/* Instant Support Channels */}
        <div className="grid grid-cols-2 gap-4">
           <a 
             href={WHATSAPP_LINK}
             target="_blank"
             rel="noreferrer"
             className="bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-green-900/20"
           >
             <div className="p-2 bg-white/20 rounded-full">
               <WhatsAppIcon />
             </div>
             <span className="font-bold text-sm">Join Group</span>
           </a>

           <a 
             href={TELEGRAM_LINK}
             target="_blank"
             rel="noreferrer"
             className="bg-[#0088cc] hover:bg-[#0077b5] text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-900/20"
           >
             <div className="p-2 bg-white/20 rounded-full">
               <TelegramIcon />
             </div>
             <span className="font-bold text-sm">Join Channel</span>
           </a>
        </div>

        {submitted ? (
          <Card className="text-center py-10 bg-green-500/10 border-green-500/50">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-xl font-bold text-white">Ticket Created!</h3>
            <p className="text-gray-400 mt-2 px-6">
              Our staff has received your query. We will check the logs and respond shortly.
            </p>
            <Button className="mt-6 w-auto px-8" onClick={() => setSubmitted(false)}>Create New Ticket</Button>
          </Card>
        ) : (
          <Card>
             <div className="mb-6">
               <h3 className="font-bold text-lg text-white mb-1">Create Ticket</h3>
               <p className="text-sm text-gray-400">
                 Having trouble? Describe your issue below. Please include Match ID for tournament issues.
               </p>
             </div>
             
             <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
                 <Input 
                   value={subject}
                   onChange={(e) => setSubject(e.target.value)}
                   placeholder="e.g. Withdrawal Issue"
                   required
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                 <TextArea 
                   value={message}
                   onChange={(e) => setMessage(e.target.value)}
                   placeholder="Describe your issue..."
                   required
                 />
               </div>

               {/* Image Upload */}
               <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Attachment (Optional)</label>
                  {!image ? (
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="border border-dashed border-white/20 bg-brand-900/50 rounded-xl p-4 flex items-center justify-center gap-2 text-gray-400 hover:text-white hover:border-brand-500/50 transition-colors">
                        <ImageIcon size={20} />
                        <span className="text-sm font-medium">Click to upload screenshot</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-white/20 group">
                      <img src={imagePreview!} alt="Preview" className="w-full h-32 object-cover" />
                      <button 
                        type="button" 
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-black/60 p-1 rounded-full text-white hover:bg-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-white truncate px-3">
                        {image.name}
                      </div>
                    </div>
                  )}
               </div>

               <Button type="submit" disabled={loading} className="mt-2">
                 {loading ? <Loader2 className="animate-spin mx-auto" /> : 'SUBMIT TICKET'}
               </Button>
             </form>
          </Card>
        )}
        
        <div className="mt-8 pt-8 border-t border-gray-700">
           <h4 className="font-bold text-white mb-2">FAQ</h4>
           <div className="space-y-2">
             <details className="bg-brand-800 rounded-lg p-3 open:bg-brand-700 cursor-pointer">
               <summary className="font-medium text-sm text-gray-200">How to add money?</summary>
               <p className="text-xs text-gray-400 mt-2 pl-4">Contact admin via WhatsApp or create a ticket requesting bank details.</p>
             </details>
             <details className="bg-brand-800 rounded-lg p-3 open:bg-brand-700 cursor-pointer">
               <summary className="font-medium text-sm text-gray-200">Can I change my FF UID?</summary>
               <p className="text-xs text-gray-400 mt-2 pl-4">No. Once set, UIDs are locked to prevent cheating. Contact support for exceptional cases.</p>
             </details>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default Support;
