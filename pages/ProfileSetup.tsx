import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Card } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Info } from 'lucide-react';
import { AIAssistant } from '../components/AIAssistant';

const ProfileSetup: React.FC = () => {
  const { userProfile, currentUser, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [ffUid, setFfUid] = useState('');
  const [ffName, setFfName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Protect the route logic
  if (!userProfile) return null; // Or loading spinner

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Sanitize inputs
    const cleanUid = ffUid.replace(/\s/g, ''); // Remove spaces
    const cleanName = ffName.trim();

    if (!cleanUid.match(/^\d+$/)) {
      setError('Free Fire UID must contain numbers only.');
      return;
    }
    
    if (cleanName.length < 3) {
      setError('In-Game Name must be at least 3 characters.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await updateUserProfile({
        ffUid: cleanUid,
        ffName: cleanName
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Complete Setup</h1>
          <p className="text-gray-400 text-sm mt-1">Required to join tournaments</p>
        </div>

        <Card>
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg flex gap-3 items-start mb-6">
            <ShieldAlert className="text-yellow-500 shrink-0 mt-0.5" size={20} />
            <p className="text-xs text-yellow-200/80 leading-relaxed">
              <strong className="text-yellow-500 block mb-1">IMPORTANT RULES:</strong>
              1. Enter exact Free Fire UID & Name.<br/>
              2. Details are <strong className="text-white">LOCKED</strong> after submission.<br/>
              3. Wrong details = Disqualification.<br/>
              4. Profile photo cannot be changed.
            </p>
          </div>

          {error && (
             <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Free Fire UID (Number)</label>
              <Input 
                value={ffUid} 
                onChange={(e) => setFfUid(e.target.value)}
                placeholder="e.g. 1234567890"
                inputMode="numeric"
                type="text" 
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">In-Game Name</label>
              <Input 
                value={ffName} 
                onChange={(e) => setFfName(e.target.value)}
                placeholder="e.g. RK_KILLER"
                required
              />
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'SAVING PROFILE...' : 'SAVE & LOCK PROFILE'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
      
      {/* AI Assistant available on setup screen */}
      <AIAssistant />
    </div>
  );
};

export default ProfileSetup;