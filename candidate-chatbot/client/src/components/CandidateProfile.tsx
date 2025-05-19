import React from 'react';
import { useConversation } from '../context/ConversationContext';

const CandidateProfile: React.FC = () => {
  const { candidateProfile } = useConversation();

  if (!candidateProfile || Object.keys(candidateProfile).length === 0) {
    return (
      <div className="candidate-profile">
        <h2>Candidate Profile</h2>
        <p className="no-data">No information extracted yet. Continue the conversation to build a profile.</p>
      </div>
    );
  }

  return (
    <div className="candidate-profile">
      <h2>Candidate Profile</h2>
      <div className="profile-content">
        {candidateProfile.name && (
          <div className="profile-item">
            <span className="label">Name:</span>
            <span className="value">{candidateProfile.name}</span>
          </div>
        )}
        {candidateProfile.email && (
          <div className="profile-item">
            <span className="label">Email:</span>
            <span className="value">{candidateProfile.email}</span>
          </div>
        )}
        {candidateProfile.currentRole && (
          <div className="profile-item">
            <span className="label">Current Role:</span>
            <span className="value">{candidateProfile.currentRole}</span>
          </div>
        )}
        {candidateProfile.yearsOfExperience && (
          <div className="profile-item">
            <span className="label">Experience:</span>
            <span className="value">{candidateProfile.yearsOfExperience} years</span>
          </div>
        )}
        {candidateProfile.skills && candidateProfile.skills.length > 0 && (
          <div className="profile-item">
            <span className="label">Skills:</span>
            <span className="value">{candidateProfile.skills.join(', ')}</span>
          </div>
        )}
        {candidateProfile.education && (
          <div className="profile-item">
            <span className="label">Education:</span>
            <span className="value">{candidateProfile.education}</span>
          </div>
        )}
        {candidateProfile.location && (
          <div className="profile-item">
            <span className="label">Location:</span>
            <span className="value">{candidateProfile.location}</span>
          </div>
        )}
        {candidateProfile.expectedSalary && (
          <div className="profile-item">
            <span className="label">Expected Salary:</span>
            <span className="value">{candidateProfile.expectedSalary}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateProfile;
