export interface JobDescription {
  title: string;
  company: string;
  location: string;
  employmentType: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
}

// Sample job description for demonstration
export const sampleJobDescription: JobDescription = {
  title: "Senior Full Stack Developer",
  company: "RapidWeb Solutions",
  location: "Remote (US-based)",
  employmentType: "Full-time",
  description: "We're looking for a skilled Full Stack Developer to join our growing team...",
  responsibilities: [
    "Develop and maintain web applications using React, Node.js, and TypeScript",
    "Collaborate with cross-functional teams to define and implement new features",
    "Ensure code quality through testing and code reviews"
  ],
  requirements: [
    "3+ years of experience with React and Node.js",
    "Strong TypeScript skills",
    "Experience with RESTful APIs and database design",
    "Bachelor's degree in Computer Science or equivalent experience"
  ],
  benefits: [
    "Competitive salary and equity options",
    "Remote-first work environment",
    "Health, dental, and vision insurance",
    "Flexible PTO policy"
  ]
};