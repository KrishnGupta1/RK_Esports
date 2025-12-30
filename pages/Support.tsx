import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, Input, Button } from '../components/UI';
import { MessageSquare } from 'lucide-react';

const Support: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to add to 'tickets' collection in Firestore would go here
    // For now, mock success
    setTimeout(() => {
      setSubmitted(true);
      setSubject('');
      setMessage('');
    }, 1000);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Support</h2>

        {submitted ? (
          <Card className="text-center py-10 bg-green-500/10 border-green-500/50">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-xl font-bold text-white">Ticket Created!</h3>
            <p className="text-gray-400 mt-2 px-6">
              Our staff will review your query and get back to you shortly.
            </p>
            <Button className="mt-6 w-auto px-8" onClick={() => setSubmitted(false)}>Create New Ticket</Button>
          </Card>
        ) : (
          <Card>
             <p className="text-sm text-gray-400 mb-6">
               Having trouble? Describe your issue below. Please include Match ID for tournament issues.
             </p>
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
                 <textarea 
                   className="w-full bg-brand-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 min-h-[120px]"
                   value={message}
                   onChange={(e) => setMessage(e.target.value)}
                   placeholder="Describe your issue..."
                   required
                 ></textarea>
               </div>
               <Button type="submit">Submit Ticket</Button>
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