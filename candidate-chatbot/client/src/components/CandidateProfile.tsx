import React from 'react';
import { useConversation } from '../context/ConversationContext';

const CandidateProfile: React.FC = () => {
  const { candidateProfile } = useConversation();
  
  if (!candidateProfile || Object.keys(candidateProfile).length === 0) {
    return (
      <div className="candidate-profile">
        <h2>Candidate Profile</h2>
        <p className="profile-empty">No information collected yet. Continue the conversation to learn more about the candidate.</p>
      </div>
    );
  }
  
  const {
    name,
    email,
    currentRole,
    yearsOfExperience,
    skills,
    education,
    location,
    expectedSalary
  } = candidateProfile;
  
  const completionPercentage = calculateCompletionPercentage(candidateProfile);
  
  return (
    <div className="candidate-profile">
      <h2>Candidate Profile</h2>
      <div className="profile-completion">
        <div className="completion-bar">
          <div 
            className="completion-fill" 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <span>{completionPercentage}% Complete</span>
      </div>
      
      <div className="profile-fields">
        {name && (
          <div className="profile-field">
            <h3>Name</h3>
            <p>{name}</p>
          </div>
        )}
        
        {email && (
          <div className="profile-field">
            <h3>Email</h3>
            <p>{email}</p>
          </div>
        )}
        
        {currentRole && (
          <div className="profile-field">
            <h3>Current Role</h3>
            <p>{currentRole}</p>
          </div>
        )}
        
        {yearsOfExperience !== undefined && (
          <div className="profile-field">
            <h3>Experience</h3>
            <p>{yearsOfExperience} years</p>
          </div>
        )}
        
        {skills && skills.length > 0 && (
          <div className="profile-field">
            <h3>Skills</h3>
            <div className="skills-list">
              {skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}
        
        {education && (
          <div className="profile-field">
            <h3>Education</h3>
            <p>{education}</p>
          </div>
        )}
        
        {location && (
          <div className="profile-field">
            <h3>Location</h3>
            <p>{location}</p>
          </div>
        )}
        
        {expectedSalary && (
          <div className="profile-field">
            <h3>Expected Salary</h3>
            <p>{expectedSalary}</p>
          </div>
        )}
      </div>
      
      {completionPercentage < 50 && (
        <div className="profile-suggestions">
          <h3>Suggested Questions</h3>
          <ul>
            {!skills && <li>Ask about their technical skills</li>}
            {!yearsOfExperience && <li>Ask about their years of experience</li>}
            {!education && <li>Ask about their educational background</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

// Helper function to calculate profile completion percentage
function calculateCompletionPercentage(profile: any): number {
  const fields = [
    'name', 'email', 'currentRole', 'yearsOfExperience', 
    'skills', 'education', 'location', 'expectedSalary'
  ];
  
  const filledFields = fields.filter(field => {
    const value = profile[field];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== '';
  });
  
  return Math.round((filledFields.length / fields.length) * 100);
}

export default CandidateProfile;
