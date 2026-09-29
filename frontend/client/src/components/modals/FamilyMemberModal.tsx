import React, { useState, useEffect } from 'react';
import { X, Users, UserPlus, Heart, Phone, Mail, Sparkles } from 'lucide-react';
import { FamilyMember } from '../../types/portal';
import { familyMembersApi, FamilyMemberInput } from '../../api/familyMembers';

interface FamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: FamilyMember | null;
  onSaved: (member: FamilyMember) => void;
}

const RELATIONSHIPS = [
  'Spouse',
  'Son',
  'Daughter',
  'Father',
  'Mother',
  'Brother',
  'Sister',
  'Grandparent',
  'Other',
];

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export const FamilyMemberModal: React.FC<FamilyMemberModalProps> = ({
  isOpen,
  onClose,
  memberToEdit,
  onSaved,
}) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Spouse');
  const [age, setAge] = useState<number | ''>('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('Male');
  const [emergencyContact, setEmergencyContact] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (memberToEdit) {
      setName(memberToEdit.name || '');
      setRelationship(memberToEdit.relationship || 'Spouse');
      setAge(memberToEdit.age ?? '');
      setPhone(memberToEdit.phone || '');
      setEmail(memberToEdit.email || '');
      setGender(memberToEdit.gender || 'Male');
      setEmergencyContact(Boolean(memberToEdit.emergency_contact));
    } else {
      setName('');
      setRelationship('Spouse');
      setAge('');
      setPhone('');
      setEmail('');
      setGender('Male');
      setEmergencyContact(false);
    }
    setErrorMsg('');
  }, [memberToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const payload: FamilyMemberInput = {
      name: name.trim(),
      relationship,
      age: age === '' ? undefined : Number(age),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      gender,
      emergency_contact: emergencyContact,
    };

    try {
      let savedMember: FamilyMember;
      if (memberToEdit) {
        savedMember = await familyMembersApi.updateFamilyMember(memberToEdit.id, payload);
      } else {
        savedMember = await familyMembersApi.createFamilyMember(payload);
      }
      onSaved(savedMember);
      onClose();
    } catch (err: any) {
      console.error('Error saving family member:', err);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setErrorMsg(detail.map((d: any) => d.msg || d.loc?.join('.')).join(', '));
      } else {
        setErrorMsg(detail || 'Failed to save family member. Please check input values.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-[#15161b] border border-white/15 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#CCFF00]/15 text-[#CCFF00]">
              <Users size={20} />
            </div>
            <div>
              <span className="text-[#CCFF00] font-mono text-[10px] font-bold tracking-widest uppercase block">
                Resident Profile
              </span>
              <h3 className="font-display text-xl font-bold">
                {memberToEdit ? 'Edit Family Member' : 'Add Family Member'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00] transition-colors"
            />
          </div>

          {/* Relationship & Age */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Relationship *
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#1c1e24] border border-white/10 text-sm text-white focus:outline-none focus:border-[#CCFF00]"
              >
                {RELATIONSHIPS.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Age
              </label>
              <input
                type="number"
                min={0}
                max={125}
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 24"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]"
              />
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Email (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Gender
            </label>
            <div className="grid grid-cols-4 gap-2">
              {GENDERS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-2 px-2 text-center rounded-xl text-xs font-semibold border transition-all ${
                    gender === g
                      ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                      : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Emergency Contact Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer hover:bg-white/[0.06] transition-colors">
              <input
                type="checkbox"
                checked={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.checked)}
                className="w-4 h-4 rounded accent-[#CCFF00]"
              />
              <div className="text-xs">
                <span className="font-bold text-white block">Emergency Contact</span>
                <span className="text-zinc-400 text-[11px]">Allow society security to contact in case of primary resident unavailability</span>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-6 rounded-xl bg-[#CCFF00] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#bceb00] disabled:opacity-50 transition-colors shadow-lg shadow-[#CCFF00]/20"
            >
              {isSubmitting ? 'Saving...' : memberToEdit ? 'Update Member' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
