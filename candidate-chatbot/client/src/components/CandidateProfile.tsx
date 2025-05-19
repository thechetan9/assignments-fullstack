import React from 'react';
import { useConversation } from '../context/ConversationContext';

const CandidateProfile: React.FC = () => {
  const { candidateProfile } = useConversation();

  if (!candidateProfile) {
    return <div className="candidate-profile">No profile information yet</div>;
  }

  return (
    <div className="candidate-profile">
      <h2>Candidate Profile</h2>
      <div className="profile-info">
        {candidateProfile.name && (
          <div className="profile-item">
            <strong>Name:</strong> {candidateProfile.name}
          </div>
        )}
        {candidateProfile.email && (
          <div className="profile-item">
            <strong>Email:</strong> {candidateProfile.email}
          </div>
        )}
        {candidateProfile.currentRole && (
          <div className="profile-item">
            <strong>Current Role:</strong> {candidateProfile.currentRole}
          </div>
        )}
        {candidateProfile.yearsOfExperience !== undefined && (
          <div className="profile-item">
            <strong>Experience:</strong> {candidateProfile.yearsOfExperience} years
          </div>
        )}
        {candidateProfile.skills && candidateProfile.skills.length > 0 && (
          <div className="profile-item">
            <strong>Skills:</strong> {candidateProfile.skills.join(', ')}
          </div>
        )}
        {candidateProfile.education && (
          <div className="profile-item">
            <strong>Education:</strong> {candidateProfile.education}
          </div>
        )}
        {candidateProfile.location && (
          <div className="profile-item">
            <strong>Location:</strong> {candidateProfile.location}
          </div>
        )}
        {candidateProfile.expectedSalary && (
          <div className="profile-item">
            <strong>Expected Salary:</strong> {candidateProfile.expectedSalary}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateProfile;