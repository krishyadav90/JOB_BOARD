import React from 'react';

function JobCard({ job }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
      <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
      <p className="text-gray-600">{job.company} - {job.location}</p>
      <p className="text-gray-500 mt-2">{job.description}</p>
      <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mt-4">{job.category}</span>
    </div>
  );
}

export default JobCard;